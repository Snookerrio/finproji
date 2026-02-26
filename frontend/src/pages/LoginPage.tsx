import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { AuthService } from '../services/auth.service';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setError('');

        try {

            await AuthService.login({ email, password });

            navigate('/orders');
        } catch (err) {
            const axiosError = err as AxiosError<{ message: string }>;
            setError(axiosError.response?.data?.message || 'Помилка при вході');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#7cb342]">
            <div className="bg-white p-10 rounded-lg shadow-2xl w-full max-w-[400px]">
                {error && (
                    <div className="bg-red-50 text-red-500 p-2 rounded mb-4 text-[10px] text-center font-bold">
                        {error}
                    </div>
                )}

                <form onSubmit={(e) => void handleLogin(e)} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-gray-700 font-medium text-sm ml-1">Email</label>
                        <input
                            type="email"
                            placeholder="Email"
                            className="w-full p-3 bg-[#f1f1f1] border-none rounded-lg outline-none focus:ring-2 focus:ring-[#7cb342] transition text-sm text-gray-600"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-gray-700 font-medium text-sm ml-1">Password</label>
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full p-3 bg-[#f1f1f1] border-none rounded-lg outline-none focus:ring-2 focus:ring-[#7cb342] transition text-sm text-gray-600"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-[#43a047] text-white py-3 rounded-lg font-bold uppercase tracking-wider hover:bg-[#388e3c] transition shadow-md active:scale-95 mt-2"
                    >
                        LOGIN
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;