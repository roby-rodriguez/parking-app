import React from 'react';
import { ActionDefinition, ColumnDefinition, DataView } from '../shared';
import { useConfirmContext } from '@/context/ConfirmDialogProvider';
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
	const confirm = useConfirmContext();

	const columns: ColumnDefinition<ParkingAccess>[] = [
		{
			key: 'guest',
			label: 'Guest',
			width: 'w-32',
			render: (item) => item.guest_name || '-',
		},
		{
			key: 'parking_lot',
			label: 'Parking Lot',
			width: 'w-32',
			render: (item) => item.parking_lots.name,
		},
		{
			key: 'gate',
			label: 'Gate',
			width: 'w-40',
			render: (item) => (
				<>
					{item.parking_lots.gates.name}{' '}
					{item.parking_lots.gates.description
						? `(${item.parking_lots.gates.description})`
						: ''}
				</>
			),
		},
		{
			key: 'status',
			label: 'Status',
			width: 'w-24',
			render: (item) => {
				const effectiveStatus = getEffectiveStatus(item);
				return (
					<span
						className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColorClasses(effectiveStatus)}`}
					>
						{getStatusLabel(effectiveStatus)}
					</span>
				);
			},
		},
		{
			key: 'apartment',
			label: 'Apartment',
			width: 'w-32',
			render: (item) => item.parking_lots.apartment,
		},
		{
			key: 'address',
			label: 'Address',
			width: 'w-48',
			render: (item) => item.parking_lots.address,
		},
		{
			key: 'valid_period',
			label: 'Valid Period',
			width: 'w-40',
			render: (item) => `${formatDate(item.valid_from)} - ${formatDate(item.valid_to)}`,
		},
	];

	const handleDelete = async (item: ParkingAccess) => {
		const ok = await confirm({
			message: `Are you sure you want to permanently delete parking access for Ap. ${item.parking_lots.apartment}${item.guest_name ? ` (${item.guest_name})` : ''} for the period ${formatDate(item.valid_from)} – ${formatDate(item.valid_to)}?`,
			confirmLabel: 'Delete',
			cancelLabel: 'Cancel',
		});
		if (ok) {
			await onDelete(item.id);
		}
	};

	const handleRevoke = async (item: ParkingAccess) => {
		const ok = await confirm({
			message: `Are you sure you want to revoke parking access for Ap. ${item.parking_lots.apartment}${item.guest_name ? ` (${item.guest_name})` : ''} for the period ${formatDate(item.valid_from)} – ${formatDate(item.valid_to)}?`,
			confirmLabel: 'Revoke',
			cancelLabel: 'Cancel',
		});
		if (ok) {
			await onRevoke(item.id);
		}
	};

	const actions: ActionDefinition<ParkingAccess>[] = [
		{
			key: 'view',
			label: 'View',
			variant: 'secondary',
			onClick: (item) => {
				window.open(`/park/${item.uuid}`, '_blank', 'noopener,noreferrer');
			},
		},
		{
			key: 'edit',
			label: 'Edit',
			variant: 'primary',
			onClick: onEdit,
			hidden: (item) => {
				const effectiveStatus = getEffectiveStatus(item);
				return !['active', 'pending'].includes(effectiveStatus);
			},
		},
		{
			key: 'revoke',
			label: 'Revoke',
			variant: 'neutral',
			onClick: handleRevoke,
			hidden: (item) => {
				const effectiveStatus = getEffectiveStatus(item);
				return effectiveStatus !== 'active';
			},
		},
		{
			key: 'delete',
			label: 'Delete',
			variant: 'danger',
			onClick: handleDelete,
			hidden: (item) => {
				const effectiveStatus = getEffectiveStatus(item);
				return !['active', 'pending'].includes(effectiveStatus);
			},
		},
	];

	// Custom card header renderer for ParkingAccess
	const cardHeaderRenderer = (item: ParkingAccess) => {
		const effectiveStatus = getEffectiveStatus(item);

		// Get status-specific border colors
		const getStatusBorderClasses = (status: string) => {
			switch (status) {
				case 'active':
					return 'border-green-100 bg-green-500';
				case 'expired':
					return 'border-orange-100 bg-orange-500';
				case 'revoked':
					return 'border-gray-100 bg-gray-500';
				case 'pending':
					return 'border-blue-100 bg-blue-500';
				default:
					return 'border-gray-100 bg-gray-500';
			}
		};

		return (
			<div className="flex items-center space-x-3">
				{/* Status Circle with Highlighted Border */}
				<div
					className={`w-3 h-3 rounded-full border-2 ${getStatusBorderClasses(effectiveStatus)}`}
				></div>

				{/* Apartment and Valid Period */}
				<div className="flex items-center space-x-2">
					<span className="text-sm font-medium text-gray-900">
						Ap. {item.parking_lots.apartment}:
					</span>
					<span className="text-sm text-gray-600">
						{formatDate(item.valid_from)} - {formatDate(item.valid_to)}
					</span>
				</div>
			</div>
		);
	};

	return (
		<DataView
			title="Parking Access List"
			data={parkingAccess}
			columns={columns}
			actions={actions}
			emptyMessage="No parking access records found."
			cardHeaderRenderer={cardHeaderRenderer}
			cardContentKeys={['status', 'guest', 'parking_lot', 'gate']}
		/>
	);
};

export default ParkingAccessList;
