import React from 'react';
import { useI18nContext } from '@/context/I18nProvider';

const AdminLoading: React.FC = () => {
	const { t } = useI18nContext();
	return (
		<div className="flex flex-1 items-center justify-center bg-gray-50">
			<div className="text-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
				<p className="mt-4 text-gray-600">{t('loading')}</p>
			</div>
		</div>
	);
};

export default AdminLoading;
