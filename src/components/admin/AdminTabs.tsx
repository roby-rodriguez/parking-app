import React from 'react';

type AdminTabsProps = {
	activeTab: 'access' | 'logs' | 'history';
	setActiveTab: (tab: 'access' | 'logs' | 'history') => void;
};

const AdminTabs: React.FC<AdminTabsProps> = ({ activeTab, setActiveTab }) => (
	<div className="border-b border-gray-200">
		<nav className="-mb-px flex space-x-8 px-6">
			<button
				onClick={() => setActiveTab('access')}
				className={`py-4 px-1 border-b-2 font-medium text-sm ${
					activeTab === 'access'
						? 'border-blue-500 text-blue-600'
						: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
				}`}
			>
				Parking Access
			</button>
			<button
				onClick={() => setActiveTab('history')}
				className={`py-4 px-1 border-b-2 font-medium text-sm ${
					activeTab === 'history'
						? 'border-blue-500 text-blue-600'
						: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
				}`}
			>
				History
			</button>
			<button
				onClick={() => setActiveTab('logs')}
				className={`py-4 px-1 border-b-2 font-medium text-sm ${
					activeTab === 'logs'
						? 'border-blue-500 text-blue-600'
						: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
				}`}
			>
				Audit Logs
			</button>
		</nav>
	</div>
);

export default AdminTabs;
