import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';
import type { IFilters, IGroup, IOrder, IStats } from "../interfaces/order.interface.ts";

export const useOrders = (initialFilters: IFilters) => {
    const [orders, setOrders] = useState<IOrder[]>([]);
    const [stats, setStats] = useState<IStats | null>(null);
    const [total, setTotal] = useState<number>(0);
    const [groups, setGroups] = useState<IGroup[]>([]);


    const [filters, setFilters] = useState<IFilters>(initialFilters);

    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fetchData = useCallback(async (): Promise<void> => {
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
        setFilters(prev => {
            const isSame = JSON.stringify(prev) === JSON.stringify(initialFilters);
            return isSame ? prev : initialFilters;
        });
    }, [initialFilters]);


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