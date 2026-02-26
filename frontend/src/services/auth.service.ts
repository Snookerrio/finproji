import api from '../api/axios';
import axios from 'axios';
import type {IUser} from "../interfaces/user.interface.ts";



interface IAuthResponse {
    accessToken: string;
    refreshToken: string;
    user: IUser;
}

export const AuthService = {

    async login(credentials: Record<string, string>): Promise<IAuthResponse> {
        const { data } = await api.post<IAuthResponse>('/auth/login', credentials);

        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));

        return data;
    },


    async refresh(): Promise<string> {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            this.logout();
            throw new Error('No refresh token found');
        }


        const { data } = await axios.post<IAuthResponse>(
            'http://127.0.0.1:9000/api/auth/refresh',
            { refreshToken },
            { withCredentials: true }
        );

        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);

        return data.accessToken;
    },


    async activate(token: string, password: string): Promise<{ message: string }> {
        const { data } = await api.post('/auth/activate', { token, password });
        return data;
    },


    logout(): void {
        localStorage.clear();
        window.location.href = '/login';
    },

    getCurrentUser(): IUser | null {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }
};