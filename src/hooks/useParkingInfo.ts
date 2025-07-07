import { FunctionsError } from '@supabase/functions-js/src/types';
import { useCallback, useEffect, useState } from 'react';
import { useI18nContext } from '@/context/I18nProvider';
import { supabase } from '@/lib/supabaseClient';
import { ParkingInfo } from '@/types';
import { calculateParkingStatus } from '@/utils/statusUtils';

interface UseParkingInfoReturn {
	parkingInfo: ParkingInfo | null;
	loading: boolean;
	error: string | null;
	opening: boolean;
	lastAction: string | null;
	openGate: () => Promise<void>;
	refetch: () => Promise<void>;
	isValid: boolean;
}

export const useParkingInfo = (uuid: string | undefined): UseParkingInfoReturn => {
	const { t } = useI18nContext();
	const [parkingInfo, setParkingInfo] = useState<ParkingInfo | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [opening, setOpening] = useState(false);
	const [lastAction, setLastAction] = useState<string | null>(null);

	const fetchParkingInfo = useCallback(async () => {
		if (!uuid) {
			setError(t('invalid_parking_url'));
			setLoading(false);
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const { data: results, error: fetchError } = await supabase.rpc('get_parking_info_by_uuid', { p_uuid: uuid });

			if (fetchError) {
				setError(t('parking_not_found'));
				return;
			}

			if (!results || results.length === 0) {
				setError(t('parking_not_found'));
				return;
			}

			const data = results[0];
			const currentStatus = calculateParkingStatus(
				data.valid_from,
				data.valid_to,
				data.status,
			);

			// Check if access is valid based on calculated status
			if (currentStatus === 'suspended') {
				setError(t('parking_access_suspended'));
				return;
			}

			if (currentStatus === 'expired') {
				setError(t('parking_access_expired'));
				return;
			}

			if (currentStatus === 'pending') {
				setError(t('parking_access_not_valid'));
				return;
			}

			// Status is 'active', so access is valid
			setParkingInfo({
				uuid: uuid,
				guest_name: data.guest_name,
				valid_from: data.valid_from,
				valid_to: data.valid_to,
				parking_lots: {
					name: data.parking_lot_name,
					apartment: data.parking_lot_apartment,
					address: data.parking_lot_address,
					gates: {
						name: data.gate_name,
						description: data.gate_description,
					},
				},
			});
		} catch (err) {
			setError(t('load_error'));
		} finally {
			setLoading(false);
		}
	}, [uuid]);

	const openGate = useCallback(async () => {
		const defaultErrorMessage = t('open_gate_error');
		if (!parkingInfo || opening) {
			return;
		}

		setOpening(true);
		setLastAction(null);

		try {
			const { data, error } = await supabase.functions.invoke('parking-sms', {
				body: { uuid: parkingInfo.uuid },
			});

			if (error) {
				let errorMessage = defaultErrorMessage;

				if (error?.context?.json) {
					try {
						const { context } = error as FunctionsError;
						const result = await context.json();
						if (result.error) {
							errorMessage = t(result.error);
						}
					} catch {
						/* empty */
					}
				}
				setLastAction(`Error: ${errorMessage}`);
			} else if (data.error) {
				setLastAction(`Error: ${t(data.error)}`);
			} else {
				setLastAction(t(data.message, { gateName: data.gateName }));
			}
		} catch (err: any) {
			setLastAction(`Error: ${t(err.message ?? 'internal_server_error')}`);
		} finally {
			setOpening(false);
		}
	}, [parkingInfo, opening]);

	useEffect(() => {
		fetchParkingInfo();
	}, [fetchParkingInfo]);

	const isValid = parkingInfo !== null && error === null;

	return {
		parkingInfo,
		loading,
		error,
		opening,
		lastAction,
		openGate,
		refetch: fetchParkingInfo,
		isValid,
	};
};
