// Database entity types
export interface ParkingAccess {
	id: string;
	uuid: string;
	guest_name: string | null;
	valid_from: string;
	valid_to: string;
	status: 'active' | 'revoked' | 'expired' | 'pending';
	parking_lot_id: number;
	parking_lots: {
		name: string;
		apartment: string;
		address: string;
		gates: {
			name: string;
			description: string | null;
		};
	};
	computed_status?: 'active' | 'revoked' | 'expired' | 'pending';
}

export interface ParkingAccessHistory {
	id: string;
	original_id: string;
	uuid: string;
	guest_name: string | null;
	valid_from: string;
	valid_to: string;
	status: string;
	parking_lot_id: number;
	created_at: string;
	deleted_at: string;
	deleted_by: string | null;
	reason: string;
	parking_lots: {
		name: string;
		apartment: string;
		address: string;
		gates: {
			name: string;
			description: string | null;
		};
	};
}

export interface AuditLog {
	id: string;
	action: string;
	ip_address: string;
	created_at: string;
	gates: {
		name: string;
		description: string | null;
	};
	parking_access: {
		guest_name: string;
		parking_lots?: {
			name: string;
			apartment: string;
			address: string;
		};
	};
}

export interface ParkingLot {
	id: number;
	name: string;
	apartment: string;
	gate_id: number;
	gates: { name: string };
}

// Component-specific types
export interface ParkingInfo {
	id: string;
	uuid: string;
	guest_name: string | null;
	valid_from: string;
	valid_to: string;
	parking_lots: {
		name: string;
		apartment: string;
		address: string;
		gates: {
			name: string;
			description: string | null;
		};
	};
}

// Form types
export interface LoginData {
	email: string;
	password: string;
}

export interface ParkingAccessFormData {
	guest_name: string;
	parking_lot_id: number;
	valid_from: string;
	valid_to: string;
}
