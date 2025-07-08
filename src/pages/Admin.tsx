import React, { useEffect, useState } from 'react';
import {
	AdminHeader,
	AdminLoading,
	AdminLogin,
	AdminTabs,
	AuditLogs,
	History,
	ParkingAccessForm,
	ParkingAccessList,
} from '@/components/admin';
import { ConfirmDialogProvider } from '@/context/ConfirmDialogProvider';
import { useI18nContext } from '@/context/I18nProvider';
import { useToastContext } from '@/context/ToastProvider';
import {
	useAuditLogs,
	useAuth,
	useParkingAccess,
	useParkingAccessHistory,
} from '@/hooks';
import { LoginData, ParkingAccess, ParkingAccessFormData } from '@/types';

export default function Admin() {
	const { t } = useI18nContext();
	const { show: showToast } = useToastContext();
	const { session, loading: authLoading, login, logout } = useAuth();
	const {
		parkingAccess,
		parkingLots,
		loading: accessLoading,
		createParkingAccess,
		suspendParkingAccess,
		deleteParkingAccess,
		resumeParkingAccess,
		updateParkingAccess,
		refetch: refetchParkingAccess,
	} = useParkingAccess();
	const {
		auditLogs,
		loading: logsLoading,
		refetch: refetchAuditLogs,
	} = useAuditLogs();
	const {
		parkingAccessHistory,
		loading: historyLoading,
		refetch: refetchHistory,
	} = useParkingAccessHistory();
	const [activeTab, setActiveTab] = useState<'access' | 'logs' | 'history'>('access');

	// Login state
	const [loginData, setLoginData] = useState<LoginData>({ email: '', password: '' });
	const [loginError, setLoginError] = useState<string | null>(null);

	// Form state
	const [formData, setFormData] = useState<ParkingAccessFormData>({
		guest_name: '',
		parking_lot_id: parkingLots.length > 0 ? parkingLots[0].id : 0,
		valid_from: '',
		valid_to: '',
	});
	const [editingId, setEditingId] = useState<string | null>(null);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoginError(null);
		const { error } = await login(loginData);
		if (error) {
			setLoginError(error);
		}
	};

	const handleSubmit = async () => {
		// Append 12:00 time to dates before submitting
		const formDataWithTime = {
			...formData,
			valid_from: formData.valid_from ? `${formData.valid_from}T09:00:00` : '',
			valid_to: formData.valid_to ? `${formData.valid_to}T09:00:00` : '',
		};

		if (editingId) {
			// Update existing parking access
			const { error } = await updateParkingAccess(editingId, formDataWithTime);
			if (!error) {
				showToast(t('parking_access_updated_successfully'), 'success');
				setEditingId(null);
				setFormData({
					guest_name: '',
					parking_lot_id: parkingLots.length > 0 ? parkingLots[0].id : 0,
					valid_from: '',
					valid_to: '',
				});
			} else {
				showToast(error, 'error');
			}
		} else {
			// Create new parking access
			const { error } = await createParkingAccess(formDataWithTime);
			if (!error) {
				showToast(t('parking_access_created_successfully'), 'success');
				setFormData({
					guest_name: '',
					parking_lot_id: parkingLots.length > 0 ? parkingLots[0].id : 0,
					valid_from: '',
					valid_to: '',
				});
			} else {
				showToast(error, 'error');
			}
		}
	};

	const handleCancel = () => {
		setEditingId(null);
		setFormData({
			guest_name: '',
			parking_lot_id: parkingLots.length > 0 ? parkingLots[0].id : 0,
			valid_from: '',
			valid_to: '',
		});
	};

	const handleEdit = (item: ParkingAccess) => {
		setFormData({
			guest_name: item.guest_name || '',
			parking_lot_id: item.parking_lot_id,
			valid_from: item.valid_from.split('T')[0],
			valid_to: item.valid_to.split('T')[0],
		});
		setEditingId(item.id);
	};

	const handleSuspend = async (id: string) => {
		const { error } = await suspendParkingAccess(id);
		if (!error) {
			showToast(t('parking_access_suspended'), 'success');
		} else {
			showToast(error, 'error');
		}
	};

	const handleDelete = async (id: string) => {
		const { error } = await deleteParkingAccess(id);
		if (!error) {
			showToast(t('parking_access_deleted'), 'success');
		} else {
			showToast(error, 'error');
		}
	};

	const handleResume = async (id: string) => {
		const { error } = await resumeParkingAccess(id);
		if (!error) {
			showToast(t('parking_access_resumed'), 'success');
		} else {
			showToast(error, 'error');
		}
	};

	useEffect(() => {
		if (parkingLots.length > 0) {
			setFormData((prev) => ({
				...prev,
				parking_lot_id: parkingLots[0].id,
			}));
		}
	}, [parkingLots]);

	useEffect(() => {
		if (session) {
			refetchParkingAccess();
			refetchAuditLogs();
			refetchHistory();
		}
	}, [session]);

	if (authLoading) {
		return (
			<div className="flex flex-col min-h-screen h-full">
				<AdminLoading />
			</div>
		);
	}

	if (!session) {
		return (
			<AdminLogin
				loginData={loginData}
				loginError={loginError}
				onChange={setLoginData}
				onSubmit={handleLogin}
			/>
		);
	}

	const isLoading = accessLoading || logsLoading || historyLoading;

	return (
		<div className="flex flex-col min-h-screen h-full bg-gray-50 p-2 sm:p-4 lg:p-6">
			<div className="flex flex-col flex-1 bg-white shadow rounded-lg">
				<AdminHeader onSignOut={logout} />
				<AdminTabs activeTab={activeTab} setActiveTab={setActiveTab} />
				<div className="flex flex-col flex-1 p-4 lg:p-6">
					{isLoading ? (
						<AdminLoading />
					) : (
						<div className="mt-4 lg:mt-6">
							{activeTab === 'access' ? (
								<div className="space-y-6">
									<ParkingAccessForm
										formData={formData}
										parkingLots={parkingLots}
										onChange={setFormData}
										onSubmit={handleSubmit}
										onCancel={handleCancel}
										editingId={editingId}
									/>
									<ConfirmDialogProvider>
										<ParkingAccessList
											parkingAccess={parkingAccess}
											onEdit={handleEdit}
											onSuspend={handleSuspend}
											onDelete={handleDelete}
											onResume={handleResume}
											refetchHistory={refetchHistory}
										/>
									</ConfirmDialogProvider>
								</div>
							) : activeTab === 'history' ? (
								<History
									parkingAccessHistory={parkingAccessHistory}
								/>
							) : (
								<AuditLogs auditLogs={auditLogs} />
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
