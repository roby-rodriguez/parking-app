import {useParams} from 'react-router-dom';
import {useEffect, useState} from 'react';
import {supabase} from '../lib/supabaseClient';

interface ParkingAccess {
	id: string;
	uuid: string;
	gate_number: number;
	guest_name: string | null;
	valid_from: string;
	valid_to: string;
	status: 'active' | 'revoked' | 'expired';
}

export default function Park() {
	const {uuid} = useParams<{ uuid: string }>();
	const [parkingAccess, setParkingAccess] = useState<ParkingAccess | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [opening, setOpening] = useState(false);
	const [lastAction, setLastAction] = useState<string | null>(null);

	useEffect(() => {
		if (!uuid) {
			setError('Invalid parking access URL');
			setLoading(false);
			return;
		}

		// Fetch parking access data from Supabase
		const fetchParkingAccess = async () => {
			try {
				const {data, error} = await supabase
					.from('parking_access')
					.select('*')
					.eq('uuid', uuid)
					.eq('status', 'active')
					.single();

				if (error) {
					setError('Parking access not found or expired');
					return;
				}

				// Check if access is within valid time range
				const now = new Date();
				const validFrom = new Date(data.valid_from);
				const validTo = new Date(data.valid_to);

				if (now < validFrom) {
					setError('Parking access is not yet valid');
					return;
				}

				if (now > validTo) {
					setError('Parking access has expired');
					return;
				}

				setParkingAccess(data);
			} catch (err) {
				setError('Failed to load parking access');
			} finally {
				setLoading(false);
			}
		};

		fetchParkingAccess();
	}, [uuid]);

	const openGate = async () => {
		if (!parkingAccess || opening) return;

		setOpening(true);
		setLastAction(null);

		try {
			const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/parking-sms`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
				},
				body: JSON.stringify({
					uuid: parkingAccess.uuid,
					gateNumber: parkingAccess.gate_number,
				}),
			});

			const result = await response.json();

			if (response.ok) {
				setLastAction(`Gate ${parkingAccess.gate_number} opening initiated successfully!`);
			} else {
				setLastAction(`Error: ${result.error}`);
			}
		} catch (err) {
			setLastAction('Failed to open gate. Please try again.');
		} finally {
			setOpening(false);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
					<p className="mt-4 text-gray-600">Loading parking access...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="text-center max-w-md mx-auto p-6">
					<div className="text-red-500 text-6xl mb-4">⚠️</div>
					<h1 className="text-2xl font-bold text-gray-900 mb-4">Access Error</h1>
					<p className="text-gray-600 mb-6">{error}</p>
					<p className="text-sm text-gray-500">
						Please contact the front desk for assistance.
					</p>
				</div>
			</div>
		);
	}

	if (!parkingAccess) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="text-center">
					<p className="text-gray-600">Parking access not found.</p>
				</div>
			</div>
		);
	}

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	};

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
			<div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
				<div className="text-center mb-8">
					<div className="text-6xl mb-4">🚗</div>
					<h1 className="text-2xl font-bold text-gray-900 mb-2">
						Parking Access
					</h1>
					{parkingAccess.guest_name && (
						<p className="text-gray-600">Welcome, {parkingAccess.guest_name}</p>
					)}
				</div>

				<div className="space-y-4 mb-8">
					<div className="bg-blue-50 p-4 rounded-lg">
						<div className="flex justify-between items-center">
							<span className="text-gray-600">Gate:</span>
							<span className="font-semibold text-blue-900">
								Gate {parkingAccess.gate_number}
							</span>
						</div>
					</div>

					<div className="bg-green-50 p-4 rounded-lg">
						<div className="text-center">
							<p className="text-gray-600 text-sm mb-1">Valid Period</p>
							<p className="font-semibold text-green-900">
								{formatDate(parkingAccess.valid_from)} - {formatDate(parkingAccess.valid_to)}
							</p>
						</div>
					</div>
				</div>

				<button
					onClick={openGate}
					disabled={opening}
					className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-colors ${
						opening
							? 'bg-gray-400 cursor-not-allowed'
							: 'bg-green-600 hover:bg-green-700 active:bg-green-800'
					}`}
				>
					{opening ? (
						<div className="flex items-center justify-center">
							<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
							Opening Gate...
						</div>
					) : (
						'Open Gate'
					)}
				</button>

				{lastAction && (
					<div className={`mt-4 p-3 rounded-lg text-sm ${
						lastAction.includes('Error')
							? 'bg-red-50 text-red-700'
							: 'bg-green-50 text-green-700'
					}`}>
						{lastAction}
					</div>
				)}

				<div className="mt-6 text-center">
					<p className="text-xs text-gray-500">
						This access is valid for your entire stay.
					</p>
				</div>
			</div>
		</div>
	);
}
