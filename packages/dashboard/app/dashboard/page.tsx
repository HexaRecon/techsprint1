'use client';

import { useEffect, useState } from 'react';
import { ProjectList } from '@/components/project-list';
import { logout } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const stored = localStorage.getItem('token');
        if (!stored) {
            router.push('/login');
            return;
        }
        setToken(stored);
        setLoading(false);
    }, [router]);

    if (loading) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b">
                <div className="container px-4 mx-auto h-16 flex items-center justify-between">
                    <div className="font-bold text-xl text-blue-600">GenesisAI Platform</div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">Welcome</span>
                        <button
                            onClick={logout}
                            className="text-sm text-gray-600 hover:text-red-600"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>
            <main className="container mx-auto">
                <ProjectList />
            </main>
        </div>
    );
}
