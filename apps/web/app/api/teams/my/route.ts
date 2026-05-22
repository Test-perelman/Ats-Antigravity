import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/server/auth';
import { ensureSchema, rawQuery } from '@/lib/server/postgres';

export async function GET(request: NextRequest) {
    await ensureSchema();
    const user = await requireUser(request);

    const result = await rawQuery(`
        SELECT t.*, m.role
        FROM ats_teams t
        INNER JOIN ats_team_memberships m ON m.team_id = t.id
        WHERE m.user_id = $1
        ORDER BY t.created_at DESC
    `, [user.id]);

    return NextResponse.json(result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        industry: row.industry,
        description: row.description,
        role: row.role,
        isDiscoverable: row.is_discoverable,
        status: row.status,
    })));
}
