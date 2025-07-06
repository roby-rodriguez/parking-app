import React from 'react';
import { useI18nContext } from '@/context/I18nProvider';

const ParkingLoading = () => {
	const { t } = useI18nContext();
	return (
		<div className="min-h-screen h-full flex items-center justify-center bg-gray-50">
			<div className="text-center">
				<div
					className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"
					role="status"
					aria-label={t('loading_parking_access')}
				></div>
				<p className="mt-4 text-gray-600 animate-pulse">{t('loading_parking_access')}...</p>
			</div>
		</div>
	);
};

export default ParkingLoading;
