import React from 'react';

type ParkingErrorProps = {
	error: string;
	onRetry?: () => void;
};

const ParkingError: React.FC<ParkingErrorProps> = ({ error, onRetry }) => (
	<div className="h-full flex items-center justify-center bg-gray-50">
		<div className="text-center max-w-md mx-auto p-6">
			<div className="text-red-500 text-6xl mb-4" role="img" aria-label="Warning">⚠️</div>
			<h1 className="text-2xl font-bold text-gray-900 mb-4">Access Error</h1>
			<p className="text-gray-600 mb-6">{error}</p>
			<p className="text-sm text-gray-500 mb-6">Please contact the front desk for assistance.</p>
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

export default ParkingError;
