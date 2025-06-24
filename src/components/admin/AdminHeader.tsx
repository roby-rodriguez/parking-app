import React from 'react';

type AdminHeaderProps = {
	onSignOut: () => void;
};

const AdminHeader: React.FC<AdminHeaderProps> = ({ onSignOut }) => (
	<div className="px-6 py-4 border-b border-gray-200">
		<div className="flex justify-between items-center">
			<h1 className="text-2xl font-bold text-gray-900">Parking Access Admin</h1>
			<button
				onClick={onSignOut}
				className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
			>
				Sign Out
			</button>
		</div>
	</div>
);

export default AdminHeader; 