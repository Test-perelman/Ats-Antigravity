'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type AppRole = 'master_admin' | 'admin' | 'manager' | 'recruiter' | 'viewer' | 'user';

interface AuthUser {
    uid: string;
    id?: string;
    email: string | null;
    displayName?: string | null;
    photoURL?: string | null;
}

interface ApiUser {
    id: string;
    uid?: string;
    email: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
    systemRole?: AppRole;
    role?: AppRole;
    teamId?: string;
    memberships?: Array<{ teamId: string; role: AppRole }>;
    createdAt?: string;
}

export interface UserData {
    uid: string;
    email: string;
    firstName: string;
    lastName: string;
    role: AppRole;
    systemRole: AppRole;
    teamId: string;
    memberships: Array<{ teamId: string; role: AppRole }>;
    createdAt?: string;
}

interface AuthContextType {
    user: AuthUser | null;
    userData: UserData | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function authUrl() {
    return '/api/postgres/auth';
}

function clearStoredSession() {
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('authUser');
    window.localStorage.removeItem('teamId');
}

function normalizeRole(apiUser: ApiUser): AppRole {
    if (apiUser.systemRole === 'master_admin') return 'master_admin';
    return apiUser.role || apiUser.systemRole || 'recruiter';
}

function toAuthUser(apiUser: ApiUser): AuthUser {
    const uid = apiUser.uid || apiUser.id;
    return {
        uid,
        id: apiUser.id || uid,
        email: apiUser.email,
        displayName: apiUser.displayName || `${apiUser.firstName || ''} ${apiUser.lastName || ''}`.trim(),
    };
}

function toUserData(apiUser: ApiUser): UserData {
    const uid = apiUser.uid || apiUser.id;
    return {
        uid,
        email: apiUser.email,
        firstName: apiUser.firstName || '',
        lastName: apiUser.lastName || '',
        role: normalizeRole(apiUser),
        systemRole: apiUser.systemRole || 'user',
        teamId: apiUser.teamId || '',
        memberships: apiUser.memberships || [],
        createdAt: apiUser.createdAt,
    };
}

async function parseAuthResponse(response: Response) {
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.message || 'Authentication request failed');
    }
    return data as { access_token?: string; user: ApiUser };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    const persistSession = useCallback((token: string | undefined, apiUser: ApiUser) => {
        const nextUser = toAuthUser(apiUser);
        const nextUserData = toUserData(apiUser);

        if (token) window.localStorage.setItem('token', token);
        window.localStorage.setItem('authUser', JSON.stringify(nextUser));
        if (nextUserData.teamId) {
            window.localStorage.setItem('teamId', nextUserData.teamId);
        } else {
            window.localStorage.removeItem('teamId');
        }

        setUser(nextUser);
        setUserData(nextUserData);
    }, []);

    useEffect(() => {
        let active = true;

        async function restoreSession() {
            const token = window.localStorage.getItem('token');
            if (!token) {
                if (active) setLoading(false);
                return;
            }

            try {
                const response = await fetch(authUrl(), {
                    headers: { authorization: `Bearer ${token}` },
                });
                const data = await parseAuthResponse(response);
                if (active) persistSession(undefined, data.user);
            } catch (error) {
                console.error('Session restore failed:', error);
                clearStoredSession();
                if (active) {
                    setUser(null);
                    setUserData(null);
                }
            } finally {
                if (active) setLoading(false);
            }
        }

        restoreSession();
        return () => {
            active = false;
        };
    }, [persistSession]);

    const signIn = useCallback(async (email: string, password: string) => {
        const response = await fetch(authUrl(), {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ action: 'login', email, password }),
        });
        const data = await parseAuthResponse(response);
        persistSession(data.access_token, data.user);
    }, [persistSession]);

    const signUp = useCallback(async (email: string, password: string, firstName: string, lastName: string) => {
        const response = await fetch(authUrl(), {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ action: 'signup', email, password, firstName, lastName }),
        });
        const data = await parseAuthResponse(response);
        persistSession(data.access_token, data.user);
    }, [persistSession]);

    const signOut = useCallback(async () => {
        clearStoredSession();
        setUser(null);
        setUserData(null);
    }, []);

    const resetPassword = useCallback(async (_email: string) => {
        void _email;
        throw new Error('Password reset email is not configured for this Postgres auth setup.');
    }, []);

    const value = useMemo(() => ({
        user,
        userData,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
    }), [loading, resetPassword, signIn, signOut, signUp, user, userData]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
