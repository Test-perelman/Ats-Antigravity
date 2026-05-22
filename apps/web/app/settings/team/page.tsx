'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TeamSettingsRedirectPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/settings');
    }, [router]);

    return (
        <div className="container p-6">
            <h1 className="title">Team Settings</h1>
        </div>
    );
}
