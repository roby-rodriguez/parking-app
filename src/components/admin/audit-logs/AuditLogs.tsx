import React from 'react';
import { ColumnDefinition, DataView } from '../shared';
import { useI18nContext } from '@/context/I18nProvider';
import { AuditLog } from '@/types';
import { useLocalizedDate } from '@/utils/dateUtils';

type AuditLogsProps = {
	auditLogs: AuditLog[];
};

const AuditLogs: React.FC<AuditLogsProps> = ({ auditLogs }) => {
	const { t } = useI18nContext();
	const { formatDateTime } = useLocalizedDate();

	const columns: ColumnDefinition<AuditLog>[] = [
		{
			key: 'time',
			label: t('time'),
			width: 'w-40',
			render: (item) => formatDateTime(item.created_at),
		},
		{
			key: 'action',
			label: t('action'),
			width: 'w-32',
			render: (item) => item.action,
		},
		{
			key: 'guest',
			label: t('guest_name'),
			width: 'w-32',
			render: (item) => item.parking_access?.guest_name || 'N/A',
		},
		{
			key: 'gate',
			label: t('gate'),
			width: 'w-40',
			render: (item) => item.gates?.description || 'N/A',
		},
		{
			key: 'parking_lot',
			label: t('parking_lot'),
			width: 'w-32',
			render: (item) => item.parking_access?.parking_lots?.name || 'N/A',
		},
		{
			key: 'apartment',
			label: t('apartment'),
			width: 'w-32',
			render: (item) => item.parking_access?.parking_lots?.apartment || 'N/A',
		},
		{
			key: 'address',
			label: t('address'),
			width: 'w-48',
			render: (item) => item.parking_access?.parking_lots?.address || 'N/A',
		},
		{
			key: 'ip_address',
			label: t('ip_address'),
			width: 'w-32',
			render: (item) => <span title={item.ip_address || ''}>{item.ip_address || 'N/A'}</span>,
		},
		{
			key: 'user_agent',
			label: t('user_agent'),
			width: 'w-48',
			render: (item) => (
				<span className="truncate block max-w-xs" title={item.user_agent || ''}>
					{item.user_agent || 'N/A'}
				</span>
			),
		},
	];

	// Custom card header renderer for AuditLogs
	const cardHeaderRenderer = (item: AuditLog) => {
		return (
			<div className="flex items-center space-x-2">
				<span className="text-sm font-medium text-gray-900">
					{t('apartment')}. {item.parking_access?.parking_lots?.apartment || 'N/A'}:
				</span>
				<span className="text-sm text-gray-600">{formatDateTime(item.created_at)}</span>
			</div>
		);
	};

	return (
		<DataView
			data={auditLogs}
			columns={columns}
			emptyMessage={t('no_audit_logs')}
			cardHeaderRenderer={cardHeaderRenderer}
			cardContentKeys={['guest', 'parking_lot', 'gate', 'ip_address', 'user_agent']}
		/>
	);
};

export default AuditLogs;
