import api from '../api/axios';
import type {IUser} from "../interfaces/user.interface.ts";
import type {IStats} from "../interfaces/stats.interface.ts";


export const AdminService = {

    async getUsers(page: number): Promise<{ users: IUser[], totalPages: number }> {
        const { data } = await api.get(`/admin/users?page=${page}`);
        return data;
    },


    async getAdminStats(): Promise<IStats> {
        const { data } = await api.get<IStats>('/admin/stats');
        return data;
    },


    async createManager(userData: { email: string; name: string; surname: string }): Promise<IUser> {
        const { data } = await api.post<IUser>('/admin/users', userData);
        return data;
    },


    async getReToken(userId: string): Promise<{ token: string }> {
        const { data } = await api.post(`/admin/users/${userId}/re-token`);
        return data;
    },


    async banUser(userId: string): Promise<void> {
        await api.patch(`/admin/users/${userId}/ban`);
    },


    async unbanUser(userId: string): Promise<void> {
        await api.patch(`/admin/users/${userId}/unban`);
    }
};