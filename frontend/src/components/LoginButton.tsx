import React from 'react';
import { LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginButton: React.FC = () => {
    const { login, isAuthenticated, user, logout } = useAuth();

    if (isAuthenticated && user) {
        return (
            <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">Welcome, {user.name}</span>
                {user.picture && (
                    <img
                        src={user.picture}
                        alt={user.name}
                        className="w-8 h-8 rounded-full border border-gray-700"
                    />
                )}
                <button
                    onClick={logout}
                    className="text-sm text-red-400 hover:text-red-300 transition-colors"
                >
                    Logout
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={login}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all shadow-lg hover:shadow-blue-500/25 font-medium"
        >
            <LogIn size={18} />
            <span>Connect Google Account</span>
        </button>
    );
};
