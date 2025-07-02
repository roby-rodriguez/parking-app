import React from 'react';
import { ParkingAccess } from '@/types';
import { getEffectiveStatus } from '@/utils/statusUtils';

type ParkingAccessActionsProps = {
	item: ParkingAccess;
	onEdit: (item: ParkingAccess) => void;
	onRevoke: (id: string) => void;
	onDelete: (id: string) => void;
	variant?: 'card' | 'table';
};

const ParkingAccessActions: React.FC<ParkingAccessActionsProps> = ({
	item,
	onEdit,
	onRevoke,
	onDelete,
	variant = 'card',
}) => {
	const effectiveStatus = getEffectiveStatus(item);
	const baseClasses = variant === 'card' ? 'text-sm font-medium' : '';

	return (
		<>
			<a
				href={`/park/${item.uuid}`}
				target="_blank"
				rel="noopener noreferrer"
				className={`text-green-600 hover:text-green-900 ${baseClasses}`}
			>
				View
			</a>
			{effectiveStatus === 'active' && (
				<>
					<button
						onClick={() => onEdit(item)}
						className={`text-blue-600 hover:text-blue-900 cursor-pointer ${baseClasses}`}
					>
						Edit
					</button>
					<button
						onClick={() => onRevoke(item.id)}
						className={`text-gray-600 hover:text-gray-900 cursor-pointer ${baseClasses}`}
					>
						Revoke
					</button>
					<button
						onClick={() => onDelete(item.id)}
						className={`text-red-600 hover:text-red-900 cursor-pointer ${baseClasses}`}
					>
						Delete
					</button>
				</>
			)}
			{effectiveStatus === 'pending' && (
				<>
					<button
						onClick={() => onEdit(item)}
						className={`text-blue-600 hover:text-blue-900 cursor-pointer ${baseClasses}`}
					>
						Edit
					</button>
					<button
						onClick={() => onDelete(item.id)}
						className={`text-gray-600 hover:text-gray-900 cursor-pointer ${baseClasses}`}
					>
						Delete
					</button>
				</>
			)}
		</>
	);
};

export default ParkingAccessActions;
