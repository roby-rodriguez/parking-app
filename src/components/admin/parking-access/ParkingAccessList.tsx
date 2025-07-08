import React from 'react';
import { ActionDefinition, ColumnDefinition, DataView } from '../shared';
import { useConfirmContext } from '@/context/ConfirmDialogProvider';
import { useI18nContext } from '@/context/I18nProvider';
import { ParkingAccess } from '@/types';
import { useLocalizedDate } from '@/utils/dateUtils';
import { getEffectiveStatus, getStatusColorClasses, getStatusLabel } from '@/utils/statusUtils';

type ParkingAccessListProps = {
	parkingAccess: ParkingAccess[];
	onEdit: (item: ParkingAccess) => void;
	onSuspend: (id: string) => void;
	onDelete: (id: string) => void;
	onResume: (id: string) => void;
	refetchHistory: (t: (key: string) => string) => Promise<void>;
};

const ParkingAccessList: React.FC<ParkingAccessListProps> = ({
	parkingAccess,
	onEdit,
	onSuspend,
	onDelete,
	onResume,
	refetchHistory,
}) => {
	const { t } = useI18nContext();
	const { formatDate } = useLocalizedDate();
	const confirm = useConfirmContext();

	const columns: ColumnDefinition<ParkingAccess>[] = [
		{
			key: 'guest',
			label: t('guest_name'),
			width: 'w-32',
			render: (item) => item.guest_name || '-',
		},
		{
			key: 'parking_lot',
			label: t('parking_lot'),
			width: 'w-32',
			render: (item) => item.parking_lots.name,
		},
		{
			key: 'gate',
			label: t('gate'),
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
			label: t('status'),
			width: 'w-24',
			render: (item) => {
				const effectiveStatus = getEffectiveStatus(item);
				return (
					<span
						className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColorClasses(effectiveStatus)}`}
					>
						{t(getStatusLabel(effectiveStatus).toLowerCase())}
					</span>
				);
			},
		},
		{
			key: 'apartment',
			label: t('apartment'),
			width: 'w-32',
			render: (item) => item.parking_lots.apartment,
		},
		{
			key: 'address',
			label: t('address'),
			width: 'w-48',
			render: (item) => item.parking_lots.address,
		},
		{
			key: 'valid_period',
			label: t('valid_period'),
			width: 'w-40',
			render: (item) => `${formatDate(item.valid_from)} - ${formatDate(item.valid_to)}`,
		},
	];

	const handleDelete = async (item: ParkingAccess) => {
		const ok = await confirm({
			message: t('are_you_sure_delete')
				.replace('{apartment}', item.parking_lots.apartment)
				.replace('{guest}', item.guest_name ? ` (${item.guest_name})` : '')
				.replace(
					'{period}',
					`${formatDate(item.valid_from)} – ${formatDate(item.valid_to)}`,
				),
			confirmLabel: t('delete'),
			cancelLabel: t('cancel'),
		});
		if (ok) {
			await onDelete(item.id);
			await refetchHistory(t);
		}
	};

	const handleSuspend = async (item: ParkingAccess) => {
		const ok = await confirm({
			message: t('are_you_sure_suspend')
				.replace('{apartment}', item.parking_lots.apartment)
				.replace('{guest}', item.guest_name ? ` (${item.guest_name})` : '')
				.replace(
					'{period}',
					`${formatDate(item.valid_from)} – ${formatDate(item.valid_to)}`,
				),
			confirmLabel: t('suspend'),
			cancelLabel: t('cancel'),
		});
		if (ok) {
			await onSuspend(item.id);
			await refetchHistory(t);
		}
	};

	const handleResume = async (item: ParkingAccess) => {
		const ok = await confirm({
			message: t('are_you_sure_resume')
				.replace('{apartment}', item.parking_lots.apartment)
				.replace('{guest}', item.guest_name ? ` (${item.guest_name})` : '')
				.replace(
					'{period}',
					`${formatDate(item.valid_from)} – ${formatDate(item.valid_to)}`,
				),
			confirmLabel: t('resume'),
			cancelLabel: t('cancel'),
		});
		if (ok) {
			await onResume(item.id);
			await refetchHistory(t);
		}
	};

	const actions: ActionDefinition<ParkingAccess>[] = [
		{
			key: 'view',
			label: t('view'),
			variant: 'secondary',
			onClick: (item) => {
				window.open(`/park/${item.uuid}`, '_blank', 'noopener,noreferrer');
			},
		},
		{
			key: 'edit',
			label: t('edit'),
			variant: 'primary',
			onClick: onEdit,
			hidden: (item) => {
				const effectiveStatus = getEffectiveStatus(item);
				return !['active', 'pending', 'expired'].includes(effectiveStatus);
			},
		},
		{
			key: 'suspend',
			label: t('suspend'),
			variant: 'neutral',
			onClick: handleSuspend,
			hidden: (item) => {
				const status = getEffectiveStatus(item);
				return status !== 'active';
			},
		},
		{
			key: 'resume',
			label: t('resume'),
			variant: 'primary',
			onClick: handleResume,
			hidden: (item) => getEffectiveStatus(item) !== 'suspended',
		},
		{
			key: 'delete',
			label: t('delete'),
			variant: 'danger',
			onClick: handleDelete,
			hidden: (item) => false,
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
						Ap. {item.parking_lots?.apartment}:
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
			title={t('parking_access_admin') + ' ' + t('actions')}
			data={parkingAccess}
			columns={columns}
			actions={actions}
			emptyMessage={t('no_records')}
			cardHeaderRenderer={cardHeaderRenderer}
			cardContentKeys={['status', 'guest', 'parking_lot', 'gate']}
		/>
	);
};

export default ParkingAccessList;
