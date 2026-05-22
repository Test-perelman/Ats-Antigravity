'use client';

import AuthGuard from '../../components/auth-guard';

export default function SeedLayout({ children }: { children: React.ReactNode }) {
    return <AuthGuard requiredRoles={['master_admin', 'admin']}>{children}</AuthGuard>;
}
