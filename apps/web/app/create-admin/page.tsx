'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function CreateAdminPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
                <h1 className="text-2xl font-bold mb-4 text-center text-gray-900">Account Setup</h1>
                <p className="text-sm text-gray-600 mb-6 text-center">
                    Public admin bootstrap has been disabled.
                </p>
                <Button onClick={() => router.push('/signup')} className="w-full h-12">
                    Go to Sign Up
                </Button>
            </div>
        </div>
    );
}
