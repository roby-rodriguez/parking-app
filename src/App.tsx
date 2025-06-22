import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Park from './routes/Park';
import Admin from './routes/Admin';
import './App.css';

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Navigate to="/admin" replace/>}/>
				<Route path="/park/:uuid" element={<Park/>}/>
				<Route path="/admin" element={<Admin/>}/>
			</Routes>
		</BrowserRouter>
	);
}

export default App;
