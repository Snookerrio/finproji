import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { LogOut, Settings, X, ChevronLeft, ChevronRight } from 'lucide-react';
import type {IStats, IUser} from "../interfaces/order.interface.ts";


const AdminPage: React.FC = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<IUser[]>([]);
    const [stats, setStats] = useState<IStats | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [newUser, setNewUser] = useState({ email: '', name: '', surname: '' });

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    
    const fetchData = useCallback(async (): Promise<void> => {
        try {
            const [u, s] = await Promise.all([
                api.get(`/admin/users?page=${page}`),
                api.get('/admin/stats')
            ]);

            setUsers(u.data.users || []);
            setTotalPages(u.data.totalPages || 1);
            setStats(s.data);
        } catch  {
            console.error("Помилка завантаження адмінки");
        }
    }, [page]);


    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void fetchData();
    }, [fetchData]);

    const handleCreate = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        try {
            await api.post('/admin/users', newUser);
            setShowCreate(false);
            setNewUser({ email: '', name: '', surname: '' });
            setPage(1);

            await fetchData();
        } catch  {
            alert("Помилка при створенні менеджера");
        }
    };

    const handleTokenAction = async (userId: string, actionType: 'activate' | 'recovery'): Promise<void> => {
        try {
            const res = await api.post(`/admin/users/${userId}/re-token`);
            if (res.data && res.data.token) {
                const link = `${window.location.origin}/activate/${res.data.token}`;
                await navigator.clipboard.writeText(link);
                alert(`${actionType === 'activate' ? 'Активація' : 'Відновлення'} скопійовано!`);
            }
        } catch  {
            alert("Помилка генерації посилання");
        }
    };

    const handleBan = async (userId: string): Promise<void> => {
        if (window.confirm('Заблокувати цього менеджера?')) {
            try {
                await api.patch(`/admin/users/${userId}/ban`);
                await fetchData();
            } catch  {
                alert("Помилка при блокуванні");
            }
        }
    };

    const handleUnban = async (userId: string): Promise<void> => {
        try {
            await api.patch(`/admin/users/${userId}/unban`);
            await fetchData();
        } catch  {
            alert("Помилка при розблокуванні");
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans pb-20">
            <header className="bg-[#8bc34a] px-4 py-2 flex justify-between items-center text-white">
                <h1 className="text-xl font-bold tracking-tight">Logo</h1>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">admin</span>
                    <button onClick={() => navigate('/orders')} className="hover:opacity-80 transition"><Settings size={18}/></button>
                    <button onClick={() => { localStorage.clear(); navigate('/login'); }} className="hover:opacity-80 transition"><LogOut size={18}/></button>
                </div>
            </header>

            <main className="p-4 max-w-5xl mx-auto">
                {stats && (
                    <div className="text-center mb-6 text-[12px] text-gray-800 leading-tight">
                        <p className="font-bold mb-0.5 uppercase text-gray-400">Orders statistic</p>
                        <div className="flex justify-center gap-3 flex-wrap bg-gray-50 py-2 rounded-xl">
                            <span>total: <b className="text-blue-600">{stats.total}</b></span>
                            <span>In work: <b className="text-orange-500">{stats.inWork}</b></span>
                            <span>Agree: <b className="text-green-600">{stats.agree}</b></span>
                            <span>Disagree: <b className="text-red-500">{stats.disagree}</b></span>
                            <span>New: <b className="text-gray-900">{stats.new}</b></span>
                        </div>
                    </div>
                )}

                <button onClick={() => setShowCreate(true)} className="bg-[#4caf50] text-white px-3 py-1 rounded text-[10px] font-bold uppercase mb-6 hover:bg-green-600 active:scale-95 transition shadow-sm">
                    CREATE MANAGER
                </button>

                <div className="space-y-4">
                    {users.map((user) => (
                        <div key={user._id} className="border border-green-500 rounded-lg p-4 flex justify-between items-start relative bg-white shadow-sm hover:shadow-md transition">
                            <div className="text-[11px] leading-snug space-y-0.5 text-gray-800">
                                <p className="text-gray-400">ID: {user._id.toString().slice(-5)}</p>
                                <p><b>Email:</b> {user.email}</p>
                                <p><b>Name:</b> {user.name} {user.surname}</p>
                                <p><b>Status:</b> <span className={user.is_active ? "text-green-600" : "text-orange-500"}>{user.is_active ? 'Active' : 'Pending'}</span></p>
                                <p><b>Last login:</b> {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}</p>
                            </div>

                            <div className="absolute left-1/2 -translate-x-1/2 top-4 text-[11px] font-bold text-gray-800 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                                <span>Orders: {user.stats?.total || 0}</span>
                            </div>

                            <div className="flex gap-1.5">
                                {!user.is_active ? (
                                    <button onClick={() => void handleTokenAction(user._id, 'activate')} className="bg-[#4caf50] text-white px-3 py-1 rounded text-[9px] font-bold uppercase hover:bg-green-600 transition">
                                        ACTIVATE
                                    </button>
                                ) : (
                                    <button onClick={() => void handleTokenAction(user._id, 'recovery')} className="bg-blue-500 text-white px-3 py-1 rounded text-[9px] font-bold uppercase hover:bg-blue-600 transition">
                                        RECOVERY
                                    </button>
                                )}

                                {user.is_banned ? (
                                    <button onClick={() => void handleUnban(user._id)} className="bg-gray-800 text-white px-3 py-1 rounded text-[9px] font-bold uppercase hover:bg-black transition">
                                        UNBAN
                                    </button>
                                ) : (
                                    <button onClick={() => void handleBan(user._id)} className="bg-red-500 text-white px-3 py-1 rounded text-[9px] font-bold uppercase hover:bg-red-600 transition">
                                        BAN
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {totalPages > 1 && (
                    <div className="mt-8 flex justify-center items-center gap-4 text-[11px] font-bold text-gray-600 uppercase">
                        <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="disabled:opacity-20 hover:text-green-600 transition">
                            <ChevronLeft size={16} />
                        </button>
                        <span>Page {page} of {totalPages}</span>
                        <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="disabled:opacity-20 hover:text-green-600 transition">
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </main>

            {showCreate && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md p-10 relative border-t-[12px] border-[#8bc34a]">
                        <button onClick={() => setShowCreate(false)} className="absolute top-6 right-6 text-gray-300 hover:text-gray-500 transition">
                            <X size={28}/>
                        </button>
                        <h2 className="text-3xl font-black text-gray-800 mb-8 uppercase tracking-tighter">New Manager</h2>
                        <form onSubmit={(e) => void handleCreate(e)} className="space-y-5">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1 block">Email Address</label>
                                <input required type="email" placeholder="manager@gmail.com" className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl outline-none focus:border-green-400 transition"
                                       value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1 block">First Name</label>
                                    <input required placeholder="John" className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl outline-none focus:border-green-400 transition"
                                           value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1 block">Last Name</label>
                                    <input required placeholder="Doe" className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl outline-none focus:border-green-400 transition"
                                           value={newUser.surname} onChange={e => setNewUser({...newUser, surname: e.target.value})} />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-6">
                                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-2xl font-bold uppercase text-[10px]">Cancel</button>
                                <button type="submit" className="flex-[2] bg-[#4caf50] text-white py-4 rounded-2xl font-bold uppercase text-[10px] shadow-lg">Create & Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPage;