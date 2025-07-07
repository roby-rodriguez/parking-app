import { ParkingAccessFormData } from '@/types';

export interface ValidationError {
	field: string;
	message: string;
}

export interface ParkingAccessValidation {
	isValid: boolean;
	errors: ValidationError[];
}

/**
 * Validate parking access form data
 */
export function validateParkingAccessForm(
	formData: ParkingAccessFormData,
	t: (key: string) => string,
): ParkingAccessValidation {
	const errors: ValidationError[] = [];

	// Check if required fields are filled
	if (!formData.parking_lot_id) {
		errors.push({ field: 'parking_lot_id', message: t('please_select_apartment') });
	}

	if (!formData.valid_from) {
		errors.push({ field: 'valid_from', message: t('start_date_required') });
	}

	if (!formData.valid_to) {
		errors.push({ field: 'valid_to', message: t('end_date_required') });
	}

	// If we have both dates, validate them
	if (formData.valid_from && formData.valid_to) {
		const fromDate = new Date(formData.valid_from + 'T12:00:00');
		const toDate = new Date(formData.valid_to + 'T12:00:00');
		const today = new Date();
		today.setHours(0, 0, 0, 0); // Start of today

		// Check if start date is today or in the future
		if (fromDate < today) {
			errors.push({
				field: 'valid_from',
				message: t('start_date_must_be_today_or_future'),
			});
		}

		// Check if end date is at least 1 day after start date
		const minEndDate = new Date(fromDate);
		minEndDate.setDate(minEndDate.getDate() + 1);

		if (toDate < minEndDate) {
			errors.push({
				field: 'valid_to',
				message: t('end_date_min_one_night'),
			});
		}
	}

	return {
		isValid: errors.length === 0,
		errors,
	};
}

/**
 * Get minimum valid end date based on start date
 */
export function getMinEndDate(startDate: string): string {
	if (!startDate) {return '';}

	const fromDate = new Date(startDate + 'T12:00:00');
	const minEndDate = new Date(fromDate);
	minEndDate.setDate(minEndDate.getDate() + 1);

	return minEndDate.toISOString().split('T')[0];
}

/**
 * Get minimum valid start date (today)
 */
export function getMinStartDate(): string {
	const today = new Date();
	return today.toISOString().split('T')[0];
}
