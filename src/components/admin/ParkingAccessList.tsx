import React from 'react';
import { ParkingAccess } from '@/types';
import { getEffectiveStatus, getStatusColorClasses, getStatusLabel } from '@/utils/statusUtils';

type ParkingAccessListProps = {
	parkingAccess: ParkingAccess[];
	onEdit: (item: ParkingAccess) => void;
	onRevoke: (id: string) => void;
	onDelete: (id: string) => void;
	formatDate: (dateString: string) => string;
};

const ParkingAccessList: React.FC<ParkingAccessListProps> = ({
	parkingAccess,
	onEdit,
	onRevoke,
	onDelete,
	formatDate,
}) => (
	<div>
		<h2 className="text-lg font-medium text-gray-900 mb-4">Parking Access List</h2>
		<div className="overflow-x-auto">
			<table className="min-w-full divide-y divide-gray-200 text-left">
				<thead className="bg-gray-50">
					<tr>
						<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Guest
						</th>
						<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Parking Lot
						</th>
						<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Gate
						</th>
						<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Apartment
						</th>
						<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Address
						</th>
						<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Valid Period
						</th>
						<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Status
						</th>
						<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Actions
						</th>
					</tr>
				</thead>
				<tbody className="bg-white divide-y divide-gray-200">
					{parkingAccess.map((item) => {
						const effectiveStatus = getEffectiveStatus(item);
						return (
							<tr key={item.id}>
								<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
									{item.guest_name || 'Unnamed'}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{item.parking_lots.name}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{item.parking_lots.gates.description}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{item.parking_lots.apartment}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{item.parking_lots.address}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
									{formatDate(item.valid_from)} - {formatDate(item.valid_to)}
								</td>
								<td className="px-6 py-4 whitespace-nowrap">
									<span
										className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColorClasses(effectiveStatus)}`}
									>
										{getStatusLabel(effectiveStatus)}
									</span>
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
									{effectiveStatus === 'active' && (
										<>
											<button
												onClick={() => onEdit(item)}
												className="text-blue-600 hover:text-blue-900"
											>
												Edit
											</button>
											<button
												onClick={() => onRevoke(item.id)}
												className="text-red-600 hover:text-red-900"
											>
												Revoke
											</button>
											<button
												onClick={() => onDelete(item.id)}
												className="text-gray-600 hover:text-gray-900"
											>
												Delete
											</button>
										</>
									)}
									{effectiveStatus === 'pending' && (
										<>
											<button
												onClick={() => onEdit(item)}
												className="text-blue-600 hover:text-blue-900"
											>
												Edit
											</button>
											<button
												onClick={() => onDelete(item.id)}
												className="text-gray-600 hover:text-gray-900"
											>
												Delete
											</button>
										</>
									)}
									<a
										href={`/park/${item.uuid}`}
										target="_blank"
										rel="noopener noreferrer"
										className="text-green-600 hover:text-green-900"
									>
										View
									</a>
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	</div>
);

export default ParkingAccessList;
