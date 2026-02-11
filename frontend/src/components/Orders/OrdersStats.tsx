import React from 'react';

interface OrderStatsProps {
    stats: any;
}

const OrderStats: React.FC<OrderStatsProps> = ({ stats }) => {
    if (!stats) return null;
    return (
        <div className="text-center mb-4 text-[11px] font-bold text-gray-700">
            <p className="mb-1">Orders statistic</p>
            <div className="flex justify-center gap-4">
                <span>total: {stats.total}</span>
                <span>In work: {stats.inWork}</span>
                <span>Agree: {stats.agree}</span>
                <span>Disagree: {stats.disagree}</span>
                <span>Dubbing: {stats.dubbing}</span>
                <span>New: {stats.new}</span>
            </div>
        </div>
    );
};

export default OrderStats;