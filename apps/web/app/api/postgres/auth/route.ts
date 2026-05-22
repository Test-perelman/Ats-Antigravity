import { NextRequest, NextResponse } from 'next/server';
import { rawQuery, ensureSchema } from '@/lib/server/postgres';
import {
    getBearerToken,
    getSessionUser,
    hashPassword,
    randomId,
    signToken,
    verifyPassword,
    verifyToken,
} from '@/lib/server/auth';

function json(data: unknown, status = 200) {
    return NextResponse.json(data, { status });
}

export async function GET(request: NextRequest) {
    try {
        await ensureSchema();
        const user = await verifyToken(getBearerToken(request));
        if (!user) return json({ message: 'Unauthorized' }, 401);
        return json({ user });
    } catch (error) {
        return json({ message: error instanceof Error ? error.message : 'Authentication service failed' }, 500);
    }
}

export async function POST(request: NextRequest) {
    try {
        await ensureSchema();
        const body = await request.json().catch(() => ({}));

        if (body.action === 'signup') {
        const email = String(body.email || '').trim().toLowerCase();
        const password = String(body.password || '');
        const firstName = String(body.firstName || '').trim();
        const lastName = String(body.lastName || '').trim();

        if (!email || !password) return json({ message: 'Email and password are required' }, 400);

        const existing = await rawQuery('SELECT id FROM ats_users WHERE email = $1', [email]);
        if (existing.rowCount) return json({ code: 'auth/email-already-in-use', message: 'Email already in use' }, 409);

        const id = randomId('usr_');
        await rawQuery(
            `
                INSERT INTO ats_users (id, email, password_hash, first_name, last_name, system_role)
                VALUES ($1, $2, $3, $4, $5, 'user')
            `,
            [id, email, hashPassword(password), firstName, lastName]
        );

        const teamId = randomId('team_');
        await rawQuery(
            `
                INSERT INTO ats_teams (id, name, is_discoverable, created_by)
                VALUES ($1, $2, TRUE, $3)
            `,
            [teamId, `${firstName || 'User'}'s Team`, id]
        );
        await rawQuery(
            `
                INSERT INTO ats_team_memberships (user_id, team_id, role)
                VALUES ($1, $2, 'admin')
            `,
            [id, teamId]
        );
        await rawQuery(
            `
                INSERT INTO ats_team_settings (team_id, data)
                VALUES ($1, '{}'::jsonb)
            `,
            [teamId]
        );

        const user = await getSessionUser(id);
        if (!user) return json({ message: 'User could not be created' }, 500);

            return json({ access_token: signToken(user), user });
        }

        if (body.action === 'login') {
        const email = String(body.email || '').trim().toLowerCase();
        const password = String(body.password || '');

        const result = await rawQuery<{
            id: string;
            password_hash: string | null;
        }>('SELECT id, password_hash FROM ats_users WHERE email = $1', [email]);

        const row = result.rows[0];
        if (!row || !verifyPassword(password, row.password_hash)) {
            return json({ message: 'Invalid email or password' }, 401);
        }

        const user = await getSessionUser(row.id);
        if (!user) return json({ message: 'Invalid email or password' }, 401);

            return json({ access_token: signToken(user), user });
        }

        return json({ message: 'Unsupported auth action' }, 400);
    } catch (error) {
        return json({ message: error instanceof Error ? error.message : 'Authentication service failed' }, 500);
    }
}
