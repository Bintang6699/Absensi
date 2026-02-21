import axios from 'axios';

// Di production Vercel: gunakan VITE_API_URL (URL backend terpisah)
// Di development lokal: gunakan '/api' (via Vite proxy ke localhost:5000)
const BASE_URL = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api';

const API = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
});

// Add a request interceptor to include the token in headers
API.interceptors.request.use(
    (config) => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr && userStr !== 'undefined' && userStr !== 'null') {
                const user = JSON.parse(userStr);
                if (user && user.token) {
                    config.headers.Authorization = `Bearer ${user.token}`;
                }
            }
        } catch (error) {
            console.error('Axios request interceptor error:', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle banned users and authentication errors
API.interceptors.response.use(
    (response) => response,
    (error) => {
        const { status, data } = error.response || {};

        if (status === 403) {
            // Handle Ban
            let errorData = null;
            try {
                errorData = typeof data.message === 'string'
                    ? JSON.parse(data.message)
                    : data.message;

                if (errorData && errorData.banned) {
                    const user = localStorage.getItem('user');
                    if (user) {
                        const userData = JSON.parse(user);
                        userData.isBanned = true;
                        userData.banReason = errorData.reason;
                        userData.banExpires = errorData.expires;
                        userData.updatedAt = errorData.bannedDate;
                        localStorage.setItem('user', JSON.stringify(userData));
                    }
                    window.location.href = '/banned';
                }
            } catch (e) {
                // Not a ban error
            }
        }

        if (status === 401) {
            // Handle Unauthorized (Token expired or role mismatch)
            // But only if we are not already on the login page or root to avoid loops
            const currentPath = window.location.pathname;
            if (!currentPath.includes('/login') && currentPath !== '/') {
                localStorage.removeItem('user');
                // Use window.location instead of navigate because we are outside a component
                window.location.href = '/';
            } else if (currentPath === '/') {
                // If on landing page, just clear storage but don't reload
                localStorage.removeItem('user');
            }
        }

        return Promise.reject(error);
    }
);

export default API;
