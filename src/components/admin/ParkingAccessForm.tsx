import React from 'react';
import { ParkingAccessFormData, ParkingLot } from '@/types';

type ParkingAccessFormProps = {
	formData: ParkingAccessFormData;
	parkingLots: ParkingLot[];
	onChange: (data: ParkingAccessFormData) => void;
	onSubmit: () => void;
	onCancel?: () => void;
	editingId: string | null;
};

const ParkingAccessForm: React.FC<ParkingAccessFormProps> = ({
	formData,
	parkingLots,
	onChange,
	onSubmit,
	onCancel,
	editingId,
}) => (
	<div className="bg-gray-50 p-6 rounded-lg">
		<h2 className="text-lg font-medium text-gray-900 mb-4">
			{editingId ? 'Edit Parking Access' : 'Create New Parking Access'}
		</h2>
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
			<input
				type="text"
				placeholder="Guest Name"
				value={formData.guest_name}
				onChange={(e) => onChange({ ...formData, guest_name: e.target.value })}
				className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
			/>
			<select
				value={formData.parking_lot_id}
				onChange={(e) => onChange({ ...formData, parking_lot_id: parseInt(e.target.value) })}
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
				onChange={(e) => onChange({ ...formData, valid_from: e.target.value })}
				className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
			/>
			<input
				type="date"
				value={formData.valid_to}
				onChange={(e) => onChange({ ...formData, valid_to: e.target.value })}
				className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
			/>
		</div>
		<div className="mt-4 flex space-x-3">
			<button
				onClick={onSubmit}
				className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
			>
				{editingId ? 'Update' : 'Create'}
			</button>
			{editingId && onCancel && (
				<button
					onClick={onCancel}
					className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
				>
					Cancel
				</button>
			)}
		</div>
	</div>
);

export default ParkingAccessForm; 