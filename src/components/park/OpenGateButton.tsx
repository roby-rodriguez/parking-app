import React from 'react';
import { useI18nContext } from '@/context/I18nProvider';

type OpenGateButtonProps = {
	onOpen: () => void;
	disabled: boolean;
	loading: boolean;
	lastAction: string | null;
};

const OpenGateButton: React.FC<OpenGateButtonProps> = ({
	onOpen,
	disabled,
	loading,
	lastAction,
}) => {
	const { t } = useI18nContext();
	return (
		<>
			<button
				onClick={onOpen}
				disabled={disabled}
				className={`w-full py-4 px-6 rounded-lg font-semibold text-white ${
					loading
						? 'bg-gray-400 cursor-not-allowed'
						: 'bg-green-600 hover:bg-green-700 active:bg-green-800'
				}`}
				aria-label={loading ? t('opening_gate_please_wait') : t('open_parking_gate')}
				aria-busy={loading}
			>
				{loading ? (
					<div className="flex items-center justify-center">
						<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" aria-hidden="true"></div>
						{t('opening_gate')}
					</div>
				) : (
					t('open_gate')
				)}
			</button>
			{lastAction && (
				<div
					className={`mt-4 p-3 rounded-lg text-sm ${
						lastAction.includes('Error')
							? 'bg-red-50 text-red-700 border border-red-200'
							: 'bg-green-50 text-green-700 border border-green-200'
					}`}
					role="alert"
					aria-live="polite"
				>
					{lastAction}
				</div>
			)}
		</>
	);
};

export default OpenGateButton;
