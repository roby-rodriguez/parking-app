import React from 'react';
import { ParkingAccessHistory } from '@/types';

type ParkingAccessHistoryProps = {
	parkingAccessHistory: ParkingAccessHistory[];
	formatDate: (dateString: string) => string;
};

const History: React.FC<ParkingAccessHistoryProps> = ({
	parkingAccessHistory,
	formatDate,
}) => (
	<div>
		<h2 className="text-lg font-medium text-gray-900 mb-4">Past Guests History</h2>
		<table className="w-full divide-y divide-gray-200 text-left">
			<thead className="bg-gray-50">
				<tr>
					<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
						Guest
					</th>
					<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
						Parking Lot
					</th>
					<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
						Gate
					</th>
					<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
						Apartment
					</th>
					<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
						Address
					</th>
					<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
						Stay Period
					</th>
					<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
						Status at Deletion
					</th>
					<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
						Deleted At
					</th>
				</tr>
			</thead>
			<tbody className="bg-white divide-y divide-gray-200">
				{parkingAccessHistory.map((item) => (
					<tr key={item.id}>
						<td className="px-4 py-4 text-sm font-medium text-gray-900">
							{item.guest_name || '-'}
						</td>
						<td className="px-4 py-4 text-sm text-gray-500">
							{item.parking_lots.name}
						</td>
						<td className="px-4 py-4 text-sm text-gray-500">
							{item.parking_lots.gates.description}
						</td>
						<td className="px-4 py-4 text-sm text-gray-500">
							{item.parking_lots.apartment}
						</td>
						<td className="px-4 py-4 text-sm text-gray-500">
							{item.parking_lots.address}
						</td>
						<td className="px-4 py-4 text-sm text-gray-500">
							{formatDate(item.valid_from)} - {formatDate(item.valid_to)}
						</td>
						<td className="px-4 py-4">
							<span
								className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
									item.status === 'active'
										? 'bg-green-100 text-green-800'
										: item.status === 'revoked'
											? 'bg-red-100 text-red-800'
											: item.status === 'expired'
												? 'bg-orange-100 text-orange-800'
												: 'bg-gray-100 text-gray-800'
								}`}
							>
								{item.status}
							</span>
						</td>
						<td className="px-4 py-4 text-sm text-gray-500">
							{formatDate(item.deleted_at)}
						</td>
					</tr>
				))}
			</tbody>
		</table>
		{parkingAccessHistory.length === 0 && (
			<div className="text-center py-8 text-gray-500">No past guests found.</div>
		)}
	</div>
);

export default History;
