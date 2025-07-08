import React from 'react';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';
import { useI18nContext } from '@/context/I18nProvider';

type AdminHeaderProps = {
	onSignOut: () => void;
};

const AdminHeader: React.FC<AdminHeaderProps> = ({ onSignOut }) => {
	const { t } = useI18nContext();
	return (
		<div className="px-6 py-4 border-b border-gray-200">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold text-gray-900 max-[500px]:hidden">{t('admin')}</h1>
				<div className="flex items-center space-x-2">
					<LanguageSwitcher />
					<button
						onClick={onSignOut}
						className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
					>
						{t('sign_out')}
					</button>
				</div>
			</div>
		</div>
	);
};

export default AdminHeader;
