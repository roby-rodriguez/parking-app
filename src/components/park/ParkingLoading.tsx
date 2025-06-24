import React from 'react';

const ParkingLoading: React.FC = () => (
	<div className="h-full flex items-center justify-center bg-gray-50">
		<div className="text-center">
			<div 
				className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"
				role="status"
				aria-label="Loading parking access"
			></div>
			<p className="mt-4 text-gray-600 animate-pulse">Loading parking access...</p>
		</div>
	</div>
);

export default ParkingLoading; 