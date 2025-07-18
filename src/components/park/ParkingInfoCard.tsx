import React, { ReactNode } from 'react';
import { useI18nContext } from '@/context/I18nProvider';
import { ParkingInfo } from '@/types';
import { useLocalizedDate } from '@/utils/dateUtils';

interface ParkingInfoCardProps {
	parkingInfo: ParkingInfo;
	children: ReactNode;
}

const ParkingInfoCard: React.FC<ParkingInfoCardProps> = ({ parkingInfo, children }) => {
	const { t } = useI18nContext();
	const { formatDate } = useLocalizedDate();

	return (
		<div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full animate-in fade-in duration-500 slide-in-from-bottom-4">
			<div className="text-center mb-8">
				<div className="text-6xl mb-4" role="img" aria-label="Car">
					🚗
				</div>
				<h1 className="text-2xl font-bold text-gray-900 mb-2">{t('parking_access')}</h1>
				{parkingInfo.guest_name && (
					<p className="text-gray-600">
						{t('welcome')}, {parkingInfo.guest_name}
					</p>
				)}
			</div>
			<div className="space-y-4 mb-8">
				<div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
					<div className="flex justify-between items-center">
						<span className="text-gray-600">{t('gate')}:</span>
						<span className="font-semibold text-blue-900">
							{parkingInfo.parking_lots.gates.name}{' '}
							{parkingInfo.parking_lots.gates.description
								? `(${parkingInfo.parking_lots.gates.description})`
								: ''}
						</span>
					</div>
				</div>
				<div className="bg-rose-50 p-4 rounded-lg border border-rose-100">
					<div className="flex justify-between items-center">
						<span className="text-gray-600">{t('parking_lot')}:</span>
						<span className="font-semibold text-rose-900">
							{parkingInfo.parking_lots.name}
						</span>
					</div>
				</div>
				<div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
					<div className="flex justify-between items-center">
						<span className="text-gray-600">{t('apartment')}:</span>
						<span className="font-semibold text-indigo-900">
							{parkingInfo.parking_lots.apartment} ({parkingInfo.parking_lots.address})
						</span>
					</div>
				</div>
				<div className="bg-green-50 p-4 rounded-lg border border-green-100">
					<div className="text-center">
						<p className="text-gray-600 text-sm mb-1">{t('valid_period')}</p>
						<p className="font-semibold text-green-900">
							{formatDate(parkingInfo.valid_from)} -{' '}{formatDate(parkingInfo.valid_to)}
						</p>
					</div>
				</div>
			</div>
			{children}
		</div>
	);
};

export default ParkingInfoCard;
