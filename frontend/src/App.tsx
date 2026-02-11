import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import OrdersPage from './pages/OrdersPage';
import AdminPage from './pages/AdminPage';
import ActivatePage from './pages/ActivatePage';



const App: React.FC = () => {
    return (
        <Router>
            <Routes>

                <Route path="/login" element={<LoginPage />} />
                <Route path="/activate/:token" element={<ActivatePage />} />


                <Route path="/orders" element={<OrdersPage />} />
                <Route
                    path="/admin"
                    element={

                            <AdminPage />

                    }
                />


                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="*" element={<div className="p-10 text-red-500 font-bold">404 - Маршрут не знайдено. Перевір URL!</div>} />
            </Routes>
        </Router>
    );
};

export default App;