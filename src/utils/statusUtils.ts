import { ParkingAccess } from '@/types';

export type ParkingStatus = 'active' | 'revoked' | 'expired' | 'pending';

/**
 * Calculate the current status of a parking access based on dates and stored status
 */
export function calculateParkingStatus(
	validFrom: string,
	validTo: string,
	storedStatus: ParkingStatus,
): ParkingStatus {
	// If manually revoked, keep that status
	if (storedStatus === 'revoked') {
		return 'revoked';
	}

	const now = new Date();
	const fromDate = new Date(validFrom);
	const toDate = new Date(validTo);

	// Check if expired
	if (now > toDate) {
		return 'expired';
	}

	// Check if not yet valid
	if (now < fromDate) {
		return 'pending';
	}

	// Must be active
	return 'active';
}

/**
 * Get the effective status for a parking access record
 * Uses computed_status if available, otherwise calculates it
 */
export function getEffectiveStatus(parkingAccess: ParkingAccess): ParkingStatus {
	if (parkingAccess.computed_status) {
		return parkingAccess.computed_status;
	}

	return calculateParkingStatus(
		parkingAccess.valid_from,
		parkingAccess.valid_to,
		parkingAccess.status,
	);
}

/**
 * Get status color classes for UI display
 */
export function getStatusColorClasses(status: ParkingStatus): string {
	switch (status) {
		case 'active':
			return 'bg-green-100 text-green-800';
		case 'revoked':
			return 'bg-red-100 text-red-800';
		case 'expired':
			return 'bg-orange-100 text-orange-800';
		case 'pending':
			return 'bg-blue-100 text-blue-800';
		default:
			return 'bg-gray-100 text-gray-800';
	}
}

/**
 * Get human-readable status label
 */
export function getStatusLabel(status: ParkingStatus): string {
	switch (status) {
		case 'active':
			return 'Active';
		case 'revoked':
			return 'Revoked';
		case 'expired':
			return 'Expired';
		case 'pending':
			return 'Pending';
		default:
			return 'Unknown';
	}
}
