import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProviders } from '@/AppProviders';
import Admin from '@/pages/Admin';
import Park from '@/pages/Park';
import '@/App.scss';

function App() {
	return (
		<AppProviders>
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<Navigate to="/admin" replace />} />
					<Route path="/park/:uuid" element={<Park />} />
					<Route path="/admin" element={<Admin />} />
					<Route path="*" element={<Navigate to="/admin" replace />} />
				</Routes>
			</BrowserRouter>
		</AppProviders>
	);
}

export default App;
