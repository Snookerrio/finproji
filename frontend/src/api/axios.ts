import axios, {type InternalAxiosRequestConfig } from 'axios';

const api = axios.create({

    baseURL: 'http://127.0.0.1:9000/api',
    withCredentials: true
});
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;