import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { ParkingLot } from '@/types';

interface UseParkingLotsReturn {
	parkingLots: ParkingLot[];
	loading: boolean;
	error: string | null;
	refetch: () => Promise<void>;
}

export const useParkingLots = (): UseParkingLotsReturn => {
	const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchParkingLots = async () => {
		setLoading(true);
		setError(null);

		try {
			const { data, error: fetchError } = await supabase
				.from('parking_lots')
				.select('*, gates (name)')
				.order('id');

			if (fetchError) {
				setError('Failed to load parking lots');
				return;
			}

			setParkingLots(data || []);
		} catch (err) {
			setError('Failed to load parking lots');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchParkingLots();
	}, []);

	return {
		parkingLots,
		loading,
		error,
		refetch: fetchParkingLots,
	};
}; 