import { useState, useMemo } from 'react';
import { useI18nContext } from '@/context/I18nProvider';
import { supabase } from '@/lib/supabaseClient';
import { ParkingAccess, ParkingAccessFormData, ParkingLot } from '@/types';
import { getEffectiveStatus } from '@/utils/statusUtils';

interface UseParkingAccessReturn {
	parkingAccess: ParkingAccess[];
	parkingLots: ParkingLot[];
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
	const { t } = useI18nContext();
	const [parkingAccess, setParkingAccess] = useState<ParkingAccess[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Extract unique parking lots from parking access data
	const parkingLots = useMemo(() => {
		const uniqueLots = new Map<number, ParkingLot>();

		parkingAccess.forEach(access => {
			if (access.parking_lots && !uniqueLots.has(access.parking_lot_id)) {
				uniqueLots.set(access.parking_lot_id, {
					id: access.parking_lot_id,
					name: access.parking_lots.name,
					apartment: access.parking_lots.apartment,
					gate_id: 0, // This would need to be added to the query if needed
					gates: { name: access.parking_lots.gates.name },
				});
			}
		});

		return Array.from(uniqueLots.values());
	}, [parkingAccess]);

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
					setError(t('load_error'));
					return;
				}

				// Add computed status to each record
				const recordsWithComputedStatus = (fallbackData || []).map((record: ParkingAccess) => ({
					...record,
					computed_status: getEffectiveStatus(record),
				}));

				setParkingAccess(recordsWithComputedStatus);
			} else {
				setParkingAccess(data || []);
			}
		} catch (err) {
			setError(t('load_error'));
		} finally {
			setLoading(false);
		}
	};

	const createParkingAccess = async (
		formData: ParkingAccessFormData,
	): Promise<{ error: string | null }> => {
		try {
			// Validate dates and check for overlaps
			const { data: validationResult, error: validationError } = await supabase.rpc(
				'validate_parking_access_dates',
				{
					p_parking_lot_id: formData.parking_lot_id,
					p_valid_from: formData.valid_from,
					p_valid_to: formData.valid_to,
					p_exclude_id: null,
				},
			);

			if (validationError) {
				return { error: t('validate_error') };
			}

			if (
				!validationResult ||
				validationResult.length === 0 ||
				!validationResult[0].is_valid
			) {
				const errorMessage = validationResult?.[0]?.error_message || 'invalid_dates';
				return { error: t(errorMessage) };
			}

			const { error: createError } = await supabase.from('parking_access').insert([formData]);

			if (createError) {
				return { error: t('create_error') };
			}

			await fetchParkingAccess();
			return { error: null };
		} catch (err) {
			return { error: t('create_error') };
		}
	};

	const updateParkingAccess = async (
		id: string,
		formData: ParkingAccessFormData,
	): Promise<{
		error: string | null;
	}> => {
		try {
			// Validate dates and check for overlaps (excluding current record)
			const { data: validationResult, error: validationError } = await supabase.rpc(
				'validate_parking_access_dates',
				{
					p_parking_lot_id: formData.parking_lot_id,
					p_valid_from: formData.valid_from,
					p_valid_to: formData.valid_to,
					p_exclude_id: id,
				},
			);

			if (validationError) {
				return { error: t('validate_error') };
			}

			if (
				!validationResult ||
				validationResult.length === 0 ||
				!validationResult[0].is_valid
			) {
				const errorMessage = validationResult?.[0]?.error_message || 'invalid_dates';
				return { error: t(errorMessage) };
			}

			const { error: updateError } = await supabase
				.from('parking_access')
				.update(formData)
				.eq('id', id);

			if (updateError) {
				return { error: t('update_error') };
			}

			await fetchParkingAccess();
			return { error: null };
		} catch (err) {
			return { error: t('update_error') };
		}
	};

	const suspendParkingAccess = async (id: string): Promise<{ error: string | null }> => {
		try {
			const { error: suspendError } = await supabase
				.from('parking_access')
				.update({ status: 'suspended' })
				.eq('id', id);

			if (suspendError) {
				return { error: t('suspend_error') };
			}

			await fetchParkingAccess();
			return { error: null };
		} catch (err) {
			return { error: t('suspend_error') };
		}
	};

	const deleteParkingAccess = async (id: string): Promise<{ error: string | null }> => {
		try {
			const { error: deleteError } = await supabase.rpc('delete_parking_access_to_history', {
				p_access_id: id,
				p_reason: 'deleted_by_admin',
			});

			if (deleteError) {
				return { error: t('delete_error') };
			}

			await fetchParkingAccess();
			return { error: null };
		} catch (err) {
			return { error: t('delete_error') };
		}
	};

	const resumeParkingAccess = async (id: string): Promise<{ error: string | null }> => {
		try {
			const { error: resumeError } = await supabase.rpc('resume_parking_access', {
				p_access_id: id,
			});

			if (resumeError) {
				return { error: t('resume_error') };
			}

			await fetchParkingAccess();
			return { error: null };
		} catch (err) {
			return { error: t('resume_error') };
		}
	};

	return {
		parkingAccess,
		parkingLots,
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
