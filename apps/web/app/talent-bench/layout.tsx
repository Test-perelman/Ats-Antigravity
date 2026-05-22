'use client';

import AuthGuard from '../../components/auth-guard';

export default function TalentBenchLayout({ children }: { children: React.ReactNode }) {
    return <AuthGuard>{children}</AuthGuard>;
}
