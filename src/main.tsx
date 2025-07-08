import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/index.scss';
import App from '@/App';

// Disable Strict Mode in production to prevent double-invocation of effects
// Option 1: Use Vite's built-in DEV flag (recommended)
const isStrictMode = import.meta.env.VITE_MODE === 'development';

// Option 2: Use custom environment variable (if you want more control)
// const shouldUseStrictMode = import.meta.env.VITE_STRICT_MODE === 'true';

const app = () => {
	console.log('prod mode');
	return <App />;
};

const dev = () => {
	console.log('dev mode');
	return (<StrictMode>
		<App />
	</StrictMode>);
};

createRoot(document.getElementById('root')!).render(
	isStrictMode ? (
		dev()
	) : (
		app()
	),
);
