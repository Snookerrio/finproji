import { useState, useEffect, useCallback, useRef } from 'react';

import { OrderService } from '../services/order.service';
import type {IOrder} from "../interfaces/order.interface.ts";
import type {IStats} from "../interfaces/stats.interface.ts";
import type {IGroup} from "../interfaces/group.interface.ts";
import type {IFilters} from "../interfaces/filters.interface.ts";


export const useOrders = (initialFilters: IFilters) => {
    const [orders, setOrders] = useState<IOrder[]>([]);
    const [stats, setStats] = useState<IStats | null>(null);
    const [total, setTotal] = useState<number>(0);
    const [groups, setGroups] = useState<IGroup[]>([]);

    const [filters, setFilters] = useState<IFilters>(initialFilters);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fetchData = useCallback(async (): Promise<void> => {
        try {

            const [ordersData, statsData, groupsData] = await Promise.all([
                OrderService.getAll(filters),
                OrderService.getStats(),
                OrderService.getGroups()
            ]);


            setOrders(ordersData.data);
            setTotal(ordersData.total);
            setStats(statsData);
            setGroups(groupsData || []);
        } catch (error) {
            console.error("Error loading data in hook:", error);
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