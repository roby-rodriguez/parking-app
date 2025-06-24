import { useParams } from 'react-router-dom';
import {
	OpenGateButton,
	ParkingError,
	ParkingInfoCard,
	ParkingLoading,
	ParkingNotFound,
} from '@/components/park';
import { useParkingInfo } from '@/hooks';

export default function Park() {
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
		<div className="h-full bg-gray-50 flex items-center justify-center p-4">
			<div className="space-y-4 animate-in fade-in duration-500">
				<ParkingInfoCard parkingInfo={parkingInfo} />
				<OpenGateButton
					onOpen={openGate}
					disabled={opening}
					loading={opening}
					lastAction={lastAction}
				/>
				<div className="text-center">
					<p className="text-xs text-gray-500">
						This access is valid for your entire stay.
					</p>
				</div>
			</div>
		</div>
	);
}
