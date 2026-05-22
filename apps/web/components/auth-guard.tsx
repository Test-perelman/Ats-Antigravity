'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/firebase/AuthContext';

type AppRole = 'master_admin' | 'admin' | 'manager' | 'recruiter' | 'viewer' | 'user';

export default function AuthGuard({
    children,
    requiredRoles,
}: {
    children: React.ReactNode;
    requiredRoles?: AppRole[];
}) {
    const router = useRouter();
    const { user, userData, loading } = useAuth();
    const isAuthorized = !requiredRoles?.length || (userData?.role && requiredRoles.includes(userData.role));

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }

        if (!loading && user && !isAuthorized) {
            router.replace('/dashboard');
        }
    }, [user, loading, router, isAuthorized]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user || !isAuthorized) {
        return null;
    }

    return <>{children}</>;
}
