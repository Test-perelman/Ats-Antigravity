'use client';

import AuthGuard from '../../components/auth-guard';

export default function ImmigrationLayout({ children }: { children: React.ReactNode }) {
    return <AuthGuard>{children}</AuthGuard>;
}
