export interface User {
    uid: string;
    id?: string;
    email: string | null;
    displayName?: string | null;
    photoURL?: string | null;
}

type AuthListener = (user: User | null) => void;
type ApiUser = {
    uid?: string;
    id?: string;
    email: string;
    displayName?: string;
    firstName?: string;
    lastName?: string;
    teamId?: string;
};

const listeners = new Set<AuthListener>();

function authUrl() {
    return '/api/postgres/auth';
}

function currentUserFromStorage(): User | null {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem('authUser');
    if (!raw) return null;
    try {
        return JSON.parse(raw) as User;
    } catch {
        return null;
    }
}

function persistSession(token: string, user: ApiUser) {
    const uid = user.uid || user.id || '';
    const authUser: User = {
        uid,
        id: user.id || uid,
        email: user.email,
        displayName: user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    };

    if (typeof window === 'undefined') return authUser;

    window.localStorage.setItem('token', token);
    window.localStorage.setItem('authUser', JSON.stringify(authUser));
    if (user.teamId) window.localStorage.setItem('teamId', user.teamId);

    listeners.forEach((listener) => listener(authUser));
    return authUser;
}

function clearSession() {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('authUser');
    window.localStorage.removeItem('teamId');
    listeners.forEach((listener) => listener(null));
}

async function postAuth(action: string, payload: Record<string, unknown>) {
    const response = await fetch(authUrl(), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action, ...payload }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        const error = new Error(data.message || 'Authentication request failed') as Error & { code?: string };
        error.code = data.code;
        throw error;
    }
    return data;
}

export function getAuth(_app?: unknown) {
    void _app;
    return {};
}

export function onAuthStateChanged(_auth: unknown, callback: AuthListener) {
    listeners.add(callback);
    callback(currentUserFromStorage());
    return () => {
        listeners.delete(callback);
    };
}

export async function signInWithEmailAndPassword(_auth: unknown, email: string, password: string) {
    const data = await postAuth('login', { email, password });
    return { user: persistSession(data.access_token, data.user) };
}

export async function createUserWithEmailAndPassword(_auth: unknown, email: string, password: string) {
    const [firstName = '', lastName = ''] = email.split('@')[0].split(/[._-]/);
    const data = await postAuth('signup', { email, password, firstName, lastName });
    return { user: persistSession(data.access_token, data.user) };
}

export async function signOut(_auth?: unknown) {
    void _auth;
    clearSession();
}

export async function sendPasswordResetEmail(_auth?: unknown, _email?: string) {
    void _auth;
    void _email;
    return Promise.resolve();
}
