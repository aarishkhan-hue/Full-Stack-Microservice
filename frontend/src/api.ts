import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authApi = {
    login: (credentials: any) => api.post('/auth/login', credentials),
    register: (userData: any) => api.post('/auth/register', userData),
};

export const userManagementApi = {
    getAll: () => api.get('/users'),
    getCount: () => api.get('/users/count'),
    getCustomerCount: () => api.get('/users/analytics/customers'),
    getActiveSessions: () => api.get('/users/analytics/active'),
};

export const inventoryApi = {
    getAll: () => api.get('/inventory'),
    getBySku: (sku: string) => api.get(`/inventory/${sku}`),
    create: (data: any) => api.post('/inventory', data),
    update: (id: number, data: any) => api.put(`/inventory/${id}`, data),
    delete: (id: number) => api.delete(`/inventory/${id}`),
};

export const orderApi = {
    place: (orderData: any) => api.post('/orders', orderData),
    getSalesAnalytics: (period: string) => api.get(`/orders/analytics/sales?period=${period}`),
};

export const paymentApi = {
    getStatus: (orderNumber: string) => api.get(`/payments/${orderNumber}`),
};

export default api;
