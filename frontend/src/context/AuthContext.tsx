import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api/client';

interface User {
    _id: string;
    email: string;
    name: string;
    picture?: string;
    plan: 'free' | 'pro';
    scan_count: number;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (userData?: { name: string; email: string }) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check auth status on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Check localStorage for simple auth
                const storedUser = localStorage.getItem('mailguard_user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                    setIsLoading(false);
                    return;
                }

                // Fallback to backend auth check
                const response = await api.get('/auth/me');
                setUser(response.data);
            } catch (error) {
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        checkAuth();
    }, []);

    const login = (userData?: { name: string; email: string }) => {
        if (userData) {
            // Simple email-based login
            const user: User = {
                _id: `user_${Date.now()}`,
                email: userData.email,
                name: userData.name,
                plan: 'pro',
                scan_count: 0,
            };
            setUser(user);
            localStorage.setItem('mailguard_user', JSON.stringify(user));
        } else {
            // Redirect to Google Login (legacy)
            window.location.href = `${api.defaults.baseURL}/auth/login/google`;
        }
    };

    const logout = async () => {
        // Ideally call logout endpoint to clear cookie
        // await api.post('/auth/logout'); 
        // For now, just clear local state as we don't have logout endpoint yet
        setUser(null);
        // Force reload to clear any cached states
        window.location.reload();
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
