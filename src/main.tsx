import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/index.scss';
import App from '@/App';

// Disable Strict Mode in production to prevent double-invocation of effects
const isStrictMode = import.meta.env.VITE_MODE === 'development';

createRoot(document.getElementById('root')!).render(
	isStrictMode ? (
		<StrictMode>
			<App />
		</StrictMode>
	) : (
		<App />
	),
);
