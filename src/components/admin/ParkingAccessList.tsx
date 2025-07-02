import React from 'react';
import { ParkingAccess } from '@/types';
import { getEffectiveStatus, getStatusColorClasses, getStatusLabel } from '@/utils/statusUtils';

type ParkingAccessListProps = {
	parkingAccess: ParkingAccess[];
	onEdit: (item: ParkingAccess) => void;
	onRevoke: (id: string) => void;
	onDelete: (id: string) => void;
	formatDate: (dateString: string) => string;
};

const ParkingAccessList: React.FC<ParkingAccessListProps> = ({
	parkingAccess,
	onEdit,
	onRevoke,
	onDelete,
	formatDate,
}) => {
	const renderCard = (item: ParkingAccess) => {
		const effectiveStatus = getEffectiveStatus(item);
		return (
			<div
				key={item.id}
				className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
			>
				<div className="flex justify-between items-start mb-3">
					<div className="flex-1">
						<h3 className="text-lg font-semibold text-gray-900 mb-1">
							{item.guest_name || 'Unnamed Guest'}
						</h3>
						<div className="flex items-center space-x-2 mb-2">
							<span
								className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColorClasses(effectiveStatus)}`}
							>
								{getStatusLabel(effectiveStatus)}
							</span>
						</div>
					</div>
					<div className="flex space-x-2">
						<a
							href={`/park/${item.uuid}`}
							target="_blank"
							rel="noopener noreferrer"
							className="text-green-600 hover:text-green-900 text-sm font-medium"
						>
							View
						</a>
						{effectiveStatus === 'active' && (
							<>
								<button
									onClick={() => onEdit(item)}
									className="text-blue-600 hover:text-blue-900 text-sm font-medium"
								>
									Edit
								</button>
								<button
									onClick={() => onRevoke(item.id)}
									className="text-gray-600 hover:text-gray-900 text-sm font-medium"
								>
									Revoke
								</button>
								<button
									onClick={() => onDelete(item.id)}
									className="text-red-600 hover:text-red-900 text-sm font-medium"
								>
									Delete
								</button>
							</>
						)}
						{effectiveStatus === 'pending' && (
							<>
								<button
									onClick={() => onEdit(item)}
									className="text-blue-600 hover:text-blue-900 text-sm font-medium"
								>
									Edit
								</button>
								<button
									onClick={() => onDelete(item.id)}
									className="text-gray-600 hover:text-gray-900 text-sm font-medium"
								>
									Delete
								</button>
							</>
						)}
					</div>
				</div>

				<div className="grid grid-cols-1 gap-3 text-sm">
					<div className="flex justify-between items-center py-2 border-b border-gray-100">
						<span className="text-gray-600 font-medium">Parking Lot:</span>
						<span className="text-gray-900">{item.parking_lots.name}</span>
					</div>

					<div className="flex justify-between items-center py-2 border-b border-gray-100">
						<span className="text-gray-600 font-medium">Gate:</span>
						<span className="text-gray-900">{item.parking_lots.gates.description}</span>
					</div>

					<div className="flex justify-between items-center py-2 border-b border-gray-100">
						<span className="text-gray-600 font-medium">Apartment:</span>
						<span className="text-gray-900">{item.parking_lots.apartment}</span>
					</div>

					<div className="flex justify-between items-start py-2 border-b border-gray-100">
						<span className="text-gray-600 font-medium">Address:</span>
						<span className="text-gray-900 text-right">
							{item.parking_lots.address}
						</span>
					</div>

					<div className="flex justify-between items-center py-2">
						<span className="text-gray-600 font-medium">Valid Period:</span>
						<span className="text-gray-900">
							{formatDate(item.valid_from)} - {formatDate(item.valid_to)}
						</span>
					</div>
				</div>
			</div>
		);
	};

	return (
		<div>
			<h2 className="text-lg font-medium text-gray-900 mb-4">Parking Access List</h2>

			{/* Mobile/Tablet Cards View (< 800px) */}
			<div className="block lg:hidden">
				<div className="space-y-4 overflow-y-auto">{parkingAccess.map(renderCard)}</div>
			</div>

			{/* Desktop Table View (≥ 800px) */}
			<div className="hidden lg:block">
				<table className="w-full divide-y divide-gray-200 text-left">
					<thead className="bg-gray-50">
						<tr>
							<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
								Guest
							</th>
							<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
								Parking Lot
							</th>
							<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
								Gate
							</th>
							<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
								Apartment
							</th>
							<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
								Address
							</th>
							<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
								Valid Period
							</th>
							<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
								Status
							</th>
							<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="bg-white divide-y divide-gray-200">
						{parkingAccess.map((item) => {
							const effectiveStatus = getEffectiveStatus(item);
							return (
								<tr key={item.id}>
									<td className="px-4 py-4 text-sm font-medium text-gray-900">
										{item.guest_name || 'Unnamed'}
									</td>
									<td className="px-4 py-4 text-sm text-gray-500">
										{item.parking_lots.name}
									</td>
									<td className="px-4 py-4 text-sm text-gray-500">
										{item.parking_lots.gates.description}
									</td>
									<td className="px-4 py-4 text-sm text-gray-500">
										{item.parking_lots.apartment}
									</td>
									<td className="px-4 py-4 text-sm text-gray-500">
										{item.parking_lots.address}
									</td>
									<td className="px-4 py-4 text-sm text-gray-500">
										{formatDate(item.valid_from)} - {formatDate(item.valid_to)}
									</td>
									<td className="px-4 py-4">
										<span
											className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColorClasses(effectiveStatus)}`}
										>
											{getStatusLabel(effectiveStatus)}
										</span>
									</td>
									<td className="px-4 py-4 text-sm font-medium space-x-2">
										<a
											href={`/park/${item.uuid}`}
											target="_blank"
											rel="noopener noreferrer"
											className="text-green-600 hover:text-green-900"
										>
											View
										</a>
										{effectiveStatus === 'active' && (
											<>
												<button
													onClick={() => onEdit(item)}
													className="text-blue-600 hover:text-blue-900"
												>
													Edit
												</button>
												<button
													onClick={() => onRevoke(item.id)}
													className="text-gray-600 hover:text-gray-900"
												>
													Revoke
												</button>
												<button
													onClick={() => onDelete(item.id)}
													className="text-red-600 hover:text-gray-900"
												>
													Delete
												</button>
											</>
										)}
										{effectiveStatus === 'pending' && (
											<>
												<button
													onClick={() => onEdit(item)}
													className="text-blue-600 hover:text-blue-900"
												>
													Edit
												</button>
												<button
													onClick={() => onDelete(item.id)}
													className="text-gray-600 hover:text-gray-900"
												>
													Delete
												</button>
											</>
										)}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default ParkingAccessList;
