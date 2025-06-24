import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Admin from './routes/Admin';
import Park from './routes/Park';
import './App.scss';

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Navigate to="/admin" replace />} />
				<Route path="/park/:uuid" element={<Park />} />
				<Route path="/admin" element={<Admin />} />
				<Route path="*" element={<Navigate to="/admin" replace />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
