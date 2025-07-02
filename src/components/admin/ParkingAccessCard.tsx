import React from 'react';
import ParkingAccessActions from './ParkingAccessActions';
import { ParkingAccess } from '@/types';
import { getEffectiveStatus, getStatusColorClasses, getStatusLabel } from '@/utils/statusUtils';

type ParkingAccessCardProps = {
	item: ParkingAccess;
	onEdit: (item: ParkingAccess) => void;
	onRevoke: (id: string) => void;
	onDelete: (id: string) => void;
	formatDate: (dateString: string) => string;
};

const ParkingAccessCard: React.FC<ParkingAccessCardProps> = ({
	item,
	onEdit,
	onRevoke,
	onDelete,
	formatDate,
}) => {
	const effectiveStatus = getEffectiveStatus(item);

	return (
		<div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
			<div className="flex justify-between items-start mb-3">
				<div className="flex-1">
					<h3 className="text-lg font-semibold text-gray-900 mb-1">
						{item.guest_name || 'Unnamed Guest'}
					</h3>
					<div className="flex items-center space-x-2 mb-2">
						<span
							className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColorClasses(effectiveStatus)}`}
						>
							{getStatusLabel(effectiveStatus)}
						</span>
					</div>
				</div>
				<div className="flex space-x-2">
					<ParkingAccessActions
						item={item}
						onEdit={onEdit}
						onRevoke={onRevoke}
						onDelete={onDelete}
						variant="card"
					/>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-3 text-sm">
				<div className="flex justify-between items-center py-2 border-b border-gray-100">
					<span className="text-gray-600 font-medium">Parking Lot:</span>
					<span className="text-gray-900">{item.parking_lots.name}</span>
				</div>

				<div className="flex justify-between items-center py-2 border-b border-gray-100">
					<span className="text-gray-600 font-medium">Gate:</span>
					<span className="text-gray-900">{item.parking_lots.gates.description}</span>
				</div>

				<div className="flex justify-between items-center py-2 border-b border-gray-100">
					<span className="text-gray-600 font-medium">Apartment:</span>
					<span className="text-gray-900">{item.parking_lots.apartment}</span>
				</div>

				<div className="flex justify-between items-start py-2 border-b border-gray-100">
					<span className="text-gray-600 font-medium">Address:</span>
					<span className="text-gray-900 text-right">{item.parking_lots.address}</span>
				</div>

				<div className="flex justify-between items-center py-2">
					<span className="text-gray-600 font-medium">Valid Period:</span>
					<span className="text-gray-900">
						{formatDate(item.valid_from)} - {formatDate(item.valid_to)}
					</span>
				</div>
			</div>
		</div>
	);
};

export default ParkingAccessCard;
