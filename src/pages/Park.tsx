import React from 'react';
import { useParams } from 'react-router-dom';
import {
	OpenGateButton,
	ParkingError,
	ParkingInfoCard,
	ParkingLoading,
	ParkingNotFound,
} from '@/components/park';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';
import { useI18nContext } from '@/context/I18nProvider';
import { useParkingInfo } from '@/hooks';

const Park = () => {
	const { t } = useI18nContext();
	const { uuid } = useParams<{ uuid: string }>();
	const { parkingInfo, loading, error, opening, lastAction, openGate, refetch } =
		useParkingInfo(uuid);

	if (loading) {
		return <ParkingLoading />;
	}

	if (error) {
		return <ParkingError error={error} onRetry={refetch} />;
	}

	if (!parkingInfo) {
		return <ParkingNotFound onRetry={refetch} />;
	}

	return (
		<div className="min-h-screen h-full bg-gray-50 flex items-center justify-center p-4">
			<div className="fixed top-4 right-4 z-50">
				<LanguageSwitcher />
			</div>
			<ParkingInfoCard parkingInfo={parkingInfo}>
				<OpenGateButton
					onOpen={openGate}
					disabled={opening}
					loading={opening}
					lastAction={lastAction}
				/>
				<div className="text-center">
					<p className="text-xs text-gray-500">
						{t('open_gate_info')}
					</p>
				</div>
			</ParkingInfoCard>
		</div>
	);
};

export default Park;
