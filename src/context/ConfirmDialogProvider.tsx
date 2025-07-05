import React, { createContext, useContext, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface ConfirmDialogOptions {
	message: string;
	confirmLabel?: string;
	cancelLabel?: string;
	loading?: boolean;
}

interface ConfirmDialogContextType {
	confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextType | undefined>(undefined);

export const ConfirmDialogProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [open, setOpen] = useState(false);
	const [options, setOptions] = useState<ConfirmDialogOptions>({ message: '' });
	const [loading, setLoading] = useState(false);
	const resolver = useRef<(result: boolean) => void>();

	const confirm = (opts: ConfirmDialogOptions) => {
		setOptions(opts);
		setOpen(true);
		setLoading(false);
		return new Promise<boolean>((resolve) => {
			resolver.current = resolve;
		});
	};

	const handleClose = (result: boolean) => {
		setOpen(false);
		setLoading(false);
		if (resolver.current) {
			resolver.current(result);
		}
	};

	// The dialog is rendered via a portal to body
	return (
		<ConfirmDialogContext.Provider value={{ confirm }}>
			{children}
			{open &&
				createPortal(
					<div
						className="fixed inset-0 z-50 flex items-center justify-center"
						style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
					>
						<div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 max-h-[90vh] overflow-auto mx-2">
							<div className="mb-6 text-gray-900 text-base text-center">
								{options.message}
							</div>
							<div className="flex justify-center space-x-4">
								<button
									onClick={() => handleClose(false)}
									disabled={loading}
									className="px-4 py-2 rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
								>
									{options.cancelLabel || 'Cancel'}
								</button>
								<button
									onClick={() => handleClose(true)}
									disabled={loading}
									className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
								>
									{loading ? 'Please wait...' : options.confirmLabel || 'Confirm'}
								</button>
							</div>
						</div>
					</div>,
					document.body,
				)}
		</ConfirmDialogContext.Provider>
	);
};

export const useConfirmContext = () => {
	const ctx = useContext(ConfirmDialogContext);
	if (!ctx) {
		throw new Error('useConfirm must be used within a ConfirmDialogProvider');
	}
	return ctx.confirm;
};
