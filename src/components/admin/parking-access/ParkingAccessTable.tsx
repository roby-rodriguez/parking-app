import React from 'react';
import ParkingAccessActions from './ParkingAccessActions';
import { ParkingAccess } from '@/types';
import { getEffectiveStatus, getStatusColorClasses, getStatusLabel } from '@/utils/statusUtils';

type ParkingAccessTableProps = {
	parkingAccess: ParkingAccess[];
	onEdit: (item: ParkingAccess) => void;
	onRevoke: (id: string) => void;
	onDelete: (id: string) => void;
	formatDate: (dateString: string) => string;
	className?: string;
};

const ParkingAccessTable: React.FC<ParkingAccessTableProps> = ({
	parkingAccess,
	onEdit,
	onRevoke,
	onDelete,
	formatDate,
	className,
}) => {
	return (
		<table className={`w-full divide-y divide-gray-200 text-left ${className || ''}`}>
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
						Valid Period
					</th>
					<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
						Status
					</th>
					<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
						Actions
					</th>
				</tr>
			</thead>
			<tbody className="bg-white divide-y divide-gray-200">
				{parkingAccess.map((item) => {
					const effectiveStatus = getEffectiveStatus(item);
					return (
						<tr key={item.id}>
							<td className="px-4 py-4 text-sm font-medium text-gray-900">
								{item.guest_name || '-'}
							</td>
							<td className="px-4 py-4 text-sm text-gray-500">
								{item.parking_lots.name}
							</td>
							<td className="px-4 py-4 text-sm text-gray-500">
								{item.parking_lots.gates.name}{' '}
								{item.parking_lots.gates.description
									? `(${item.parking_lots.gates.description})`
									: ''}
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
									className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColorClasses(effectiveStatus)}`}
								>
									{getStatusLabel(effectiveStatus)}
								</span>
							</td>
							<td className="px-4 py-4 text-sm font-medium space-x-2">
								<ParkingAccessActions
									item={item}
									onEdit={onEdit}
									onRevoke={onRevoke}
									onDelete={onDelete}
									variant="table"
								/>
							</td>
						</tr>
					);
				})}
			</tbody>
		</table>
	);
};

export default ParkingAccessTable;
