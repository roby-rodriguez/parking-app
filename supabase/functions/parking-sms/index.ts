// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { connect as connectRedis } from 'https://deno.land/x/redis@v0.29.3/mod.ts';

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
	// Handle CORS preflight requests
	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders });
	}

	try {
		const { uuid, gateNumber } = await req.json();
		
		if (!uuid || !gateNumber) {
			return new Response(
				JSON.stringify({ error: 'Missing uuid or gateNumber' }),
				{ status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
			);
		}

		// Initialize Supabase client
		const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
		const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
		const supabase = createClient(supabaseUrl, supabaseServiceKey);

		// Initialize Redis for rate limiting
		const redisUrl = Deno.env.get('REDIS_URL');
		let redis: any = null;
		if (redisUrl) {
			try {
				redis = await connectRedis(redisUrl);
			} catch (error) {
				console.error('Redis connection failed:', error);
			}
		}

		// Rate limiting (5 attempts per hour per UUID)
		if (redis) {
			const rateLimitKey = `rate_limit:${uuid}`;
			const attempts = await redis.get(rateLimitKey);
			if (attempts && parseInt(attempts) >= 5) {
				return new Response(
					JSON.stringify({ error: 'Rate limit exceeded. Try again later.' }),
					{ status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
				);
			}
			await redis.setex(rateLimitKey, 3600, (parseInt(attempts || '0') + 1).toString());
		}

		// Validate parking access
		const { data: parkingAccess, error: accessError } = await supabase
			.from('parking_access')
			.select('*')
			.eq('uuid', uuid)
			.eq('gate_number', gateNumber)
			.eq('status', 'active')
			.single();

		if (accessError || !parkingAccess) {
			return new Response(
				JSON.stringify({ error: 'Invalid or expired parking access' }),
				{ status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
			);
		}

		// Check if access is within valid time range
		const now = new Date();
		const validFrom = new Date(parkingAccess.valid_from);
		const validTo = new Date(parkingAccess.valid_to);

		if (now < validFrom || now > validTo) {
			return new Response(
				JSON.stringify({ error: 'Parking access is not valid at this time' }),
				{ status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
			);
		}

		// Get Twilio credentials
		const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
		const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
		const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');
		const gatePhoneNumbers = Deno.env.get('GATE_PHONE_NUMBERS')?.split(',') || [];

		if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber || !gatePhoneNumbers[gateNumber - 1]) {
			return new Response(
				JSON.stringify({ error: 'Twilio configuration missing' }),
				{ status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
			);
		}

		// Make Twilio call to open gate
		const gatePhoneNumber = gatePhoneNumbers[gateNumber - 1];
		const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Calls.json`;
		
		const callResponse = await fetch(twilioUrl, {
			method: 'POST',
			headers: {
				'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams({
				'From': twilioPhoneNumber,
				'To': gatePhoneNumber,
				'Url': `${supabaseUrl}/functions/v1/gate-webhook`, // Webhook to handle call completion
				'StatusCallback': `${supabaseUrl}/functions/v1/gate-webhook`,
				'StatusCallbackEvent': 'completed',
				'StatusCallbackMethod': 'POST',
			}),
		});

		if (!callResponse.ok) {
			const errorText = await callResponse.text();
			console.error('Twilio call failed:', errorText);
			return new Response(
				JSON.stringify({ error: 'Failed to open gate' }),
				{ status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
			);
		}

		// Log the action to audit_logs
		const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
		const userAgent = req.headers.get('user-agent') || 'unknown';

		await supabase.from('audit_logs').insert({
			parking_access_id: parkingAccess.id,
			action: 'gate_opened',
			gate_number: gateNumber,
			ip_address: clientIp,
			user_agent: userAgent,
		});

		return new Response(
			JSON.stringify({ 
				status: 'success', 
				message: `Gate ${gateNumber} opening initiated`,
				callSid: (await callResponse.json()).sid 
			}),
			{ status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
		);

	} catch (error) {
		console.error('Error in parking-sms function:', error);
		return new Response(
			JSON.stringify({ error: 'Internal server error' }),
			{ status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
		);
	}
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/parking-sms' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
