import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import OrdersPage from './pages/OrdersPage';
import AdminPage from './pages/AdminPage';
import ActivatePage from './pages/ActivatePage';

const AdminRoute = ({ children }: { children: React.ReactElement }) => {
    const isAdmin = localStorage.getItem('userRole') === 'admin';
    return isAdmin ? children : <Navigate to="/orders" replace />;
};

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                {/* 1. ПУБЛІЧНІ МАРШРУТИ */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/activate/:token" element={<ActivatePage />} />

                {/* 2. ЗАХИЩЕНІ МАРШРУТИ */}
                <Route path="/orders" element={<OrdersPage />} />
                <Route
                    path="/admin"
                    element={

                            <AdminPage />

                    }
                />

                {/* 3. ПЕРЕНАПРАВЛЕННЯ */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="*" element={<div className="p-10 text-red-500 font-bold">404 - Маршрут не знайдено. Перевір URL!</div>} />
            </Routes>
        </Router>
    );
};

export default App;