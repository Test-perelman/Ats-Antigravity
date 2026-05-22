import { NextRequest, NextResponse } from 'next/server';
import { requireTeamRole, requireUser } from '@/lib/server/auth';
import { ensureSchema, rawQuery } from '@/lib/server/postgres';

interface Params {
    params: Promise<{ id: string; requestId: string }>;
}

export async function POST(request: NextRequest, { params }: Params) {
    await ensureSchema();
    const user = await requireUser(request);
    const { id, requestId } = await params;
    requireTeamRole(user, id, ['admin', 'manager']);

    const accessRequest = await rawQuery(
        'SELECT * FROM ats_team_access_requests WHERE id = $1 AND team_id = $2 AND status = $3',
        [requestId, id, 'pending']
    );
    const row = accessRequest.rows[0];
    if (!row) return NextResponse.json({ message: 'Request not found' }, { status: 404 });

    await rawQuery(
        `
            INSERT INTO ats_team_memberships (user_id, team_id, role)
            VALUES ($1, $2, 'recruiter')
            ON CONFLICT (user_id, team_id) DO NOTHING
        `,
        [row.user_id, id]
    );
    await rawQuery('UPDATE ats_team_access_requests SET status = $1, updated_at = NOW() WHERE id = $2', ['approved', requestId]);

    return NextResponse.json({ ok: true });
}
