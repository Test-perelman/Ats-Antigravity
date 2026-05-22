'use client';

import AuthGuard from '../../components/auth-guard';

export default function VendorsLayout({ children }: { children: React.ReactNode }) {
    return <AuthGuard>{children}</AuthGuard>;
}
