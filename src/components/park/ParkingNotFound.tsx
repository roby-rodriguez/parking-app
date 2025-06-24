import React from 'react';

type ParkingNotFoundProps = {
	onRetry?: () => void;
};

const ParkingNotFound: React.FC<ParkingNotFoundProps> = ({ onRetry }) => (
	<div className="h-full flex items-center justify-center bg-gray-50">
		<div className="text-center">
			<div className="text-gray-400 text-6xl mb-4" role="img" aria-label="Not found">🔍</div>
			<p className="text-gray-600 mb-4">Parking access not found.</p>
			{onRetry && (
				<button
					onClick={onRetry}
					className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
					aria-label="Retry loading parking access"
				>
					Try Again
				</button>
			)}
		</div>
	</div>
);

export default ParkingNotFound; 