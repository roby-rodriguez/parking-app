import React, { useEffect, useRef, useState } from 'react';
import { useI18nContext } from '@/context/I18nProvider';
import { ParkingAccessFormData, ParkingLot } from '@/types';
import {
	getMinEndDate,
	getMinStartDate,
	validateParkingAccessForm,
	ValidationError,
} from '@/utils/validationUtils';

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
}) => {
	const { t } = useI18nContext();
	const [errors, setErrors] = useState<ValidationError[]>([]);
	const [minStartDate] = useState(getMinStartDate());
	const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
	const validFromRef = useRef<HTMLInputElement>(null!);
	const validToRef = useRef<HTMLInputElement>(null!);

	// Validate form data whenever it changes
	useEffect(() => {
		const validation = validateParkingAccessForm(formData, t);
		setErrors(validation.errors);
	}, [formData, t]);

	const handleSubmit = () => {
		const validation = validateParkingAccessForm(formData, t);
		if (validation.isValid) {
			onSubmit();
		} else {
			setErrors(validation.errors);
		}
	};

	const getFieldError = (field: string): string | undefined => {
		if (!touched[field]) {return;}
		return errors.find((error) => error.field === field)?.message;
	};

	// Focus and open calendar on any click
	const handleDateInputClick = (ref: React.RefObject<HTMLInputElement>) => () => {
		ref.current?.showPicker?.();
		ref.current?.focus();
	};

	return (
		<div className="bg-gray-50 p-6 rounded-lg">
			<h2 className="text-lg font-medium text-gray-900 mb-4">
				{editingId ? t('edit') + ' ' + t('parking_access') : t('create') + ' ' + t('parking_access')}
			</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<div>
					<input
						type="text"
						placeholder={t('guest_name')}
						value={formData.guest_name}
						onChange={(e) => onChange({ ...formData, guest_name: e.target.value })}
						className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
					/>
				</div>
				<div>
					<select
						value={formData.parking_lot_id}
						onChange={(e) => onChange({ ...formData, parking_lot_id: parseInt(e.target.value) })}
						onBlur={() => setTouched((prev) => ({ ...prev, parking_lot_id: true }))}
						className={`px-3 py-2 border rounded-md w-full h-[42px] focus:outline-none focus:ring-2 ${
							getFieldError('parking_lot_id')
								? 'border-red-300 focus:ring-red-500'
								: 'border-gray-300 focus:ring-blue-500'
						}`}
					>
						<option value={0}>{t('please_select_apartment')}</option>
						{parkingLots.map((lot) => (
							<option key={lot.id} value={lot.id}>
								{`Ap ${lot.apartment}`}
							</option>
						))}
					</select>
					{getFieldError('parking_lot_id') && (
						<p className="text-xs text-red-500 mt-1">
							{getFieldError('parking_lot_id')}
						</p>
					)}
				</div>
				<div>
					<input
						ref={validFromRef}
						type="date"
						value={formData.valid_from}
						min={minStartDate}
						onChange={(e) => onChange({ ...formData, valid_from: e.target.value })}
						onBlur={() => setTouched((prev) => ({ ...prev, valid_from: true }))}
						onClick={handleDateInputClick(validFromRef)}
						className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 w-full ${
							getFieldError('valid_from')
								? 'border-red-300 focus:ring-red-500'
								: 'border-gray-300 focus:ring-blue-500'
						}`}
					/>
					<p className="text-xs text-gray-500 mt-1">{t('access_starts')}</p>
					{getFieldError('valid_from') && (
						<p className="text-xs text-red-500 mt-1">{getFieldError('valid_from')}</p>
					)}
				</div>
				<div>
					<input
						ref={validToRef}
						type="date"
						value={formData.valid_to}
						min={getMinEndDate(formData.valid_from)}
						onChange={(e) => onChange({ ...formData, valid_to: e.target.value })}
						onBlur={() => setTouched((prev) => ({ ...prev, valid_to: true }))}
						onClick={handleDateInputClick(validToRef)}
						className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 w-full ${
							getFieldError('valid_to')
								? 'border-red-300 focus:ring-red-500'
								: 'border-gray-300 focus:ring-blue-500'
						}`}
					/>
					<p className="text-xs text-gray-500 mt-1">{t('access_ends')}</p>
					{getFieldError('valid_to') && (
						<p className="text-xs text-red-500 mt-1">{getFieldError('valid_to')}</p>
					)}
				</div>
			</div>
			<div className="mt-4 flex space-x-3">
				<button
					onClick={handleSubmit}
					disabled={errors.length > 0}
					className={`px-4 py-2 rounded-md ${
						errors.length > 0
							? 'bg-gray-300 text-gray-500 cursor-not-allowed'
							: 'bg-blue-600 text-white hover:bg-blue-700'
					}`}
				>
					{editingId ? t('update') : t('create')}
				</button>
				{editingId && onCancel && (
					<button
						onClick={onCancel}
						className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
					>
						{t('cancel')}
					</button>
				)}
			</div>
		</div>
	);
};

export default ParkingAccessForm;
