import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface Toast {
	id: number;
	message: string;
	type?: 'error' | 'success' | 'info';
}

interface ToastContextType {
	show: (message: string, type?: Toast['type']) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [toasts, setToasts] = useState<Toast[]>([]);
	const idRef = useRef(0);

	const show = useCallback((message: string, type: Toast['type'] = 'error') => {
		const id = ++idRef.current;
		setToasts((prev) => [...prev, { id, message, type }]);
		setTimeout(() => {
			setToasts((prev) => prev.filter((t) => t.id !== id));
		}, 5000);
	}, []);

	return (
		<ToastContext.Provider value={{ show }}>
			{children}
			{createPortal(
				<div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center space-y-2 pointer-events-none">
					{toasts.map((toast) => (
						<div
							key={toast.id}
							className={`px-4 py-3 rounded-lg shadow-lg border text-sm font-medium min-w-[220px] max-w-xs text-center
								${toast.type === 'error' ? 'bg-red-100 border-red-300 text-red-700' : ''}
								${toast.type === 'success' ? 'bg-green-100 border-green-300 text-green-700' : ''}
								${toast.type === 'info' ? 'bg-blue-100 border-blue-300 text-blue-700' : ''}
						  `}
							style={{ pointerEvents: 'auto' }}
						>
							{toast.message}
						</div>
					))}
				</div>,
				document.body,
			)}
		</ToastContext.Provider>
	);
};

export const useToastContext = () => {
	const ctx = useContext(ToastContext);
	if (!ctx) {
		throw new Error('useToastContext must be used within a ToastProvider');
	}
	return ctx;
};
