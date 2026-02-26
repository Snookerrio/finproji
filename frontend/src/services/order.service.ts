import api from '../api/axios';
import type {IOrder} from "../interfaces/order.interface.ts";
import type {IFilters} from "../interfaces/filters.interface.ts";
import type {IStats} from "../interfaces/stats.interface.ts";
import type {IGroup} from "../interfaces/group.interface.ts";


export const OrderService = {
    async getAll(filters: IFilters): Promise<{ data: IOrder[]; total: number }> {
        const { data } = await api.get<{ data: IOrder[]; total: number }>('/orders', { params: filters });
        return data;
    },

    async update(id: string, updateData: Partial<IOrder>): Promise<IOrder> {
        const { data } = await api.patch<IOrder>(`/orders/${id}`, updateData);
        return data;
    },

    async addComment(id: string, text: string): Promise<IOrder> {
        const { data } = await api.post<IOrder>(`/orders/${id}/comment`, { text });
        return data;
    },

    async getStats(): Promise<IStats> {
        const { data } = await api.get<IStats>('/orders/stats');
        return data;
    },

    async exportExcel(filters: IFilters): Promise<Blob> {
        const { data } = await api.get('/orders/export', {
            params: filters,
            responseType: 'blob'
        });
        return data;
    },


    async getGroups(): Promise<IGroup[]> {
        const { data } = await api.get<IGroup[]>('/orders/groups');
        return data;
    },

    async createGroup(name: string): Promise<IGroup> {
        const { data } = await api.post<IGroup>('/orders/groups', { name });
        return data;
    }
};