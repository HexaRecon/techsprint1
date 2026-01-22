'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthCallback() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        const userStr = searchParams.get('user');

        if (token && userStr) {
            localStorage.setItem('token', token);
            localStorage.setItem('user', userStr);
            router.push('/dashboard');
        } else {
            router.push('/login?error=auth_failed');
        }
    }, [searchParams, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white">
            <div className="animate-pulse flex flex-col items-center">
                <div className="w-8 h-8 border-t-2 border-blue-500 rounded-full animate-spin mb-4"></div>
                <p>Authenticating...</p>
            </div>
        </div>
    );
}
