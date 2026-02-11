import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';

export const useOrders = (initialFilters: any) => {
    const [orders, setOrders] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [total, setTotal] = useState(0);
    const [groups, setGroups] = useState<{ name: string }[]>([]);


    const [filters, setFilters] = useState(initialFilters);

    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);


    const fetchData = useCallback(async () => {
        try {

            const [ordersRes, statsRes, groupsRes] = await Promise.all([
                api.get('/orders', {
                    params: {
                        ...filters,
                        limit: 25
                    }
                }),
                api.get('/orders/stats'),
                api.get('/orders/groups')
            ]);

            setOrders(ordersRes.data.data);
            setTotal(ordersRes.data.total);
            setStats(statsRes.data);
            setGroups(groupsRes.data || []);
        } catch (error) {
            console.error("Помилка завантаження даних:", error);
        }
    }, [filters]);


    useEffect(() => {
        setFilters(initialFilters);
    }, [JSON.stringify(initialFilters)]);


    useEffect(() => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        debounceTimer.current = setTimeout(() => {

            void fetchData();
        }, 400);

        return () => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
        };
    }, [filters, fetchData]);

    return {
        orders,
        stats,
        total,
        groups,
        setGroups,
        filters,
        setFilters,
        fetchData
    };
};