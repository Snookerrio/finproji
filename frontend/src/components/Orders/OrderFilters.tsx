import React from 'react';
import { RotateCcw, FileSpreadsheet } from 'lucide-react';

interface OrderFiltersProps {
    filters: any;
    setFilters: (f: any) => void;
    handleReset: () => void;
    handleExportExcel: () => void;
    groups: any[];
    COURSES: string[];
    COURSE_FORMATS: string[];
    COURSE_TYPES: string[];
    STATUSES: string[];
}

const OrderFilters: React.FC<OrderFiltersProps> = ({
                                                       filters, setFilters, handleReset, handleExportExcel, groups, COURSES, COURSE_FORMATS, COURSE_TYPES, STATUSES
                                                   }) => {
    return (
        <div className="bg-gray-100 p-3 rounded-lg shadow-sm mb-4 space-y-2">
            <div className="flex flex-wrap gap-2">
                <input placeholder="Name" className="p-1 border rounded text-xs flex-1 min-w-[120px]" value={filters.name} onChange={e => setFilters({...filters, name: e.target.value, page: 1})} />
                <input placeholder="Surname" className="p-1 border rounded text-xs flex-1 min-w-[120px]" value={filters.surname} onChange={e => setFilters({...filters, surname: e.target.value, page: 1})} />
                <input placeholder="Email" className="p-1 border rounded text-xs flex-1 min-w-[120px]" value={filters.email} onChange={e => setFilters({...filters, email: e.target.value, page: 1})} />
                <input placeholder="Phone" className="p-1 border rounded text-xs flex-1 min-w-[120px]" value={filters.phone} onChange={e => setFilters({...filters, phone: e.target.value, page: 1})} />
                <input placeholder="Age" className="p-1 border rounded text-xs w-20" value={filters.age} onChange={e => setFilters({...filters, age: e.target.value, page: 1})} />
                <select className="p-1 border rounded text-xs bg-white w-40" value={filters.course} onChange={e => setFilters({...filters, course: e.target.value, page: 1})}>
                    <option value="">all courses</option>{COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="flex items-center gap-2">
                    <label className="text-xs flex items-center gap-1 cursor-pointer font-bold">
                        <input type="checkbox" checked={filters.my} onChange={e => setFilters({...filters, my: e.target.checked, page: 1})} /> My
                    </label>
                    <button onClick={handleReset} className="bg-[#4caf50] text-white p-1 rounded hover:bg-green-600 transition"><RotateCcw size={16}/></button>
                    <button onClick={handleExportExcel} className="bg-[#4caf50] text-white p-1 rounded hover:bg-green-600 transition"><FileSpreadsheet size={16}/></button>
                </div>
            </div>
            <div className="flex flex-wrap gap-2">
                <select className="p-1 border rounded text-xs bg-white flex-1" value={filters.course_format} onChange={e => setFilters({...filters, course_format: e.target.value, page: 1})}>
                    <option value="">all formats</option>{COURSE_FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
                <select className="p-1 border rounded text-xs bg-white flex-1" value={filters.course_type} onChange={e => setFilters({...filters, course_type: e.target.value, page: 1})}>
                    <option value="">all types</option>{COURSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select className="p-1 border rounded text-xs bg-white flex-1" value={filters.status} onChange={e => setFilters({...filters, status: e.target.value, page: 1})}>
                    <option value="">all statuses</option>{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select className="p-1 border rounded text-xs bg-white flex-1" value={filters.group} onChange={e => setFilters({...filters, group: e.target.value, page: 1})}>
                    <option value="">all groups</option>{groups.map((g, i) => <option key={i} value={g.name}>{g.name}</option>)}
                </select>
                <input type="date" className="p-1 border rounded text-xs flex-1" value={filters.start_date} onChange={e => setFilters({...filters, start_date: e.target.value, page: 1})} />
                <input type="date" className="p-1 border rounded text-xs flex-1" value={filters.end_date} onChange={e => setFilters({...filters, end_date: e.target.value, page: 1})} />
            </div>
        </div>
    );
};

export default OrderFilters;