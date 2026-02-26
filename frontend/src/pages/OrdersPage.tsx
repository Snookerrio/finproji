import React, { useEffect, useState,  useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';

import { OrderService } from '../services/order.service';
import { AuthService } from '../services/auth.service';
import { useOrders } from '../hooks/useOrders';

import OrderFilters from '../components/Orders/OrderFilters';
import OrderRow from '../components/Orders/OrderRow';
import OrderEditModal from '../components/Orders/OrderEditModal';

import type { IOrder } from "../interfaces/order.interface.ts";
import type { IFilters } from "../interfaces/filters.interface.ts";
import type { IUser } from "../interfaces/user.interface.ts";

const STATUSES = ["New", "In work", "Agree", "Disagree", "Dubbing"];
const COURSES = ["FS", "QACX", "JCX", "JSCX", "FE", "PCX"];
const COURSE_TYPES = ["pro", "minimal", "premium", "incubator", "vip"];
const COURSE_FORMATS = ["static", "online"];

const OrdersPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();


    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
    const [commentText, setCommentText] = useState("");


    const initialFilters = useMemo((): IFilters => ({
        page: Number(searchParams.get('page')) || 1,
        sortBy: searchParams.get('sortBy') || 'createdAt',
        order: (searchParams.get('order') as 'asc' | 'desc') || 'desc',
        name: searchParams.get('name') || '',
        surname: searchParams.get('surname') || '',
        email: searchParams.get('email') || '',
        phone: searchParams.get('phone') || '',
        age: searchParams.get('age') || '',
        course: searchParams.get('course') || '',
        course_format: searchParams.get('course_format') || '',
        course_type: searchParams.get('course_type') || '',
        status: searchParams.get('status') || '',
        group: searchParams.get('group') || '',
        start_date: searchParams.get('start_date') || '',
        end_date: searchParams.get('end_date') || '',
        my: searchParams.get('my') === 'true'
    }), [searchParams]);


    const { orders, total, groups, setGroups, filters, setFilters, fetchData } = useOrders(initialFilters);

    const limit = 25;
    const totalPages = Math.ceil(total / limit) || 1;


    useEffect(() => {
        const params: Record<string, string> = {};
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== '' && value !== false && value !== null) {
                params[key] = value.toString();
            }
        });
        setSearchParams(params);
    }, [filters, setSearchParams]);


    const storedUser: IUser | null = AuthService.getCurrentUser();
    const fullName = storedUser ? `${storedUser.name} ${storedUser.surname}` : "User";
    const userRole = storedUser?.role || "manager";
    const currentUserSurname = storedUser?.surname || "Unknown";


    const handleSort = (column: string) => {
        const isAsc = filters.sortBy === column && filters.order === 'asc';
        setFilters({
            ...filters,
            sortBy: column,
            order: isAsc ? 'desc' : 'asc',
            page: 1
        });
    };

    const renderSortIcon = (column: string) => {
        if (filters.sortBy !== column) return <span className="text-gray-400 opacity-30 ml-1">↕</span>;
        return filters.order === 'asc' ? <span className="ml-1">↑</span> : <span className="ml-1">↓</span>;
    };

    const handleReset = () => setFilters({
        page: 1, sortBy: 'createdAt', order: 'desc',
        name: '', surname: '', email: '', phone: '', age: '',
        course: '', course_format: '', course_type: '', status: '', group: '',
        start_date: '', end_date: '', my: false
    });

    const handleExportExcel = async () => {
        try {
            const blob = await OrderService.exportExcel(filters);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `orders_${new Date().toISOString().split('T')[0]}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Excel export failed", error);
            alert("Excel export failed");
        }
    };

    const handleCommentSubmit = async (order: IOrder, text: string) => {
        if (!text.trim()) return;
        try {
            await OrderService.addComment(order._id, text);
            setCommentText("");
            await fetchData();
        } catch (error) {
            console.error("Error adding comment", error);
            alert("Не вдалося додати коментар");
        }
    };


    const getPaginationItems = () => {
        const items: (number | string)[] = [];
        const siblingCount = 1;

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) items.push(i);
        } else {
            const leftSiblingIndex = Math.max(filters.page - siblingCount, 1);
            const rightSiblingIndex = Math.min(filters.page + siblingCount, totalPages);
            const showLeftDots = leftSiblingIndex > 2;
            const showRightDots = rightSiblingIndex < totalPages - 2;

            if (!showLeftDots && showRightDots) {
                for (let i = 1; i <= 5; i++) items.push(i);
                items.push('...');
                items.push(totalPages);
            } else if (showLeftDots && !showRightDots) {
                items.push(1);
                items.push('...');
                for (let i = totalPages - 4; i <= totalPages; i++) items.push(i);
            } else {
                items.push(1);
                items.push('...');
                for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) items.push(i);
                items.push('...');
                items.push(totalPages);
            }
        }
        return items;
    };

    return (
        <div className="min-h-screen bg-white font-sans text-gray-800">
            <header className="bg-[#8bc34a] px-6 py-2 flex justify-between items-center text-white shadow-md">
                <h1 className="text-2xl font-bold tracking-tight uppercase">CRM System</h1>
                <div className="flex items-center gap-4">
                    <span className="text-lg font-medium italic">{fullName}</span>
                    {userRole === 'admin' && (
                        <button onClick={() => navigate('/admin')} className="p-1.5 bg-green-700/20 rounded hover:bg-green-700/40 transition">
                            <Settings size={22}/>
                        </button>
                    )}
                    <button onClick={() => AuthService.logout()} className="p-1.5 bg-green-700/20 rounded hover:bg-red-500/40 transition">
                        <LogOut size={22}/>
                    </button>
                </div>
            </header>

            <main className="p-2">
                <OrderFilters
                    filters={filters} setFilters={setFilters} handleReset={handleReset}
                    handleExportExcel={handleExportExcel} groups={groups}
                    COURSES={COURSES} COURSE_FORMATS={COURSE_FORMATS}
                    COURSE_TYPES={COURSE_TYPES} STATUSES={STATUSES}
                />

                <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200">
                    <table className="w-full text-left border-collapse text-[11px] min-w-[1700px]">
                        <thead className="bg-[#8bc34a] text-white uppercase font-bold">
                        <tr>
                            <th className="p-2 border border-white/20 cursor-pointer hover:bg-green-600 transition text-center" onClick={() => handleSort('createdAt')}>id {renderSortIcon('createdAt')}</th>
                            <th className="p-2 border border-white/20 cursor-pointer hover:bg-green-600 transition" onClick={() => handleSort('name')}>name {renderSortIcon('name')}</th>
                            <th className="p-2 border border-white/20 cursor-pointer hover:bg-green-600 transition" onClick={() => handleSort('surname')}>surname {renderSortIcon('surname')}</th>
                            <th className="p-2 border border-white/20 cursor-pointer hover:bg-green-600 transition" onClick={() => handleSort('email')}>email {renderSortIcon('email')}</th>
                            <th className="p-2 border border-white/20">phone</th>
                            <th className="p-2 border border-white/20 cursor-pointer hover:bg-green-600 transition" onClick={() => handleSort('age')}>age {renderSortIcon('age')}</th>
                            <th className="p-2 border border-white/20 cursor-pointer hover:bg-green-600 transition" onClick={() => handleSort('course')}>course {renderSortIcon('course')}</th>
                            <th className="p-2 border border-white/20">course_format</th>
                            <th className="p-2 border border-white/20">course_type</th>
                            <th className="p-2 border border-white/20 text-center cursor-pointer hover:bg-green-600 transition" onClick={() => handleSort('status')}>status {renderSortIcon('status')}</th>
                            <th className="p-2 border border-white/20 text-center">sum</th>
                            <th className="p-2 border border-white/20 text-center">alreadyPaid</th>
                            <th className="p-2 border border-white/20 italic cursor-pointer hover:bg-green-600 transition" onClick={() => handleSort('group')}>group {renderSortIcon('group')}</th>
                            <th className="p-2 border border-white/20 cursor-pointer hover:bg-green-600 transition" onClick={() => handleSort('createdAt')}>created_at {renderSortIcon('createdAt')}</th>
                            <th className="p-2 border border-white/20">manager</th>
                        </tr>
                        </thead>
                        <tbody>
                        {orders.map((order, idx) => {

                            const displayId = total - ((filters.page - 1) * limit) - idx;
                            return (
                                <OrderRow
                                    key={order._id}
                                    order={order}
                                    idx={displayId}
                                    filtersPage={filters.page}
                                    currentUserSurname={currentUserSurname}
                                    isExpanded={expandedOrderId === order._id}
                                    onToggleExpand={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)}
                                    onCommentSubmit={handleCommentSubmit}
                                    onEdit={setSelectedOrder}
                                    commentText={commentText}
                                    setCommentText={setCommentText}
                                />
                            );
                        })}
                        </tbody>
                    </table>
                </div>


                <div className="mt-8 mb-10 flex justify-center items-center gap-2">
                    <button
                        onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                        disabled={filters.page === 1}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-[#8bc34a] text-white hover:bg-green-600 disabled:opacity-30 transition shadow-md"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    {getPaginationItems().map((item, index) => {
                        if (item === '...') {
                            return <span key={index} className="w-10 h-10 flex items-center justify-center text-[#8bc34a] font-bold">...</span>;
                        }
                        return (
                            <button
                                key={index}
                                onClick={() => setFilters({ ...filters, page: Number(item) })}
                                className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold transition-all shadow-md 
                                    ${item === filters.page
                                    ? 'bg-green-800 text-white scale-110'
                                    : 'bg-[#8bc34a] text-white hover:bg-green-600'
                                }`}
                            >
                                {item}
                            </button>
                        );
                    })}

                    <button
                        onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                        disabled={filters.page === totalPages}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-[#8bc34a] text-white hover:bg-green-600 disabled:opacity-30 transition shadow-md"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </main>

            {selectedOrder && (
                <OrderEditModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onRefresh={fetchData}
                    groups={groups}
                    setGroups={setGroups}
                    STATUSES={STATUSES}
                    COURSES={COURSES}
                    COURSE_FORMATS={COURSE_FORMATS}
                    COURSE_TYPES={COURSE_TYPES}
                />
            )}
        </div>
    );
};

export default OrdersPage;