import React, { Fragment } from 'react';
import ParkingAccessCard from './ParkingAccessCard';
import ParkingAccessTable from './ParkingAccessTable';
import { ParkingAccess } from '@/types';

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
	return (
		<Fragment>
			<h2 className="text-lg font-medium text-gray-900 mb-4">Parking Access List</h2>

			{/* Mobile/Tablet Cards View (< 800px) */}
			<div className="space-y-4 overflow-y-auto lg:hidden">
				{parkingAccess.map((item) => (
					<ParkingAccessCard
						key={item.id}
						item={item}
						onEdit={onEdit}
						onRevoke={onRevoke}
						onDelete={onDelete}
						formatDate={formatDate}
					/>
				))}
			</div>

			{/* Desktop Table View (≥ 800px) */}
			<div className="hidden lg:block">
				<ParkingAccessTable
					parkingAccess={parkingAccess}
					onEdit={onEdit}
					onRevoke={onRevoke}
					onDelete={onDelete}
					formatDate={formatDate}
				/>
			</div>
		</Fragment>
	);
};

export default ParkingAccessList;
