'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/AuthContext';

export default function AdminAccessRequestsPage() {
    const router = useRouter();
    const { userData, loading } = useAuth();

    useEffect(() => {
        if (loading) return;
        router.replace(userData?.teamId ? `/teams/${userData.teamId}/dashboard` : '/teams/join');
    }, [loading, router, userData?.teamId]);

    return (
        <div className="container p-6">
            <h1 className="title">Access Requests</h1>
        </div>
    );
}
