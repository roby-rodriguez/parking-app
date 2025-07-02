import React, { useState } from 'react';
import {
	AdminHeader,
	AdminLoading,
	AdminLogin,
	AdminTabs,
	AuditLogsTable,
	ParkingAccessForm,
	ParkingAccessHistoryTable,
	ParkingAccessList,
} from '@/components/admin';
import {
	useAuditLogs,
	useAuth,
	useParkingAccess,
	useParkingAccessHistory,
	useParkingLots,
} from '@/hooks';
import { LoginData, ParkingAccess, ParkingAccessFormData } from '@/types';

export default function Admin() {
	const { session, loading: authLoading, login, logout } = useAuth();
	const { parkingLots, loading: lotsLoading } = useParkingLots();
	const {
		parkingAccess,
		loading: accessLoading,
		createParkingAccess,
		revokeParkingAccess,
		deleteParkingAccess,
	} = useParkingAccess();
	const { auditLogs, loading: logsLoading } = useAuditLogs();
	const { parkingAccessHistory, loading: historyLoading } = useParkingAccessHistory();
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
		const { error } = await createParkingAccess(formData);
		if (!error) {
			// Reset form on success
			setFormData({
				guest_name: '',
				parking_lot_id: parkingLots.length > 0 ? parkingLots[0].id : 0,
				valid_from: '',
				valid_to: '',
			});
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

	const handleRevoke = async (id: string) => {
		await revokeParkingAccess(id);
	};

	const handleDelete = async (id: string) => {
		await deleteParkingAccess(id);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	};

	const formatDateTime = (dateString: string) => {
		return new Date(dateString).toLocaleString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

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

	const isLoading = lotsLoading || accessLoading || logsLoading || historyLoading;

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
									<ParkingAccessList
										parkingAccess={parkingAccess}
										onEdit={handleEdit}
										onRevoke={handleRevoke}
										onDelete={handleDelete}
										formatDate={formatDate}
									/>
								</div>
							) : activeTab === 'history' ? (
								<ParkingAccessHistoryTable
									parkingAccessHistory={parkingAccessHistory}
									formatDate={formatDate}
								/>
							) : (
								<AuditLogsTable
									auditLogs={auditLogs}
									formatDateTime={formatDateTime}
								/>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
