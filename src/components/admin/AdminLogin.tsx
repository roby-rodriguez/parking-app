import React from 'react';
import { useI18nContext } from '@/context/I18nProvider';
import { LoginData } from '@/types';

type AdminLoginProps = {
	loginData: LoginData;
	loginError: string | null;
	onChange: (data: LoginData) => void;
	onSubmit: (e: React.FormEvent) => void;
};

const AdminLogin: React.FC<AdminLoginProps> = ({ loginData, loginError, onChange, onSubmit }) => {
	const { t } = useI18nContext();

	return (
		<div className="min-h-screen h-full flex items-center justify-center bg-gray-50">
			<div className="max-w-md w-full space-y-8">
				<div>
					<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
						{t('parking_admin_login')}
					</h2>
				</div>
			<form className="mt-8 space-y-6" onSubmit={onSubmit}>
				<div className="rounded-md shadow-sm -space-y-px">
					<div>
						<input
							type="email"
							required
							value={loginData.email}
							onChange={(e) => onChange({ ...loginData, email: e.target.value })}
							className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
							placeholder={t('email_address')}
						/>
					</div>
					<div>
						<input
							type="password"
							required
							value={loginData.password}
							onChange={(e) => onChange({ ...loginData, password: e.target.value })}
							className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
							placeholder={t('password')}
						/>
					</div>
				</div>
				{loginError && (
					<div className="text-red-600 text-sm text-center">{loginError}</div>
				)}
				<div>
					<button
						type="submit"
						className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
					>
						{t('sign_in')}
					</button>
				</div>
			</form>
		</div>
	</div>
	);
};

export default AdminLogin;
