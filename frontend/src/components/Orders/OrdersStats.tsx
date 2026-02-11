import React from 'react';
import type { IStats } from "../../interfaces/order.interface.ts";

interface OrderStatsProps {
    stats: IStats | null;
}

const OrderStats: React.FC<OrderStatsProps> = ({ stats }) => {
    if (!stats) return <div className="h-10"></div>;

    return (
        <div className="text-center mb-4 text-[11px] font-bold text-gray-700">
            <p className="mb-1 uppercase tracking-wider text-gray-400">Orders statistic</p>
            <div className="flex justify-center gap-6 bg-white py-2 rounded-xl shadow-sm border border-gray-100 p-2">
                <div className="flex flex-col">
                    <span className="text-gray-400 font-normal">Total</span>
                    <span className="text-blue-600">{stats.total}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-gray-400 font-normal">In work</span>
                    <span className="text-orange-500">{stats.inWork}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-gray-400 font-normal">Agree</span>
                    <span className="text-green-600">{stats.agree}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-gray-400 font-normal">Disagree</span>
                    <span className="text-red-500">{stats.disagree}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-gray-400 font-normal">Dubbing</span>
                    <span className="text-purple-500">{stats.dubbing}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-gray-400 font-normal">New</span>

                    <span className="text-gray-800">{stats.new}</span>
                </div>
            </div>
        </div>
    );
};

export default OrderStats;