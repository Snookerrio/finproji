import axios, { type InternalAxiosRequestConfig } from 'axios';
import { AuthService } from '../services/auth.service';

const api = axios.create({
    baseURL: 'http://127.0.0.1:9000/api',
    withCredentials: true
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;


        if (originalRequest.url?.includes('/auth/login')) {
            return Promise.reject(error);
        }


        if (originalRequest.url?.includes('/auth/refresh')) {
            isRefreshing = false;
            AuthService.logout();
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(token => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                console.log('Access token expired, trying to refresh...');
                const newToken = await AuthService.refresh();

                processQueue(null, newToken);

                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                }

                return api.request(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                AuthService.logout();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;