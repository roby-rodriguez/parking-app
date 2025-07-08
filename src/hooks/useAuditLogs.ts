import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { AuditLog } from '@/types';

interface UseAuditLogsReturn {
	auditLogs: AuditLog[];
	loading: boolean;
	error: string | null;
	refetch: () => Promise<void>;
}

export const useAuditLogs = (limit: number = 50): UseAuditLogsReturn => {
	const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchAuditLogs = async () => {
		setLoading(true);
		setError(null);

		try {
			const { data, error: fetchError } = await supabase
				.from('audit_logs')
				.select(
					'*, gates (name, description), parking_access (guest_name, parking_lots (name, apartment, address))',
				)
				.order('created_at', { ascending: false })
				.limit(limit);

			if (fetchError) {
				setError('Failed to load audit logs');
				return;
			}

			setAuditLogs(data || []);
		} catch (err) {
			setError('Failed to load audit logs');
		} finally {
			setLoading(false);
		}
	};

	return {
		auditLogs,
		loading,
		error,
		refetch: fetchAuditLogs,
	};
};
