import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { AxiosError } from 'axios';

const ActivatePage: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);


    const handleActivate = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert("Паролі не збігаються!");
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/auth/activate', { token, password });
            if (res.status === 200) {
                alert('Акаунт успішно активовано!');
                navigate('/login');
            }
        } catch (err) {

            const axiosError = err as AxiosError<{ message: string }>;
            alert(axiosError.response?.data?.message || 'Помилка активації');
        } finally {
            setLoading(true);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#8bc34a] p-4">
            <div className="bg-white rounded-[50px] shadow-2xl w-full max-w-[450px] p-12 py-16">

                <form onSubmit={(e) => void handleActivate(e)} className="space-y-8">
                    <div>
                        <label className="block text-gray-700 font-bold mb-2 ml-2">Password</label>
                        <input
                            required
                            type="password"
                            placeholder="Enter password"
                            className="w-full bg-[#f1f3f5] border-none p-4 rounded-full outline-none focus:ring-2 focus:ring-green-400 transition text-gray-600"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-bold mb-2 ml-2">Confirm Password</label>
                        <input
                            required
                            type="password"
                            placeholder="Confirm Password"
                            className="w-full bg-[#f1f3f5] border-none p-4 rounded-full outline-none focus:ring-2 focus:ring-green-400 transition text-gray-600"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#689f38] text-white py-4 rounded-full font-black text-xl uppercase tracking-wider hover:bg-[#558b2f] shadow-lg transition transform active:scale-95 disabled:opacity-50 mt-4"
                    >
                        {loading ? 'Processing...' : 'ACTIVATE'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ActivatePage;