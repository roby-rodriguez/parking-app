import React from 'react';
import { ConfirmDialogProvider } from '@/context/ConfirmDialogProvider';
import { ToastProvider } from '@/context/ToastProvider';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
	<ToastProvider>
		<ConfirmDialogProvider>
			{children}
		</ConfirmDialogProvider>
	</ToastProvider>
);
