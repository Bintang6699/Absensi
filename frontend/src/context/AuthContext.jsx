import { createContext, useState, useEffect, useContext } from 'react';
import API from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () => {
            try {
                // Try to get user from local storage first for immediate UI
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }

                // Verify session with backend (checks cookie)
                const { data } = await API.get('/auth/me');
                if (data && data.role) data.role = data.role.toLowerCase();
                setUser(data);
                localStorage.setItem('user', JSON.stringify(data));
            } catch (error) {
                // Session invalid or expired
                localStorage.removeItem('user');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkSession();
    }, []);

    // Phase 2: Background polling for real-time ban redirection
    useEffect(() => {
        let interval;
        if (user && user.token && !user.isBanned) {
            interval = setInterval(async () => {
                try {
                    // This call will be caught by the interceptor if status is 403 (Banned)
                    await API.get('/auth/status');
                } catch (error) {
                    // Interceptor handles the 403, we just catch to prevent console errors
                }
            }, 3000); // Check every 3 seconds for faster detection
        }
        return () => clearInterval(interval);
    }, [user]);



    const login = async (email, password) => {
        try {
            const { data } = await API.post('/auth/login', { email, password });
            // Store full user info including ban fields returned by backend
            const userData = data;
            if (userData && userData.role) userData.role = userData.role.toLowerCase();
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login Failed'
            };
        }
    };

    // For Google Login, we might receive token via URL query param
    const loginWithToken = (userData) => {
        if (userData && userData.role) userData.role = userData.role.toLowerCase();
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = async () => {
        try {
            // Call backend logout to clear cookie
            await API.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear all local session/storage data
            setUser(null);
            sessionStorage.removeItem('user');
            localStorage.removeItem('user');
            window.location.href = '/';
        }
    };

    const refreshUser = async () => {
        try {
            const { data } = await API.get('/auth/me');
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const userData = JSON.parse(storedUser);
                const updatedUser = { ...userData, ...data };
                if (updatedUser.role) updatedUser.role = updatedUser.role.toLowerCase();
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }
        } catch (error) {
            console.error('Failed to refresh user', error);
        }
    };

    const value = {
        user,
        loading,
        login,
        logout,
        loginWithToken,
        refreshUser
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
