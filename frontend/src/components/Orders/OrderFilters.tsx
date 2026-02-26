import React from 'react';
import { RotateCcw, FileSpreadsheet } from 'lucide-react';
import type {IGroup} from "../../interfaces/group.interface.ts";
import type {IFilters} from "../../interfaces/filters.interface.ts";



interface OrderFiltersProps {
    filters: IFilters;
    setFilters: (f: IFilters) => void;
    handleReset: () => void;
    handleExportExcel: () => void;

    groups: IGroup[];
    COURSES: string[];
    COURSE_FORMATS: string[];
    COURSE_TYPES: string[];
    STATUSES: string[];
}

const OrderFilters: React.FC<OrderFiltersProps> = ({
                                                       filters,
                                                       setFilters,
                                                       handleReset,
                                                       handleExportExcel,
                                                       groups,
                                                       COURSES,
                                                       COURSE_FORMATS,
                                                       COURSE_TYPES,
                                                       STATUSES
                                                   }) => {


    const updateFilter = (key: keyof IFilters, value: string | boolean | number) => {
        setFilters({ ...filters, [key]: value, page: 1 });
    };

    return (
        <div className="bg-gray-100 p-3 rounded-lg shadow-sm mb-4 space-y-2">

            <div className="flex flex-wrap gap-2">
                <input
                    placeholder="Name"
                    className="p-1 border rounded text-xs flex-1 min-w-[120px]"
                    value={filters.name}
                    onChange={e => updateFilter('name', e.target.value)}
                />
                <input
                    placeholder="Surname"
                    className="p-1 border rounded text-xs flex-1 min-w-[120px]"
                    value={filters.surname}
                    onChange={e => updateFilter('surname', e.target.value)}
                />
                <input
                    placeholder="Email"
                    className="p-1 border rounded text-xs flex-1 min-w-[120px]"
                    value={filters.email}
                    onChange={e => updateFilter('email', e.target.value)}
                />
                <input
                    placeholder="Phone"
                    className="p-1 border rounded text-xs flex-1 min-w-[120px]"
                    value={filters.phone}
                    onChange={e => updateFilter('phone', e.target.value)}
                />
                <input
                    placeholder="Age"
                    className="p-1 border rounded text-xs w-20"
                    value={filters.age}
                    onChange={e => updateFilter('age', e.target.value)}
                />

                <select
                    className="p-1 border rounded text-xs bg-white w-40"
                    value={filters.course}
                    onChange={e => updateFilter('course', e.target.value)}
                >
                    <option value="">all courses</option>
                    {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <div className="flex items-center gap-2">
                    <label className="text-xs flex items-center gap-1 cursor-pointer font-bold">
                        <input
                            type="checkbox"
                            checked={filters.my}
                            onChange={e => updateFilter('my', e.target.checked)}
                        /> My
                    </label>
                    <button
                        type="button"
                        onClick={handleReset}
                        title="Reset filters"
                        className="bg-[#4caf50] text-white p-1 rounded hover:bg-green-600 transition"
                    >
                        <RotateCcw size={16}/>
                    </button>
                    <button
                        type="button"
                        onClick={handleExportExcel}
                        title="Export to Excel"
                        className="bg-[#4caf50] text-white p-1 rounded hover:bg-green-600 transition"
                    >
                        <FileSpreadsheet size={16}/>
                    </button>
                </div>
            </div>


            <div className="flex flex-wrap gap-2">
                <select
                    className="p-1 border rounded text-xs bg-white flex-1"
                    value={filters.course_format}
                    onChange={e => updateFilter('course_format', e.target.value)}
                >
                    <option value="">all formats</option>
                    {COURSE_FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>

                <select
                    className="p-1 border rounded text-xs bg-white flex-1"
                    value={filters.course_type}
                    onChange={e => updateFilter('course_type', e.target.value)}
                >
                    <option value="">all types</option>
                    {COURSE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>

                <select
                    className="p-1 border rounded text-xs bg-white flex-1"
                    value={filters.status}
                    onChange={e => updateFilter('status', e.target.value)}
                >
                    <option value="">all statuses</option>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                <select
                    className="p-1 border rounded text-xs bg-white flex-1"
                    value={filters.group}
                    onChange={e => updateFilter('group', e.target.value)}
                >
                    <option value="">all groups</option>
                    {groups.map((g, i) => <option key={i} value={g.name}>{g.name}</option>)}
                </select>

                <input
                    type="date"
                    className="p-1 border rounded text-xs flex-1"
                    value={filters.start_date}
                    onChange={e => updateFilter('start_date', e.target.value)}
                />
                <input
                    type="date"
                    className="p-1 border rounded text-xs flex-1"
                    value={filters.end_date}
                    onChange={e => updateFilter('end_date', e.target.value)}
                />
            </div>
        </div>
    );
};

export default OrderFilters;