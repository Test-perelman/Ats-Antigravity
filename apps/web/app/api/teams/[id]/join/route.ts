import { NextRequest, NextResponse } from 'next/server';
import { requireUser, randomId } from '@/lib/server/auth';
import { ensureSchema, rawQuery } from '@/lib/server/postgres';

interface Params {
    params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: Params) {
    await ensureSchema();
    const user = await requireUser(request);
    const { id } = await params;

    const team = await rawQuery(
        'SELECT 1 FROM ats_teams WHERE id = $1 AND status = $2 AND is_discoverable = TRUE',
        [id, 'active']
    );
    if (!team.rowCount) return NextResponse.json({ message: 'Team is not available for access requests' }, { status: 404 });

    const existing = await rawQuery(
        'SELECT 1 FROM ats_team_memberships WHERE user_id = $1 AND team_id = $2',
        [user.id, id]
    );
    if (existing.rowCount) return NextResponse.json({ message: 'Already a member' }, { status: 400 });

    const result = await rawQuery(
        `
            INSERT INTO ats_team_access_requests (id, user_id, team_id, status)
            VALUES ($1, $2, $3, 'pending')
            ON CONFLICT (user_id, team_id) DO UPDATE SET status = 'pending', updated_at = NOW()
            RETURNING *
        `,
        [randomId('req_'), user.id, id]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
}
