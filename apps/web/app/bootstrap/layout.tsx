'use client';

import AuthGuard from '../../components/auth-guard';

export default function BootstrapLayout({ children }: { children: React.ReactNode }) {
    return <AuthGuard requiredRoles={['master_admin']}>{children}</AuthGuard>;
}
