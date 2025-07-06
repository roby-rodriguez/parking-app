import React from 'react';
import { ConfirmDialogProvider } from '@/context/ConfirmDialogProvider';
import { I18nProvider } from '@/context/I18nProvider';
import { ToastProvider } from '@/context/ToastProvider';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
	<I18nProvider>
		<ToastProvider>
			<ConfirmDialogProvider>
				{children}
			</ConfirmDialogProvider>
		</ToastProvider>
	</I18nProvider>
);
