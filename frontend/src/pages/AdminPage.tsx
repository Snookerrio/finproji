import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LogOut, Settings, X, ChevronLeft, ChevronRight } from 'lucide-react';

import { AdminService } from '../services/admin.service';
import { AuthService } from '../services/auth.service';

import type { IUser } from "../interfaces/user.interface.ts";
import type { IStats } from "../interfaces/stats.interface.ts";


import { managerValidator } from "../../../backend/src/back/validators/manager.validator.ts";
import { authValidator } from "../../../backend/src/back/validators/auth.validator.ts";

const AdminPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();


    const page = parseInt(searchParams.get('page') || '1');

    const [users, setUsers] = useState<IUser[]>([]);
    const [stats, setStats] = useState<IStats | null>(null);
    const [totalPages, setTotalPages] = useState(1);

    const [showCreate, setShowCreate] = useState(false);
    const [newUser, setNewUser] = useState({ email: '', name: '', surname: '' });
    const [validationError, setValidationError] = useState<string | null>(null);
    const [myId, setMyId] = useState<string | null>(null);


    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                setMyId(parsed._id || parsed.id);
            } catch (e) {
                console.error("Failed to parse user from storage");
            }
        }
    }, []);


    const fetchData = useCallback(async (): Promise<void> => {
        try {
            const [userData, statsData] = await Promise.all([
                AdminService.getUsers(page),
                AdminService.getAdminStats()
            ]);
            setUsers(userData.users || []);
            setTotalPages(userData.totalPages || 1);
            setStats(statsData);
        } catch (error) {
            console.error("Error loading admin panel:", error);
        }
    }, [page]);

    useEffect(() => {
        void fetchData();
    }, [fetchData]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setSearchParams({ page: newPage.toString() });
        }
    };

    const handleCreate = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setValidationError(null);


        const emailErr = authValidator.email(newUser.email);
        const nameErr = managerValidator.name(newUser.name);
        const surnameErr = managerValidator.name(newUser.surname);

        if (emailErr) { setValidationError(emailErr); return; }
        if (nameErr) { setValidationError(`Name: ${nameErr}`); return; }
        if (surnameErr) { setValidationError(`Surname: ${surnameErr}`); return; }

        try {
            await AdminService.createManager(newUser);
            setShowCreate(false);
            setNewUser({ email: '', name: '', surname: '' });
            setSearchParams({ page: '1' });
            await fetchData();
        } catch (err: any) {

            setValidationError(err.response?.data?.message || "Error creating manager");
        }
    };

    const handleTokenAction = async (userId: string, actionType: 'activate' | 'recovery'): Promise<void> => {
        try {
            const { token } = await AdminService.getReToken(userId);
            if (token) {
                const link = `${window.location.origin}/activate/${token}`;
                await navigator.clipboard.writeText(link);
                alert(`${actionType === 'activate' ? 'Activation' : 'Recovery'} link copied!`);
            }
        } catch {
            alert("Link generation error");
        }
    };

    const handleBan = async (userId: string): Promise<void> => {
        if (userId === myId) {
            alert("Security: You cannot ban your own account!");
            return;
        }
        if (window.confirm('Block this manager?')) {
            try {
                await AdminService.banUser(userId);
                await fetchData();
            } catch {
                alert("Blocking error");
            }
        }
    };

    const handleUnban = async (userId: string): Promise<void> => {
        try {
            await AdminService.unbanUser(userId);
            await fetchData();
        } catch {
            alert("Error while unlocking");
        }
    };

    const getPaginationItems = () => {
        const items: (number | string)[] = [];
        const siblingCount = 1;
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) items.push(i);
        } else {
            const leftSiblingIndex = Math.max(page - siblingCount, 1);
            const rightSiblingIndex = Math.min(page + siblingCount, totalPages);
            if (leftSiblingIndex > 2) { items.push(1); items.push('...'); }
            for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) items.push(i);
            if (rightSiblingIndex < totalPages - 1) { items.push('...'); items.push(totalPages); }
        }
        return items;
    };

    return (
        <div className="min-h-screen bg-white font-sans pb-20">
            <header className="bg-[#8bc34a] px-4 py-2 flex justify-between items-center text-white shadow-md">
                <h1 className="text-xl font-bold tracking-tight uppercase">CRM Admin</h1>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">admin panel</span>
                    <button onClick={() => navigate('/orders')} className="hover:scale-110 transition p-1"><Settings size={18}/></button>
                    <button onClick={() => AuthService.logout()} className="hover:scale-110 transition p-1"><LogOut size={18}/></button>
                </div>
            </header>

            <main className="p-4 max-w-5xl mx-auto">

                {stats && (
                    <div className="text-center mb-6 text-[12px] text-gray-800 leading-tight">
                        <p className="font-bold mb-1 uppercase text-gray-400">Orders statistic</p>
                        <div className="flex justify-center gap-3 flex-wrap bg-gray-50 py-3 rounded-2xl border border-gray-100 shadow-sm">
                            <span>total: <b className="text-blue-600">{stats.total}</b></span>
                            <span>In work: <b className="text-orange-500">{stats.inWork}</b></span>
                            <span>Agree: <b className="text-green-600">{stats.agree}</b></span>
                            <span>Disagree: <b className="text-red-500">{stats.disagree}</b></span>
                            <span>New: <b className="text-gray-900">{stats.new}</b></span>
                        </div>
                    </div>
                )}

                <button
                    onClick={() => { setValidationError(null); setShowCreate(true); }}
                    className="bg-[#4caf50] text-white px-5 py-2 rounded-lg text-[11px] font-bold uppercase mb-8 hover:bg-green-600 active:scale-95 transition shadow-lg"
                >
                    + Create Manager
                </button>


                <div className="space-y-4">
                    {users.map((user: any) => (
                        <div key={user._id} className={`border rounded-2xl p-5 flex justify-between items-start bg-white shadow-sm hover:shadow-md transition ${user._id === myId ? 'border-blue-400 bg-blue-50/30' : 'border-green-500/30'}`}>
                            <div className="text-[12px] leading-relaxed space-y-1 text-gray-800 w-full pr-4">
                                <p className="text-gray-400 text-[10px] mb-1">
                                    ID: {user._id.toString().slice(-8)}
                                    {user._id === myId && <span className="ml-2 text-blue-600 font-black uppercase">[ YOU ]</span>}
                                </p>
                                <div className="flex gap-4">
                                    <p><b>Role:</b> <span className="uppercase font-black text-blue-600">{user.role}</span></p>
                                    <p><b>Status:</b> {user.is_banned ? <span className="text-red-600 font-bold italic">Banned</span> : <span className={user.is_active ? "text-green-600" : "text-orange-500"}>{user.is_active ? 'Active' : 'Pending'}</span>}</p>
                                </div>
                                <p><b>Email:</b> <span className="text-gray-600">{user.email}</span></p>
                                <p><b>Full Name:</b> {user.name} {user.surname}</p>


                                {user.stats && (
                                    <div className="flex gap-3 mt-4 pt-3 border-t border-gray-50 text-[9px] uppercase font-bold flex-wrap">
                                        <div className="flex flex-col min-w-[50px]">
                                            <span className="text-gray-400">Total</span>
                                            <span className="text-blue-600 text-sm">{user.stats.total || 0}</span>
                                        </div>
                                        <div className="flex flex-col min-w-[50px] border-l pl-3">
                                            <span className="text-gray-400">Agree</span>
                                            <span className="text-green-600 text-sm">{user.stats.agree || 0}</span>
                                        </div>
                                        <div className="flex flex-col min-w-[50px] border-l pl-3">
                                            <span className="text-gray-400">In work</span>
                                            <span className="text-orange-500 text-sm">{user.stats.inWork || 0}</span>
                                        </div>
                                        <div className="flex flex-col min-w-[50px] border-l pl-3">
                                            <span className="text-gray-400">Disagree</span>
                                            <span className="text-red-500 text-sm">{user.stats.disagree || 0}</span>
                                        </div>
                                        <div className="flex flex-col min-w-[50px] border-l pl-3">
                                            <span className="text-gray-400">New</span>
                                            <span className="text-gray-900 text-sm">{user.stats.new || 0}</span>
                                        </div>
                                    </div>
                                )}
                            </div>


                            <div className="flex flex-col gap-2 w-28 shrink-0">
                                {user._id !== myId ? (
                                    <>
                                        {!user.is_active ? (
                                            <button onClick={() => void handleTokenAction(user._id, 'activate')} className="bg-[#4caf50] text-white py-2 rounded-lg text-[10px] font-bold uppercase hover:bg-green-600 transition shadow-sm">ACTIVATE</button>
                                        ) : (
                                            <button onClick={() => void handleTokenAction(user._id, 'recovery')} className="bg-blue-500 text-white py-2 rounded-lg text-[10px] font-bold uppercase hover:bg-blue-600 transition shadow-sm">RECOVERY</button>
                                        )}
                                        <button
                                            onClick={() => user.is_banned ? handleUnban(user._id) : handleBan(user._id)}
                                            className={`py-2 rounded-lg text-[10px] font-bold uppercase transition shadow-sm text-white ${user.is_banned ? 'bg-gray-800 hover:bg-black' : 'bg-red-500 hover:bg-red-600'}`}
                                        >
                                            {user.is_banned ? 'UNBAN' : 'BAN'}
                                        </button>
                                    </>
                                ) : (
                                    <div className="text-[10px] text-center font-bold text-blue-400 py-2 border border-blue-100 rounded-lg uppercase">Admin</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>


                <div className="mt-12 flex justify-center items-center gap-3">
                    <button
                        disabled={page === 1}
                        onClick={() => handlePageChange(page - 1)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 text-gray-400 hover:bg-[#8bc34a] hover:text-white disabled:opacity-30 transition"
                    >
                        <ChevronLeft size={20}/>
                    </button>
                    {getPaginationItems().map((item, index) => (
                        <button
                            key={index}
                            disabled={item === '...'}
                            onClick={() => typeof item === 'number' && handlePageChange(item)}
                            className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition ${item === page ? 'bg-[#4caf50] text-white shadow-lg' : 'bg-gray-50 text-gray-400'}`}
                        >
                            {item}
                        </button>
                    ))}
                    <button
                        disabled={page === totalPages}
                        onClick={() => handlePageChange(page + 1)}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 text-gray-400 hover:bg-[#8bc34a] hover:text-white disabled:opacity-30 transition"
                    >
                        <ChevronRight size={20}/>
                    </button>
                </div>
            </main>


            {showCreate && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md p-10 relative border-t-[12px] border-[#8bc34a]">
                        <button onClick={() => setShowCreate(false)} className="absolute top-6 right-6 text-gray-300 hover:text-gray-500 transition"><X size={28}/></button>
                        <h2 className="text-3xl font-black text-gray-800 mb-2 uppercase tracking-tighter">New Manager</h2>

                        {validationError && (
                            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-bold rounded-r-lg animate-shake">
                                ⚠️ {validationError}
                            </div>
                        )}

                        <form onSubmit={(e) => void handleCreate(e)} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1 block">Email Address</label>
                                <input required type="email" placeholder="manager@gmail.com"
                                       className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl outline-none focus:border-green-400 transition"
                                       value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1 block">First Name</label>
                                    <input required placeholder="Ivan" className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl outline-none focus:border-green-400 transition"
                                           value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase ml-2 mb-1 block">Last Name</label>
                                    <input required placeholder="Ivanov" className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl outline-none focus:border-green-400 transition"
                                           value={newUser.surname} onChange={e => setNewUser({...newUser, surname: e.target.value})} />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-[#4caf50] text-white py-4 rounded-2xl font-bold uppercase text-[12px] shadow-lg hover:bg-green-600 transition mt-4">
                                Create & Save
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPage;