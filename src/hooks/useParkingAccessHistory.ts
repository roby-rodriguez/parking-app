import { useState } from 'react';
import { useI18nContext } from '@/context/I18nProvider';
import { supabase } from '@/lib/supabaseClient';
import { ParkingAccessHistory } from '@/types';

interface UseParkingAccessHistoryReturn {
	parkingAccessHistory: ParkingAccessHistory[];
	loading: boolean;
	error: string | null;
	refetch: () => Promise<void>;
}

export const useParkingAccessHistory = (): UseParkingAccessHistoryReturn => {
	const { t } = useI18nContext();
	const [parkingAccessHistory, setParkingAccessHistory] = useState<ParkingAccessHistory[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchParkingAccessHistory = async () => {
		setLoading(true);
		setError(null);

		try {
			const { data, error: fetchError } = await supabase
				.from('parking_access_history')
				.select('*, parking_lots (name, apartment, address, gates (name, description))')
				.order('deleted_at', { ascending: false });

			if (fetchError) {
				setError(t('load_history_error'));
				return;
			}

			setParkingAccessHistory(data || []);
		} catch (err) {
			setError(t('load_history_error'));
		} finally {
			setLoading(false);
		}
	};

	return {
		parkingAccessHistory,
		loading,
		error,
		refetch: fetchParkingAccessHistory,
	};
};
