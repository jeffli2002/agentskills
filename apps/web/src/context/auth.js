import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser, logout as apiLogout, API_BASE } from '@/lib/api';
// Mock user for development testing (matches API test mode)
const MOCK_USER = {
    id: 'test-123',
    email: 'test@example.com',
    name: 'Test User',
    avatarUrl: 'https://example.com/pic.jpg',
    createdAt: Date.now(),
    updatedAt: Date.now(),
};
// Set to true to use mock user in development (disabled by default to avoid data issues)
const USE_MOCK_AUTH = false;
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const refresh = async () => {
        // Use mock user in development
        if (USE_MOCK_AUTH) {
            setUser(MOCK_USER);
            setLoading(false);
            return;
        }
        try {
            const user = await getCurrentUser();
            setUser(user);
        }
        catch {
            setUser(null);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        refresh();
    }, []);
    const login = () => {
        if (USE_MOCK_AUTH) {
            setUser(MOCK_USER);
            return;
        }
        window.location.href = `${API_BASE}/auth/google`;
    };
    const logout = async () => {
        if (USE_MOCK_AUTH) {
            setUser(null);
            return;
        }
        await apiLogout();
        setUser(null);
    };
    return (_jsx(AuthContext.Provider, { value: { user, loading, login, logout, refresh }, children: children }));
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
