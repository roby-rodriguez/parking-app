import React from 'react';
import { AuditLog } from '@/types';

type AuditLogsTableProps = {
	auditLogs: AuditLog[];
	formatDateTime: (dateString: string) => string;
};

const AuditLogsTable: React.FC<AuditLogsTableProps> = ({ auditLogs, formatDateTime }) => (
	<div>
		<h2 className="text-lg font-medium text-gray-900 mb-4">Audit Logs</h2>
		<table className="w-full divide-y divide-gray-200">
			<thead className="bg-gray-50">
				<tr>
					<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
						Time
					</th>
					<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
						Action
					</th>
					<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
						Guest
					</th>
					<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
						Gate
					</th>
					<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
						Parking Lot
					</th>
					<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
						Apartment
					</th>
					<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
						Address
					</th>
				</tr>
			</thead>
			<tbody className="bg-white divide-y divide-gray-200">
				{auditLogs.map((log) => (
					<tr key={log.id}>
						<td className="px-4 py-4 text-sm text-gray-500">
							{formatDateTime(log.created_at)}
						</td>
						<td className="px-4 py-4 text-sm font-medium text-gray-900">
							{log.action}
						</td>
						<td className="px-4 py-4 text-sm font-medium text-gray-900">
							{log.parking_access?.guest_name || 'N/A'}
						</td>
						<td className="px-4 py-4 text-sm text-gray-500">
							{log.gates?.description || 'N/A'}
						</td>
						<td className="px-4 py-4 text-sm text-gray-500">
							{log.parking_access?.parking_lots?.name || 'N/A'}
						</td>
						<td className="px-4 py-4 text-sm text-gray-500">
							{log.parking_access?.parking_lots?.apartment || 'N/A'}
						</td>
						<td className="px-4 py-4 text-sm text-gray-500">
							{log.parking_access?.parking_lots?.address || 'N/A'}
						</td>
					</tr>
				))}
			</tbody>
		</table>
	</div>
);

export default AuditLogsTable;
