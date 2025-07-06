import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ParkingAccess, ParkingAccessFormData } from '@/types';
import { getEffectiveStatus } from '@/utils/statusUtils';

interface UseParkingAccessReturn {
	parkingAccess: ParkingAccess[];
	loading: boolean;
	error: string | null;
	createParkingAccess: (formData: ParkingAccessFormData) => Promise<{ error: string | null }>;
	updateParkingAccess: (
		id: string,
		formData: ParkingAccessFormData,
	) => Promise<{ error: string | null }>;
	suspendParkingAccess: (id: string) => Promise<{ error: string | null }>;
	deleteParkingAccess: (id: string) => Promise<{ error: string | null }>;
	resumeParkingAccess: (id: string) => Promise<{ error: string | null }>;
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
			// Use the view with computed status for better accuracy
			const { data, error: fetchError } = await supabase
				.from('parking_access_with_computed_status')
				.select('*, parking_lots (name, apartment, address, gates (name, description))')
				.order('created_at', { ascending: false });

			if (fetchError) {
				// Fallback to regular table if view doesn't exist
				const { data: fallbackData, error: fallbackError } = await supabase
					.from('parking_access')
					.select('*, parking_lots (name, apartment, address, gates (name, description))')
					.order('created_at', { ascending: false });

				if (fallbackError) {
					setError('Failed to load parking access');
					return;
				}

				// Add computed status to each record
				const recordsWithComputedStatus = (fallbackData || []).map((record) => ({
					...record,
					computed_status: getEffectiveStatus(record),
				}));

				setParkingAccess(recordsWithComputedStatus);
			} else {
				setParkingAccess(data || []);
			}
		} catch (err) {
			setError('Failed to load parking access');
		} finally {
			setLoading(false);
		}
	};

	const createParkingAccess = async (
		formData: ParkingAccessFormData,
	): Promise<{ error: string | null }> => {
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

	const updateParkingAccess = async (
		id: string,
		formData: ParkingAccessFormData,
	): Promise<{
		error: string | null;
	}> => {
		try {
			const { error: updateError } = await supabase
				.from('parking_access')
				.update(formData)
				.eq('id', id);

			if (updateError) {
				return { error: 'Failed to update parking access' };
			}

			await fetchParkingAccess();
			return { error: null };
		} catch (err) {
			return { error: 'Failed to update parking access' };
		}
	};

	const suspendParkingAccess = async (id: string): Promise<{ error: string | null }> => {
		try {
			const { error: suspendError } = await supabase
				.from('parking_access')
				.update({ status: 'suspended' })
				.eq('id', id);

			if (suspendError) {
				return { error: 'Failed to suspend parking access' };
			}

			await fetchParkingAccess();
			return { error: null };
		} catch (err) {
			return { error: 'Failed to suspend parking access' };
		}
	};

	const deleteParkingAccess = async (id: string): Promise<{ error: string | null }> => {
		try {
			const { error: deleteError } = await supabase.rpc('delete_parking_access_to_history', {
				p_access_id: id,
				p_reason: 'deleted_by_admin',
			});

			if (deleteError) {
				return { error: 'Failed to delete parking access' };
			}

			await fetchParkingAccess();
			return { error: null };
		} catch (err) {
			return { error: 'Failed to delete parking access' };
		}
	};

	const resumeParkingAccess = async (id: string): Promise<{ error: string | null }> => {
		try {
			const { error: resumeError } = await supabase.rpc('resume_parking_access', {
				p_access_id: id,
			});

			if (resumeError) {
				return { error: 'Failed to resume parking access' };
			}

			await fetchParkingAccess();
			return { error: null };
		} catch (err) {
			return { error: 'Failed to resume parking access' };
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
		suspendParkingAccess,
		deleteParkingAccess,
		resumeParkingAccess,
		refetch: fetchParkingAccess,
	};
};
