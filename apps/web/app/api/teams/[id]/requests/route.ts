import { NextRequest, NextResponse } from 'next/server';
import { requireTeamRole, requireUser } from '@/lib/server/auth';
import { ensureSchema, rawQuery } from '@/lib/server/postgres';

interface Params {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
    await ensureSchema();
    const user = await requireUser(request);
    const { id } = await params;
    requireTeamRole(user, id, ['admin', 'manager']);

    const result = await rawQuery(`
        SELECT r.*, u.first_name, u.last_name, u.email
        FROM ats_team_access_requests r
        INNER JOIN ats_users u ON u.id = r.user_id
        WHERE r.team_id = $1 AND r.status = 'pending'
        ORDER BY r.created_at ASC
    `, [id]);

    return NextResponse.json(result.rows.map((row) => ({
        id: row.id,
        teamId: row.team_id,
        userId: row.user_id,
        status: row.status,
        user: {
            id: row.user_id,
            firstName: row.first_name,
            lastName: row.last_name,
            email: row.email,
        },
    })));
}
