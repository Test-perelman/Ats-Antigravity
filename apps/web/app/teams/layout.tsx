'use client';

import AuthGuard from '../../components/auth-guard';

export default function TeamsLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard>
            <main className="min-h-[calc(100vh-64px)] bg-secondary/10">
                {children}
            </main>
        </AuthGuard>
    );
}
