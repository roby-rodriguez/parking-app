import React, { ReactNode } from 'react';
import { ParkingInfo } from '@/types';

const formatDate = (dateString: string) => {
	return new Date(dateString).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	});
};

type ParkingInfoCardProps = {
	parkingInfo: ParkingInfo;
	children?: ReactNode;
};

const ParkingInfoCard: React.FC<ParkingInfoCardProps> = ({ parkingInfo, children }) => (
	<div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full animate-in fade-in duration-500 slide-in-from-bottom-4">
		<div className="text-center mb-8">
			<div className="text-6xl mb-4" role="img" aria-label="Car">
				🚗
			</div>
			<h1 className="text-2xl font-bold text-gray-900 mb-2">Parking Access</h1>
			{parkingInfo.guest_name && (
				<p className="text-gray-600">Welcome, {parkingInfo.guest_name}</p>
			)}
		</div>
		<div className="space-y-4 mb-8">
			<div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
				<div className="flex justify-between items-center">
					<span className="text-gray-600">Gate:</span>
					<span className="font-semibold text-blue-900">
						{parkingInfo.parking_lots.gates.name}
					</span>
				</div>
			</div>
			<div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
				<div className="flex justify-between items-center">
					<span className="text-gray-600">Parking Lot:</span>
					<span className="font-semibold text-indigo-900">
						{parkingInfo.parking_lots.name} ({parkingInfo.parking_lots.apartment})
					</span>
				</div>
			</div>
			<div className="bg-green-50 p-4 rounded-lg border border-green-100">
				<div className="text-center">
					<p className="text-gray-600 text-sm mb-1">Valid Period</p>
					<p className="font-semibold text-green-900">
						{formatDate(parkingInfo.valid_from)} - {formatDate(parkingInfo.valid_to)}
					</p>
				</div>
			</div>
		</div>
		{children}
	</div>
);

export default ParkingInfoCard;
