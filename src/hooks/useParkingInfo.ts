import { FunctionsError } from '@supabase/functions-js/src/types';
import { useCallback, useEffect, useState } from 'react';
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
	const [parkingInfo, setParkingInfo] = useState<ParkingInfo | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [opening, setOpening] = useState(false);
	const [lastAction, setLastAction] = useState<string | null>(null);

	const fetchParkingInfo = useCallback(async () => {
		if (!uuid) {
			setError('Invalid parking access URL');
			setLoading(false);
			return;
		}

		setLoading(true);
		setError(null);

		try {
			const { data, error: fetchError } = await supabase
				.from('parking_access')
				.select(
					`
					*,
					parking_lots (
						name,
						apartment,
						address,
						gates (
							name,
							description
						)
					)
				`,
				)
				.eq('uuid', uuid)
				.single();

			if (fetchError) {
				setError('Parking access not found');
				return;
			}

			// Calculate current status
			const currentStatus = calculateParkingStatus(
				data.valid_from,
				data.valid_to,
				data.status,
			);

			// Check if access is valid based on calculated status
			if (currentStatus === 'revoked') {
				setError('Parking access has been revoked');
				return;
			}

			if (currentStatus === 'expired') {
				setError('Parking access has expired');
				return;
			}

			if (currentStatus === 'pending') {
				setError('Parking access is not yet valid');
				return;
			}

			// Status is 'active', so access is valid
			setParkingInfo(data);
		} catch (err) {
			setError('Failed to load parking access');
		} finally {
			setLoading(false);
		}
	}, [uuid]);

	const openGate = useCallback(async () => {
		const defaultErrorMessage = 'Failed to open gate, please try again later.';
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
							errorMessage = result.error;
						}
					} catch {
						/* empty */
					}
				}
				setLastAction(`Error: ${errorMessage}`);
			} else if (data.error) {
				setLastAction(`Error: ${data.error || defaultErrorMessage}`);
			} else {
				setLastAction(data.message);
			}
		} catch (err: any) {
			setLastAction(`Error: ${err.message || defaultErrorMessage}`);
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
