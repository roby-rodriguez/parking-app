import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { AuditLog, LoginData, ParkingAccess, ParkingAccessFormData, ParkingLot } from '../types';

function Admin() {
	const [session, setSession] = useState<any>(null);
	const [parkingAccess, setParkingAccess] = useState<ParkingAccess[]>([]);
	const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
	const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState<'access' | 'logs'>('access');
	const [showLogin, setShowLogin] = useState(false);
	const [loginData, setLoginData] = useState<LoginData>({ email: '', password: '' });
	const [loginError, setLoginError] = useState<string | null>(null);

	// Form state for creating/editing parking access
	const [formData, setFormData] = useState<ParkingAccessFormData>({
		guest_name: '',
		parking_lot_id: 0,
		valid_from: '',
		valid_to: '',
	});
	const [editingId, setEditingId] = useState<string | null>(null);

	useEffect(() => {
		supabase.auth.getSession().then(({ data }) => {
			if (!data.session) {
				setShowLogin(true);
			} else {
				setSession(data.session);
				fetchData();
			}
		});

		supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
			if (session) {
				setShowLogin(false);
				fetchData();
			} else {
				setShowLogin(true);
			}
		});
	}, []);

	const handleLogin = async(e: React.FormEvent) => {
		e.preventDefault();
		setLoginError(null);

		try {
			const { data, error } = await supabase.auth.signInWithPassword({
				email: loginData.email,
				password: loginData.password,
			});

			if (error) {
				setLoginError(error.message);
			} else {
				setSession(data.session);
				setShowLogin(false);
			}
		} catch (error) {
			setLoginError('Login failed. Please try again.');
		}
	};

	const fetchData = async() => {
		setLoading(true);
		try {
			const { data: lotsData } = await supabase
				.from('parking_lots')
				.select('*, gates (name)')
				.order('id');
			if (lotsData) {
				setParkingLots(lotsData);
				// Set default parking lot in form if not already set
				if (formData.parking_lot_id === 0 && lotsData.length > 0) {
					setFormData((prev) => ({ ...prev, parking_lot_id: lotsData[0].id }));
				}
			}

			const { data: accessData } = await supabase
				.from('parking_access')
				.select('*, parking_lots (name, apartment, gates (name))')
				.order('created_at', { ascending: false });
			if (accessData) setParkingAccess(accessData);

			const { data: logsData } = await supabase
				.from('audit_logs')
				.select('*, gates (name), parking_access (guest_name)')
				.order('created_at', { ascending: false })
				.limit(50);
			if (logsData) setAuditLogs(logsData);
		} catch (error) {
			console.error('Error fetching data:', error);
		} finally {
			setLoading(false);
		}
	};

	const createParkingAccess = async() => {
		try {
			await supabase.from('parking_access').insert([formData]);
			fetchData();
			resetForm();
		} catch (error) {
			console.error('Error creating parking access:', error);
		}
	};

	const updateParkingAccess = async() => {
		if (!editingId) return;

		try {
			await supabase.from('parking_access').update(formData).eq('id', editingId);
			fetchData();
			resetForm();
		} catch (error) {
			console.error('Error updating parking access:', error);
		}
	};

	const revokeParkingAccess = async(id: string) => {
		try {
			await supabase.from('parking_access').update({ status: 'revoked' }).eq('id', id);
			fetchData();
		} catch (error) {
			console.error('Error revoking parking access:', error);
		}
	};

	const resetForm = () => {
		setFormData({
			guest_name: '',
			parking_lot_id: parkingLots.length > 0 ? parkingLots[0].id : 0,
			valid_from: '',
			valid_to: '',
		});
		setEditingId(null);
	};

	const startEditing = (item: ParkingAccess) => {
		setFormData({
			guest_name: item.guest_name || '',
			parking_lot_id: item.parking_lot_id,
			valid_from: item.valid_from.split('T')[0],
			valid_to: item.valid_to.split('T')[0],
		});
		setEditingId(item.id);
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

	if (showLogin) {
		return (
			<div className="h-full flex items-center justify-center bg-gray-50">
				<div className="max-w-md w-full space-y-8">
					<div>
						<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
							Parking Admin Login
						</h2>
					</div>
					<form className="mt-8 space-y-6" onSubmit={handleLogin}>
						<div className="rounded-md shadow-sm -space-y-px">
							<div>
								<input
									type="email"
									required
									value={loginData.email}
									onChange={(e) =>
										setLoginData({ ...loginData, email: e.target.value })
									}
									className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
									placeholder="Email address"
								/>
							</div>
							<div>
								<input
									type="password"
									required
									value={loginData.password}
									onChange={(e) =>
										setLoginData({ ...loginData, password: e.target.value })
									}
									className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
									placeholder="Password"
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
								Sign in
							</button>
						</div>
					</form>
				</div>
			</div>
		);
	}

	if (!session) {
		return (
			<div className="h-full flex items-center justify-center bg-gray-50">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
					<p className="mt-4 text-gray-600">Loading...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="h-full bg-gray-50 p-4 sm:p-6 lg:p-8">
			<div className="max-w-7xl mx-auto">
				<div className="bg-white shadow rounded-lg">
					{/* Header */}
					<div className="px-6 py-4 border-b border-gray-200">
						<div className="flex justify-between items-center">
							<h1 className="text-2xl font-bold text-gray-900">
								Parking Access Admin
							</h1>
							<button
								onClick={() => supabase.auth.signOut()}
								className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
							>
								Sign Out
							</button>
						</div>
					</div>

					{/* Tabs */}
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

					{/* Content */}
					<div className="p-6">
						{activeTab === 'access' && (
							<div className="space-y-6">
								{/* Create/Edit Form */}
								<div className="bg-gray-50 p-6 rounded-lg">
									<h2 className="text-lg font-medium text-gray-900 mb-4">
										{editingId
											? 'Edit Parking Access'
											: 'Create New Parking Access'}
									</h2>
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
										<input
											type="text"
											placeholder="Guest Name"
											value={formData.guest_name}
											onChange={(e) =>
												setFormData({
													...formData,
													guest_name: e.target.value,
												})
											}
											className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										/>
										<select
											value={formData.parking_lot_id}
											onChange={(e) =>
												setFormData({
													...formData,
													parking_lot_id: parseInt(e.target.value),
												})
											}
											className="col-span-1 md:col-span-2 px-3 py-2 border border-gray-300 rounded-md"
										>
											{parkingLots.map((lot) => (
												<option key={lot.id} value={lot.id}>
													{`Lot ${lot.name} (Gate: ${lot.gates.name}) - ${lot.apartment}`}
												</option>
											))}
										</select>
										<input
											type="date"
											value={formData.valid_from}
											onChange={(e) =>
												setFormData({
													...formData,
													valid_from: e.target.value,
												})
											}
											className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										/>
										<input
											type="date"
											value={formData.valid_to}
											onChange={(e) =>
												setFormData({
													...formData,
													valid_to: e.target.value,
												})
											}
											className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										/>
									</div>
									<div className="mt-4 flex space-x-3">
										<button
											onClick={
												editingId
													? updateParkingAccess
													: createParkingAccess
											}
											className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
										>
											{editingId ? 'Update' : 'Create'}
										</button>
										{editingId && (
											<button
												onClick={resetForm}
												className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
											>
												Cancel
											</button>
										)}
									</div>
								</div>

								{/* Parking Access List */}
								<div>
									<h2 className="text-lg font-medium text-gray-900 mb-4">
										Parking Access List
									</h2>
									<div className="overflow-x-auto">
										<table className="min-w-full divide-y divide-gray-200">
											<thead className="bg-gray-50">
												<tr>
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
														Guest
													</th>
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
														Parking Lot
													</th>
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
														Valid Period
													</th>
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
														Status
													</th>
													<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
														Actions
													</th>
												</tr>
											</thead>
											<tbody className="bg-white divide-y divide-gray-200">
												{parkingAccess.map((item) => (
													<tr key={item.id}>
														<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
															{item.guest_name || 'Unnamed'}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
															{`Lot ${item.parking_lots.name} (Gate: ${item.parking_lots.gates.name})`}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
															{formatDate(item.valid_from)} -{' '}
															{formatDate(item.valid_to)}
														</td>
														<td className="px-6 py-4 whitespace-nowrap">
															<span
																className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
																	item.status === 'active'
																		? 'bg-green-100 text-green-800'
																		: item.status === 'revoked'
																			? 'bg-red-100 text-red-800'
																			: 'bg-gray-100 text-gray-800'
																}`}
															>
																{item.status}
															</span>
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
															{item.status === 'active' && (
																<>
																	<button
																		onClick={() =>
																			startEditing(item)
																		}
																		className="text-blue-600 hover:text-blue-900"
																	>
																		Edit
																	</button>
																	<button
																		onClick={() =>
																			revokeParkingAccess(
																				item.id,
																			)
																		}
																		className="text-red-600 hover:text-red-900"
																	>
																		Revoke
																	</button>
																</>
															)}
															<a
																href={`/park/${item.uuid}`}
																target="_blank"
																rel="noopener noreferrer"
																className="text-green-600 hover:text-green-900"
															>
																View
															</a>
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</div>
							</div>
						)}

						{activeTab === 'logs' && (
							<div>
								<h2 className="text-lg font-medium text-gray-900 mb-4">
									Audit Logs
								</h2>
								<div className="overflow-x-auto">
									<table className="min-w-full divide-y divide-gray-200">
										<thead className="bg-gray-50">
											<tr>
												<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
													Time
												</th>
												<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
													Action
												</th>
												<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
													Guest
												</th>
												<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
													Gate
												</th>
											</tr>
										</thead>
										<tbody className="bg-white divide-y divide-gray-200">
											{auditLogs.map((log) => (
												<tr key={log.id}>
													<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
														{formatDateTime(log.created_at)}
													</td>
													<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
														{log.action}
													</td>
													<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
														{log.parking_access?.guest_name || 'N/A'}
													</td>
													<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
														{log.gates?.name || 'N/A'}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

export default Admin;
