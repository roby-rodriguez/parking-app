import React, { useState } from 'react';
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
	const [isExpanded, setIsExpanded] = useState(false);
	const effectiveStatus = getEffectiveStatus(item);

	const toggleExpanded = () => {
		setIsExpanded(!isExpanded);
	};

	// Get status-specific border colors
	const getStatusBorderClasses = (status: string) => {
		switch (status) {
			case 'active':
				return 'border-green-100 bg-green-500';
			case 'expired':
				return 'border-orange-100 bg-orange-500';
			case 'revoked':
				return 'border-gray-100 bg-gray-500';
			case 'pending':
				return 'border-yellow-100 bg-yellow-500';
			default:
				return 'border-gray-100 bg-gray-500';
		}
	};

	return (
		<div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
			{/* Header - Always visible */}
			<button
				onClick={toggleExpanded}
				className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset rounded-t-lg"
				aria-expanded={isExpanded}
				aria-controls={`parking-access-${item.id}`}
			>
				<div className="flex items-center space-x-3">
					{/* Status Circle with Highlighted Border */}
					<div className={`w-3 h-3 rounded-full border-2 ${getStatusBorderClasses(effectiveStatus)}`}></div>

					{/* Apartment and Valid Period */}
					<div className="flex items-center space-x-2">
						<span className="text-sm font-medium text-gray-900">
							Ap. {item.parking_lots.apartment}:
						</span>
						<span className="text-sm text-gray-600">
							{formatDate(item.valid_from)} - {formatDate(item.valid_to)}
						</span>
					</div>

					{/* Chevron */}
					<svg
						className={`w-4 h-4 text-gray-400 transition-transform duration-200 ml-auto ${
							isExpanded ? 'rotate-180' : ''
						}`}
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M19 9l-7 7-7-7"
						/>
					</svg>
				</div>
			</button>

			{/* Collapsible Content */}
			<div
				id={`parking-access-${item.id}`}
				className={`overflow-hidden transition-all duration-200 ease-in-out ${
					isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
				}`}
			>
				<div className="px-4 pb-4 space-y-3">
					{/* Guest Name (if exists) */}
					{item.guest_name && (
						<div className="flex justify-between items-center py-2 border-b border-gray-100">
							<span className="text-gray-600 font-medium">Guest:</span>
							<span className="text-gray-900">{item.guest_name}</span>
						</div>
					)}

					{/* Parking Lot */}
					<div className="flex justify-between items-center py-2 border-b border-gray-100">
						<span className="text-gray-600 font-medium">Parking Lot:</span>
						<span className="text-gray-900">{item.parking_lots.name}</span>
					</div>

					{/* Gate */}
					<div className="flex justify-between items-center py-2 border-b border-gray-100">
						<span className="text-gray-600 font-medium">Gate:</span>
						<span className="text-gray-900">{item.parking_lots.gates.name} {item.parking_lots.gates.description ? `(${item.parking_lots.gates.description})` : ''}</span>
					</div>

					{/* Status */}
					<div className="flex justify-between items-center py-2 border-b border-gray-100">
						<span className="text-gray-600 font-medium">Status:</span>
						<span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColorClasses(effectiveStatus)}`}>
							{getStatusLabel(effectiveStatus)}
						</span>
					</div>

					{/* Actions - Centered */}
					<div className="flex justify-center pt-2 space-x-2">
						<ParkingAccessActions
							item={item}
							onEdit={onEdit}
							onRevoke={onRevoke}
							onDelete={onDelete}
							variant="card"
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ParkingAccessCard;
