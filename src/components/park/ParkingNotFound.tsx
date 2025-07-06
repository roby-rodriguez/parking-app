import React from 'react';
import { useI18nContext } from '@/context/I18nProvider';

type ParkingNotFoundProps = {
	onRetry?: () => void;
};

const ParkingNotFound: React.FC<ParkingNotFoundProps> = ({ onRetry }) => {
	const { t } = useI18nContext();
	return (
		<div className="min-h-screen h-full flex items-center justify-center bg-gray-50">
			<div className="text-center">
				<div className="text-gray-400 text-6xl mb-4" role="img" aria-label={t('not_found_emoji_label')}>🔍</div>
				<p className="text-gray-600 mb-4">{t('parking_not_found_title')}</p>
				{onRetry && (
					<button
						onClick={onRetry}
						className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
						aria-label={t('retry_loading_parking_access')}
					>
						{t('retry')}
					</button>
				)}
			</div>
		</div>
	);
};

export default ParkingNotFound;
