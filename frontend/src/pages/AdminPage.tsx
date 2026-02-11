import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { LogOut, Settings, X, ChevronLeft, ChevronRight } from 'lucide-react';

const AdminPage: React.FC = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [newUser, setNewUser] = useState({ email: '', name: '', surname: '' });


    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchData = useCallback(async () => {
        try {
            const [u, s] = await Promise.all([
                api.get(`/admin/users?page=${page}`),
                api.get('/admin/stats')
            ]);

            setUsers(u.data.users || []);
            setTotalPages(u.data.totalPages || 1);
            setStats(s.data);
        } catch (e: any) {
            console.error("Помилка завантаження адмінки:", e.response?.data);
        }
    }, [page]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/admin/users', newUser);
            setShowCreate(false);
            setNewUser({ email: '', name: '', surname: '' });
            setPage(1);
            await fetchData();
        } catch (err: any) {
            console.error("Create error:", err.response?.data);
            alert("Помилка при створенні менеджера");
        }
    };


    const handleTokenAction = async (userId: string, actionType: 'activate' | 'recovery') => {
        try {

            const res = await api.post(`/admin/users/${userId}/re-token`);
            if (res.data && res.data.token) {
                const link = `${window.location.origin}/activate/${res.data.token}`;
                await navigator.clipboard.writeText(link);
                alert(`${actionType === 'activate' ? 'Активація' : 'Відновлення'} скопійовано!`);
            }
        } catch (e: any) {
            alert("Помилка генерації посилання");
        }
    };

    const handleBan = async (userId: string) => {
        if (window.confirm('Заблокувати цього менеджера?')) {
            try {
                await api.patch(`/admin/users/${userId}/ban`);
                await fetchData();
            } catch (e: any) { alert("Помилка при блокуванні"); }
        }
    };

    const handleUnban = async (userId: string) => {
        try {
            await api.patch(`/admin/users/${userId}/unban`);
            await fetchData();
        } catch (e: any) { alert("Помилка при розблокуванні"); }
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
                        <p className="font-bold mb-0.5">Orders statistic</p>
                        <div className="flex justify-center gap-1.5 flex-wrap">
                            <span>total: {stats.total}</span>
                            <span>In work: {stats.inWork}</span>
                            <span>null: {stats.nullStatus || stats.allNull || 0}</span>
                            <span>Agree: {stats.agree}</span>
                            <span>Disagree: {stats.disagree || 0}</span>
                            <span>Dubbing: {stats.dubbing || 0}</span>
                            <span>New: {stats.newStatus || stats.new || 0}</span>
                        </div>
                    </div>
                )}

                <button onClick={() => setShowCreate(true)} className="bg-[#4caf50] text-white px-3 py-1 rounded text-[10px] font-bold uppercase mb-6 hover:bg-green-600 active:scale-95 transition">
                    CREATE
                </button>


                <div className="space-y-4">
                    {users.map((user: any) => (
                        <div key={user._id} className="border border-green-500 rounded-lg p-4 flex justify-between items-start relative bg-white shadow-sm">

                            <div className="text-[11px] leading-snug space-y-0.5 text-gray-800">
                                <p>id: {user._id.toString().slice(-3)}</p>
                                <p>email: {user.email}</p>
                                <p>name: {user.name}</p>
                                <p>surname: {user.surname}</p>
                                <p>is_active: {user.is_active ? 'true' : 'false'}</p>
                                <p>last_login: {user.last_login ? new Date(user.last_login).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'null'}</p>
                            </div>


                            <div className="absolute left-1/3 top-4 text-[11px] font-medium text-gray-800">
                                <span>total: {user.stats?.total || 0}</span>
                            </div>


                            <div className="flex gap-1.5">

                                {!user.is_active ? (
                                    <button onClick={() => handleTokenAction(user._id, 'activate')} className="bg-[#4caf50] text-white px-3 py-1 rounded text-[9px] font-bold uppercase hover:bg-green-600 transition">
                                        ACTIVATE
                                    </button>
                                ) : (
                                    <button onClick={() => handleTokenAction(user._id, 'recovery')} className="bg-[#4caf50] text-white px-3 py-1 rounded text-[9px] font-bold uppercase hover:bg-green-600 transition">
                                        RECOVERY PASSWORD
                                    </button>
                                )}


                                {user.is_banned ? (
                                    <button onClick={() => handleUnban(user._id)} className="bg-[#4caf50] text-white px-3 py-1 rounded text-[9px] font-bold uppercase hover:bg-green-600 transition">
                                        UNBAN
                                    </button>
                                ) : (
                                    <button onClick={() => handleBan(user._id)} className="bg-[#4caf50] text-white px-3 py-1 rounded text-[9px] font-bold uppercase hover:bg-green-600 transition">
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
                        <form onSubmit={handleCreate} className="space-y-5">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1 block">Email Address</label>
                                <input required type="email" placeholder="manager@gmail.com" className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl outline-none focus:border-green-400 transition"
                                       value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1 block">First Name</label>
                                    <input required placeholder="John" className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl outline-none focus:border-green-400 transition"
                                           value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} /></div>
                                <div><label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1 block">Last Name</label>
                                    <input required placeholder="Doe" className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl outline-none focus:border-green-400 transition"
                                           value={newUser.surname} onChange={e => setNewUser({...newUser, surname: e.target.value})} /></div>
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