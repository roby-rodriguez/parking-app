import React from 'react';
import { ColumnDefinition, DataView } from '../shared';
import { ParkingAccessHistory } from '@/types';

type ParkingAccessHistoryProps = {
	parkingAccessHistory: ParkingAccessHistory[];
	formatDate: (dateString: string) => string;
};

const History: React.FC<ParkingAccessHistoryProps> = ({ parkingAccessHistory, formatDate }) => {
	const columns: ColumnDefinition<ParkingAccessHistory>[] = [
		{
			key: 'guest',
			label: 'Guest',
			width: 'w-32',
			render: (item) => item.guest_name || '-',
		},
		{
			key: 'parking_lot',
			label: 'Parking Lot',
			width: 'w-32',
			render: (item) => item.parking_lots.name,
		},
		{
			key: 'gate',
			label: 'Gate',
			width: 'w-40',
			render: (item) => item.parking_lots.gates.description,
		},
		{
			key: 'apartment',
			label: 'Apartment',
			width: 'w-32',
			render: (item) => item.parking_lots.apartment,
		},
		{
			key: 'address',
			label: 'Address',
			width: 'w-48',
			render: (item) => item.parking_lots.address,
		},
		{
			key: 'stay_period',
			label: 'Stay Period',
			width: 'w-40',
			render: (item) => `${formatDate(item.valid_from)} - ${formatDate(item.valid_to)}`,
		},
		{
			key: 'status',
			label: 'Status at Deletion',
			width: 'w-32',
			render: (item) => (
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
			),
		},
		{
			key: 'deleted_at',
			label: 'Deleted At',
			width: 'w-32',
			render: (item) => formatDate(item.deleted_at),
		},
	];

	// Custom card header renderer for History
	const cardHeaderRenderer = (item: ParkingAccessHistory) => {
		return (
			<div className="flex items-center space-x-2">
				<span className="text-sm font-medium text-gray-900">
					Ap. {item.parking_lots.apartment}:
				</span>
				<span className="text-sm text-gray-600">
					{formatDate(item.valid_from)} - {formatDate(item.valid_to)}
				</span>
			</div>
		);
	};

	return (
		<DataView
			data={parkingAccessHistory}
			columns={columns}
			emptyMessage="No past guests found."
			cardHeaderRenderer={cardHeaderRenderer}
			cardContentKeys={['guest', 'parking_lot', 'gate']}
		/>
	);
};

export default History;
