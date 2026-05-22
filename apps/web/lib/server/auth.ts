import crypto from 'node:crypto';
import { rawQuery } from './postgres';

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;
const HASH_ITERATIONS = 120000;
const KEY_LENGTH = 32;

export interface Membership {
    teamId: string;
    role: string;
}

export interface SessionUser {
    id: string;
    uid: string;
    email: string;
    firstName: string;
    lastName: string;
    systemRole: string;
    role?: string;
    teamId?: string;
    memberships: Membership[];
    displayName?: string;
}

type TeamRole = 'master_admin' | 'admin' | 'manager' | 'recruiter' | 'viewer' | 'user';

export function randomId(prefix = '') {
    return `${prefix}${crypto.randomUUID()}`;
}

function tokenSecret() {
    return process.env.AUTH_SECRET || process.env.JWT_SECRET || 'dev_secret_key_123';
}

function base64Url(input: Buffer | string) {
    return Buffer.from(input).toString('base64url');
}

export function hashPassword(password: string) {
    const salt = crypto.randomBytes(16).toString('base64url');
    const hash = crypto
        .pbkdf2Sync(password, salt, HASH_ITERATIONS, KEY_LENGTH, 'sha256')
        .toString('base64url');
    return `pbkdf2$${HASH_ITERATIONS}$${salt}$${hash}`;
}

export function verifyPassword(password: string, storedHash?: string | null) {
    if (!storedHash) return false;
    const [scheme, iterations, salt, hash] = storedHash.split('$');
    if (scheme !== 'pbkdf2' || !iterations || !salt || !hash) return false;

    const computed = crypto
        .pbkdf2Sync(password, salt, Number(iterations), KEY_LENGTH, 'sha256')
        .toString('base64url');

    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(computed));
}

export function signToken(user: SessionUser) {
    const header = base64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = base64Url(JSON.stringify({
        sub: user.id,
        email: user.email,
        exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
    }));
    const signature = crypto
        .createHmac('sha256', tokenSecret())
        .update(`${header}.${payload}`)
        .digest('base64url');

    return `${header}.${payload}.${signature}`;
}

export async function verifyToken(token?: string | null) {
    if (!token) return null;

    const [header, payload, signature] = token.split('.');
    if (!header || !payload || !signature) return null;

    const expected = crypto
        .createHmac('sha256', tokenSecret())
        .update(`${header}.${payload}`)
        .digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;

    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (!decoded.exp || decoded.exp < Math.floor(Date.now() / 1000)) return null;

    return getSessionUser(decoded.sub);
}

export function getBearerToken(request: Request) {
    const authorization = request.headers.get('authorization') || '';
    return authorization.toLowerCase().startsWith('bearer ')
        ? authorization.slice(7)
        : null;
}

export async function getSessionUser(userId: string): Promise<SessionUser | null> {
    const result = await rawQuery<{
        id: string;
        email: string;
        first_name: string;
        last_name: string;
        system_role: string;
        memberships: Membership[] | null;
    }>(`
        SELECT
            u.id,
            u.email,
            u.first_name,
            u.last_name,
            u.system_role,
            COALESCE(
                json_agg(
                    json_build_object('teamId', m.team_id, 'role', m.role)
                    ORDER BY m.created_at ASC
                ) FILTER (WHERE m.team_id IS NOT NULL),
                '[]'
            ) AS memberships
        FROM ats_users u
        LEFT JOIN ats_team_memberships m ON m.user_id = u.id
        WHERE u.id = $1
        GROUP BY u.id
    `, [userId]);

    const row = result.rows[0];
    if (!row) return null;

    const memberships = row.memberships || [];
    const primaryMembership = memberships[0];

    return {
        id: row.id,
        uid: row.id,
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        displayName: `${row.first_name} ${row.last_name}`.trim(),
        systemRole: row.system_role,
        role: primaryMembership?.role || row.system_role,
        teamId: primaryMembership?.teamId,
        memberships,
    };
}

export async function requireUser(request: Request) {
    const user = await verifyToken(getBearerToken(request));
    if (!user) {
        throw new Response(JSON.stringify({ message: 'Unauthorized' }), {
            status: 401,
            headers: { 'content-type': 'application/json' },
        });
    }
    return user;
}

function forbidden(message = 'Forbidden') {
    throw new Response(JSON.stringify({ message }), {
        status: 403,
        headers: { 'content-type': 'application/json' },
    });
}

export function hasSystemRole(user: SessionUser, roles: TeamRole[]) {
    return roles.includes(user.systemRole as TeamRole);
}

export function hasTeamRole(user: SessionUser, teamId: string, roles: TeamRole[]) {
    if (user.systemRole === 'master_admin') return true;
    return user.memberships.some(
        (membership) => membership.teamId === teamId && roles.includes(membership.role as TeamRole)
    );
}

export function requireSystemRole(user: SessionUser, roles: TeamRole[]) {
    if (!hasSystemRole(user, roles)) {
        forbidden('You do not have permission to access this area');
    }
}

export function requireTeamRole(user: SessionUser, teamId: string, roles: TeamRole[]) {
    if (!hasTeamRole(user, teamId, roles)) {
        forbidden('You do not have permission to manage this team');
    }
}
