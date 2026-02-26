import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';

import { AuthService } from '../services/auth.service';
import {authValidator} from "../../../backend/src/back/validators/auth.validator.ts";



const ActivatePage: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const [validationError, setValidationError] = useState<string | null>(null);

    const handleActivate = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setValidationError(null);


        const passwordError = authValidator.password(password);
        if (passwordError) {
            setValidationError(passwordError);
            return;
        }


        if (password !== confirmPassword) {
            setValidationError("The passwords don't match!");
            return;
        }

        if (!token) {
            setValidationError("Token missing!");
            return;
        }

        setLoading(true);
        try {
            await AuthService.activate(token, password);
            alert('Account successfully activated!');
            navigate('/login');
        } catch (err) {
            const axiosError = err as AxiosError<{ message: string }>;
            setValidationError(axiosError.response?.data?.message || 'Activation error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#8bc34a] p-4">
            <div className="bg-white rounded-[50px] shadow-2xl w-full max-w-[450px] p-12 py-16">
                <form onSubmit={(e) => void handleActivate(e)} className="space-y-6">
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


                    {validationError && (
                        <div className="bg-red-50 text-red-500 text-xs font-bold p-3 rounded-2xl text-center border border-red-100">
                            {validationError}
                        </div>
                    )}

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