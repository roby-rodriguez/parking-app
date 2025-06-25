// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Redis as UpstashRedis } from 'https://deno.land/x/upstash_redis@v1.19.3/mod.ts';

// @ts-nocheck
// deno-lint-ignore-file
/// <reference types="deno" />

const corsHeaders = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Serve both the main function and the TwiML webhook
serve(async (req) => {
	const url = new URL(req.url);

	// TwiML webhook for Twilio call instructions
	if (url.pathname === '/gate-webhook') {
		const ringSeconds = parseInt(Deno.env.get('GATE_RING_SECONDS') || '2', 10);
		const twiml = `<?xml version="1.0" encoding="UTF-8"?>\n<Response>\n  <Pause length="${ringSeconds}"/>\n  <Hangup/>\n</Response>`;
		return new Response(twiml, {
			headers: {
				'Content-Type': 'application/xml',
			},
		});
	}

	// Handle CORS preflight requests
	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders });
	}

	try {
		const { uuid } = await req.json();

		if (!uuid) {
			return new Response(
				JSON.stringify({ error: 'Missing access token (uuid)' }),
				{ status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
			);
		}

		// Initialize Supabase client
		const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
		const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
		const supabase = createClient(supabaseUrl, supabaseServiceKey);

		// Initialize Upstash Redis for rate limiting
		let redis: any = null;
		const upstashUrl = Deno.env.get('UPSTASH_REDIS_REST_URL');
		const upstashToken = Deno.env.get('UPSTASH_REDIS_REST_TOKEN');
		if (upstashUrl && upstashToken) {
			try {
				redis = new UpstashRedis({ url: upstashUrl, token: upstashToken });
			} catch (error) {
				console.error('Upstash Redis init failed:', error);
			}
		}

		// Rate limiting (5 attempts per hour per UUID)
		if (redis) {
			const rateLimitKey = `rate_limit:${uuid}`;
			try {
				// Add explicit logging for debugging
				// console.log(`Checking rate limit for key: ${rateLimitKey}`);
				let attempts = await redis.get(rateLimitKey);
				// console.log(`Current attempts from Redis: ${attempts} (type: ${typeof attempts})`);
				// Handle both string and number returns from Redis
				const currentAttempts = attempts ? parseInt(String(attempts)) : 0;
				// console.log(`Parsed attempts: ${currentAttempts}`);
				if (currentAttempts >= 5) {
					// console.log(`Rate limit exceeded for ${uuid}: ${currentAttempts} attempts`);
					return new Response(JSON.stringify({
						error: 'Rate limit exceeded. Try again later.',
					}), {
						status: 429,
						headers: {
							...corsHeaders,
							'Content-Type': 'application/json',
						},
					});
				}
				// Increment and set with explicit error handling
				const newAttempts = currentAttempts + 1;
				// console.log(`Setting new attempt count: ${newAttempts}`);
				const setResult = await redis.setex(rateLimitKey, 3600, newAttempts.toString());
				// console.log(`Redis setex result:`, setResult);
			} catch (redisError) {
				console.error('Redis operation failed:', redisError);
				// Decide whether to continue without rate limiting or fail
				// For now, let's continue but log the error
				// console.log('Continuing without rate limiting due to Redis error');
			}
		} else {
			console.log('Redis not initialized - skipping rate limiting');
		}

		// Validate parking access and fetch related gate info
		const { data: parkingInfo, error: accessError } = await supabase
			.from('parking_access')
			.select(`
				*,
				parking_lots (
					id,
					name,
					gates (
						id,
						name,
						phone_number
					)
				)
			`)
			.eq('uuid', uuid)
			.single();

		if (accessError || !parkingInfo || !parkingInfo.parking_lots || !parkingInfo.parking_lots.gates) {
			return new Response(
				JSON.stringify({ error: 'Invalid parking access' }),
				{ status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
			);
		}

		// Calculate current status
		const now = new Date();
		const validFrom = new Date(parkingInfo.valid_from);
		const validTo = new Date(parkingInfo.valid_to);
		let currentStatus = 'active';

		// Check if manually revoked
		if (parkingInfo.status === 'revoked') {
			currentStatus = 'revoked';
		}
		// Check if expired
		else if (now > validTo) {
			currentStatus = 'expired';
		}
		// Check if not yet valid
		else if (now < validFrom) {
			currentStatus = 'pending';
		}

		// Only allow active status
		if (currentStatus !== 'active') {
			const errorMessage = currentStatus === 'revoked' 
				? 'Parking access has been revoked'
				: currentStatus === 'expired'
					? 'Parking access has expired'
					: 'Parking access is not yet valid';

			return new Response(
				JSON.stringify({ error: errorMessage }),
				{ status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
			);
		}

		// Get Twilio credentials
		const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
		const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
		const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');
		const gatePhoneNumber = parkingInfo.parking_lots.gates.phone_number;

		if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber || !gatePhoneNumber) {
			console.error('Twilio or Gate phone number configuration is missing.');
			return new Response(
				JSON.stringify({ error: 'System configuration error.' }),
				{ status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
			);
		}

		// Make Twilio call to open gate (original fetch version)
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
				'Url': `${supabaseUrl}/functions/v1/parking-sms/gate-webhook`,
			}),
		});

		if (!callResponse.ok) {
			const errorText = await callResponse.text();
			console.error('Twilio call failed:', errorText);
			return new Response(
				JSON.stringify({ error: 'Failed to open gate' }),
				{ status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
			);
		}

		// Log the action to audit_logs
		const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
		const userAgent = req.headers.get('user-agent') || 'unknown';

		await supabase.from('audit_logs').insert({
			parking_access_id: parkingInfo.id,
			action: 'gate_opened',
			gate_id: parkingInfo.parking_lots.gates.id,
			ip_address: clientIp,
			user_agent: userAgent,
		});

		return new Response(
			JSON.stringify({
				status: 'success',
				message: `Opening gate: ${parkingInfo.parking_lots.gates.name}`,
			}),
			{ status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
		);

	} catch (error) {
		console.error('Error in parking-sms function:', error);
		return new Response(
			JSON.stringify({ error: 'Internal server error' }),
			{ status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
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
