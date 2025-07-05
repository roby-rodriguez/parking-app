import React from 'react';
import { ColumnDefinition, DataView } from '../shared';
import { AuditLog } from '@/types';

type AuditLogsProps = {
	auditLogs: AuditLog[];
	formatDateTime: (dateString: string) => string;
};

const AuditLogs: React.FC<AuditLogsProps> = ({ auditLogs, formatDateTime }) => {
	const columns: ColumnDefinition<AuditLog>[] = [
		{
			key: 'time',
			label: 'Time',
			width: 'w-32',
			render: (item) => formatDateTime(item.created_at),
		},
		{
			key: 'action',
			label: 'Action',
			width: 'w-32',
			render: (item) => item.action,
		},
		{
			key: 'guest',
			label: 'Guest',
			width: 'w-32',
			render: (item) => item.parking_access?.guest_name || 'N/A',
		},
		{
			key: 'gate',
			label: 'Gate',
			width: 'w-40',
			render: (item) => item.gates?.description || 'N/A',
		},
		{
			key: 'parking_lot',
			label: 'Parking Lot',
			width: 'w-32',
			render: (item) => item.parking_access?.parking_lots?.name || 'N/A',
		},
		{
			key: 'apartment',
			label: 'Apartment',
			width: 'w-32',
			render: (item) => item.parking_access?.parking_lots?.apartment || 'N/A',
		},
		{
			key: 'address',
			label: 'Address',
			width: 'w-48',
			render: (item) => item.parking_access?.parking_lots?.address || 'N/A',
		},
	];

	// Custom card header renderer for AuditLogs
	const cardHeaderRenderer = (item: AuditLog) => {
		return (
			<div className="flex items-center space-x-2">
				<span className="text-sm font-medium text-gray-900">
					Ap. {item.parking_access?.parking_lots?.apartment || 'N/A'}:
				</span>
				<span className="text-sm text-gray-600">{formatDateTime(item.created_at)}</span>
			</div>
		);
	};

	return (
		<DataView
			data={auditLogs}
			columns={columns}
			emptyMessage="No audit logs found."
			cardHeaderRenderer={cardHeaderRenderer}
			cardContentKeys={['guest', 'parking_lot', 'gate']}
		/>
	);
};

export default AuditLogs;
