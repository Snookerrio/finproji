import React, { useState } from 'react';
import { X, Plus, List } from 'lucide-react';
import api from '../../api/axios';

interface OrderEditModalProps {
    order: any;
    onClose: () => void;
    onRefresh: () => void;
    groups: { name: string }[];
    setGroups: React.Dispatch<React.SetStateAction<{ name: string }[]>>;
    STATUSES: string[];
    COURSES: string[];
    COURSE_FORMATS: string[];
    COURSE_TYPES: string[];
}

const OrderEditModal: React.FC<OrderEditModalProps> = ({
                                                           order, onClose, onRefresh, groups, setGroups, STATUSES, COURSES, COURSE_FORMATS, COURSE_TYPES
                                                       }) => {
    const [selectedOrder, setSelectedOrder] = useState({ ...order });
    const [isAddingGroup, setIsAddingGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState("");

    const handleAddGroup = async () => {
        if (!newGroupName.trim()) return;
        try {
            const res = await api.post('/orders/groups', { name: newGroupName });
            setGroups(prev => [...prev, res.data]);
            setSelectedOrder({ ...selectedOrder, group: res.data.name });
            setNewGroupName("");
            setIsAddingGroup(false);
        } catch (error) {
            alert("Error adding group. Maybe it already exists?");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.patch(`/orders/${selectedOrder._id}`, selectedOrder);
            onRefresh();
            onClose();
        } catch (error) {
            alert("Error saving order");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
            <div className="bg-white rounded-[40px] w-full max-w-5xl shadow-2xl p-10 relative border-t-[12px] border-[#8bc34a] overflow-y-auto max-h-[95vh]">
                <button onClick={onClose} className="absolute top-6 right-8 text-gray-400 hover:text-gray-600 transition">
                    <X size={32} />
                </button>

                <h2 className="text-2xl font-black uppercase text-gray-800 mb-10 border-b pb-4 tracking-tighter">
                    Profile details
                </h2>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-2 gap-x-12 gap-y-6 text-[11px] font-bold">


                        <div className="space-y-1">
                            <label className="text-gray-400 uppercase ml-2">Group</label>
                            <div className="flex flex-col gap-2">
                                {isAddingGroup ? (
                                    <input
                                        required
                                        className="w-full border-2 border-green-100 p-3 rounded-xl bg-gray-50 outline-none"
                                        value={newGroupName}
                                        onChange={e => setNewGroupName(e.target.value)}
                                        placeholder="Enter group name..."
                                    />
                                ) : (
                                    <select
                                        className="w-full border-2 border-gray-100 p-3 rounded-xl bg-gray-50 outline-none font-bold italic text-blue-800"
                                        value={selectedOrder.group || ''}
                                        onChange={e => setSelectedOrder({ ...selectedOrder, group: e.target.value })}
                                    >
                                        <option value="">No Group</option>
                                        {groups.map((g, i) => <option key={i} value={g.name}>{g.name}</option>)}
                                    </select>
                                )}
                                <div className="flex gap-1 h-8">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingGroup(true)}
                                        className={`flex-1 text-[9px] font-black rounded-lg border uppercase transition ${isAddingGroup ? 'bg-green-600 text-white' : 'bg-gray-100'}`}
                                    >
                                        <Plus size={10} className="inline mr-1" /> ADD NEW
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => { if (isAddingGroup) handleAddGroup(); else setIsAddingGroup(false); }}
                                        className={`flex-1 text-[9px] font-black rounded-lg border uppercase transition ${!isAddingGroup ? 'bg-green-600 text-white' : 'bg-gray-100'}`}
                                    >
                                        <List size={10} className="inline mr-1" /> {isAddingGroup ? 'SAVE GROUP' : 'SELECT'}
                                    </button>
                                </div>
                            </div>
                        </div>


                        <div className="space-y-1">
                            <label className="text-gray-400 uppercase ml-2">Status</label>
                            <select
                                className="w-full border-2 border-gray-100 p-3 rounded-xl bg-gray-50 outline-none font-black text-blue-700"
                                value={selectedOrder.status || ''}
                                onChange={e => setSelectedOrder({ ...selectedOrder, status: e.target.value })}
                            >
                                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>


                        <div>
                            <label className="text-gray-400 uppercase ml-2">Name</label>
                            <input className="w-full border-2 border-gray-100 p-3 rounded-xl bg-gray-100 outline-none" value={selectedOrder.name || ''} onChange={e => setSelectedOrder({ ...selectedOrder, name: e.target.value })} />
                        </div>

                        <div>
                            <label className="text-gray-400 uppercase ml-2">Sum</label>
                            <input type="number" className="w-full border-2 border-gray-100 p-3 rounded-xl bg-gray-100 font-bold text-green-700 outline-none" value={selectedOrder.sum || 0} onChange={e => setSelectedOrder({ ...selectedOrder, sum: Number(e.target.value) })} />
                        </div>

                        <div>
                            <label className="text-gray-400 uppercase ml-2">Surname</label>
                            <input className="w-full border-2 border-gray-100 p-3 rounded-xl bg-gray-100 outline-none" value={selectedOrder.surname || ''} onChange={e => setSelectedOrder({ ...selectedOrder, surname: e.target.value })} />
                        </div>

                        <div>
                            <label className="text-gray-400 uppercase ml-2">Already paid</label>
                            <input type="number" className="w-full border-2 border-gray-100 p-3 rounded-xl bg-gray-100 font-bold outline-none" value={selectedOrder.already_paid || 0} onChange={e => setSelectedOrder({ ...selectedOrder, already_paid: Number(e.target.value) })} />
                        </div>

                        <div>
                            <label className="text-gray-400 uppercase ml-2">Email</label>
                            <input className="w-full border-2 border-gray-100 p-3 rounded-xl bg-gray-100 italic text-blue-600 outline-none" value={selectedOrder.email || ''} onChange={e => setSelectedOrder({ ...selectedOrder, email: e.target.value })} />
                        </div>


                        <div>
                            <label className="text-gray-400 uppercase ml-2">Course</label>
                            <select className="w-full border-2 border-gray-100 p-3 rounded-xl bg-gray-50 outline-none" value={selectedOrder.course || ''} onChange={e => setSelectedOrder({ ...selectedOrder, course: e.target.value })}>
                                <option value="">Select Course</option>
                                {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="text-gray-400 uppercase ml-2">Course Format</label>
                            <select className="w-full border-2 border-gray-100 p-3 rounded-xl bg-gray-50 outline-none" value={selectedOrder.course_format || ''} onChange={e => setSelectedOrder({ ...selectedOrder, course_format: e.target.value })}>
                                <option value="">Select Format</option>
                                {COURSE_FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="text-gray-400 uppercase ml-2">Course Type</label>
                            <select className="w-full border-2 border-gray-100 p-3 rounded-xl bg-gray-50 outline-none" value={selectedOrder.course_type || ''} onChange={e => setSelectedOrder({ ...selectedOrder, course_type: e.target.value })}>
                                <option value="">Select Type</option>
                                {COURSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="text-gray-400 uppercase ml-2">Phone</label>
                            <input className="w-full border-2 border-gray-100 p-3 rounded-xl bg-gray-100 outline-none" value={selectedOrder.phone || ''} onChange={e => setSelectedOrder({ ...selectedOrder, phone: e.target.value })} />
                        </div>

                        <div>
                            <label className="text-gray-400 uppercase ml-2">Age</label>
                            <input type="number" className="w-full border-2 border-gray-100 p-3 rounded-xl bg-gray-100 font-bold outline-none" value={selectedOrder.age || 0} onChange={e => setSelectedOrder({ ...selectedOrder, age: Number(e.target.value) })} />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-8 border-t">
                        <button type="button" onClick={onClose} className="px-12 py-3 bg-red-50 text-red-500 rounded-2xl font-black uppercase text-[10px] hover:bg-red-500 hover:text-white transition-all shadow-sm">CLOSE</button>
                        <button type="submit" className="px-12 py-3 bg-[#4caf50] text-white rounded-2xl font-black uppercase text-[10px] hover:bg-green-700 transition-all shadow-md active:translate-y-1">SUBMIT</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OrderEditModal;