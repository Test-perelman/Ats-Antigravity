import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        const teamId = localStorage.getItem('teamId');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        if (teamId) {
            config.headers['x-team-id'] = teamId;
        }
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle global errors (e.g. 401 logout)
        if (error.response?.status === 401) {
            // Logic to redirect to login could go here
        }
        return Promise.reject(error);
    }
);

export default api;
