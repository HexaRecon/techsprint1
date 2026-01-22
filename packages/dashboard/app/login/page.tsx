'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Github } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Temporarily keeping mock login but styling it as real
    // In next step, we swap this for window.location.href = API_URL + '/auth/github'
    const handleLogin = () => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        window.location.href = `${API_URL}/auth/github`;
    };

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#111] border border-white/10 rounded-2xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
                    <p className="text-gray-400">Sign in to manage your deployments</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-md text-sm">
                        {error}
                    </div>
                )}

                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full bg-white text-black hover:bg-gray-100 font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                    <Github className="w-5 h-5" />
                    <span>{loading ? 'Connecting...' : 'Continue with GitHub'}</span>
                </button>

                <p className="mt-6 text-center text-xs text-gray-500">
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    );
}
