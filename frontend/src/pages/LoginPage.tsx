/**
 * LoginPage - Modern Authentication Interface
 * Premium design with gradient backgrounds and smooth animations
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, User, ArrowRight, Shield, Zap, Lock } from 'lucide-react';

interface LoginPageProps {
    onLogin: (user: { name: string; email: string }) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && email) {
            setIsLoading(true);
            // Simulate login delay
            setTimeout(() => {
                onLogin({ name, email });
            }, 800);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">

            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                    }}
                    transition={{ duration: 20, repeat: Infinity }}
                    className="absolute -top-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        rotate: [90, 0, 90],
                    }}
                    transition={{ duration: 15, repeat: Infinity }}
                    className="absolute -bottom-40 -right-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl"
                />
            </div>

            {/* Login Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 w-full max-w-md"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-2xl shadow-blue-500/50"
                    >
                        <Shield className="w-10 h-10 text-white" />
                    </motion.div>
                    <h1 className="text-4xl font-bold text-white mb-2">
                        Welcome to <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">MailGuard</span>
                    </h1>
                    <p className="text-gray-400 text-lg">AI-Powered Email Threat Protection</p>
                </div>

                {/* Login Form Card */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Name Input */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your name"
                                    required
                                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Email Input */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/50 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Continue to Dashboard
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </motion.button>
                    </form>

                    {/* Features */}
                    <div className="mt-8 pt-6 border-t border-white/10">
                        <p className="text-sm text-gray-400 mb-4 text-center">Why MailGuard?</p>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                                    <Zap className="w-6 h-6 text-blue-400" />
                                </div>
                                <p className="text-xs text-gray-400">Real-time Analysis</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                                    <Shield className="w-6 h-6 text-indigo-400" />
                                </div>
                                <p className="text-xs text-gray-400">AI Protection</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                                    <Lock className="w-6 h-6 text-purple-400" />
                                </div>
                                <p className="text-xs text-gray-400">Enterprise Security</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Footer */}
                <p className="text-center text-gray-500 text-sm mt-6">
                    By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
            </motion.div>
        </div>
    );
};
