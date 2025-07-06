import React from 'react';
import { useI18nContext } from '@/context/I18nProvider';

type AdminTabsProps = {
	activeTab: 'access' | 'logs' | 'history';
	setActiveTab: (tab: 'access' | 'logs' | 'history') => void;
};

const AdminTabs: React.FC<AdminTabsProps> = ({ activeTab, setActiveTab }) => {
	const { t } = useI18nContext();
	return (
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
					{t('parking_access_admin')}
				</button>
				<button
					onClick={() => setActiveTab('history')}
					className={`py-4 px-1 border-b-2 font-medium text-sm ${
						activeTab === 'history'
							? 'border-blue-500 text-blue-600'
							: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
					}`}
				>
					{t('history')}
				</button>
				<button
					onClick={() => setActiveTab('logs')}
					className={`py-4 px-1 border-b-2 font-medium text-sm ${
						activeTab === 'logs'
							? 'border-blue-500 text-blue-600'
							: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
					}`}
				>
					{t('audit_logs')}
				</button>
			</nav>
		</div>
	);
};

export default AdminTabs;
