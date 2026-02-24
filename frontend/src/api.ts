import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const inventoryApi = {
    getAll: () => api.get('/inventory'),
    getBySku: (sku: string) => api.get(`/inventory/${sku}`),
};

export const orderApi = {
    place: (orderData: any) => api.post('/orders', orderData),
};

export const paymentApi = {
    getStatus: (orderNumber: string) => api.get(`/payments/${orderNumber}`),
};

export default api;
