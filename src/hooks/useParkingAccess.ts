import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ParkingAccess, ParkingAccessFormData } from '@/types';

interface UseParkingAccessReturn {
	parkingAccess: ParkingAccess[];
	loading: boolean;
	error: string | null;
	createParkingAccess: (formData: ParkingAccessFormData) => Promise<{ error: string | null }>;
	updateParkingAccess: (id: string, formData: ParkingAccessFormData) => Promise<{ error: string | null }>;
	revokeParkingAccess: (id: string) => Promise<{ error: string | null }>;
	refetch: () => Promise<void>;
}

export const useParkingAccess = (): UseParkingAccessReturn => {
	const [parkingAccess, setParkingAccess] = useState<ParkingAccess[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchParkingAccess = async () => {
		setLoading(true);
		setError(null);

		try {
			const { data, error: fetchError } = await supabase
				.from('parking_access')
				.select('*, parking_lots (name, apartment, gates (name))')
				.order('created_at', { ascending: false });

			if (fetchError) {
				setError('Failed to load parking access');
				return;
			}

			setParkingAccess(data || []);
		} catch (err) {
			setError('Failed to load parking access');
		} finally {
			setLoading(false);
		}
	};

	const createParkingAccess = async (formData: ParkingAccessFormData): Promise<{ error: string | null }> => {
		try {
			const { error: createError } = await supabase.from('parking_access').insert([formData]);

			if (createError) {
				return { error: 'Failed to create parking access' };
			}

			await fetchParkingAccess();
			return { error: null };
		} catch (err) {
			return { error: 'Failed to create parking access' };
		}
	};

	const updateParkingAccess = async (id: string, formData: ParkingAccessFormData): Promise<{ error: string | null }> => {
		try {
			const { error: updateError } = await supabase.from('parking_access').update(formData).eq('id', id);

			if (updateError) {
				return { error: 'Failed to update parking access' };
			}

			await fetchParkingAccess();
			return { error: null };
		} catch (err) {
			return { error: 'Failed to update parking access' };
		}
	};

	const revokeParkingAccess = async (id: string): Promise<{ error: string | null }> => {
		try {
			const { error: revokeError } = await supabase.from('parking_access').update({ status: 'revoked' }).eq('id', id);

			if (revokeError) {
				return { error: 'Failed to revoke parking access' };
			}

			await fetchParkingAccess();
			return { error: null };
		} catch (err) {
			return { error: 'Failed to revoke parking access' };
		}
	};

	useEffect(() => {
		fetchParkingAccess();
	}, []);

	return {
		parkingAccess,
		loading,
		error,
		createParkingAccess,
		updateParkingAccess,
		revokeParkingAccess,
		refetch: fetchParkingAccess,
	};
}; 