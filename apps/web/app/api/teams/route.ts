import { NextRequest, NextResponse } from 'next/server';
import { requireSystemRole, requireUser, randomId } from '@/lib/server/auth';
import { ensureSchema, rawQuery } from '@/lib/server/postgres';

function json(data: unknown, status = 200) {
    return NextResponse.json(data, { status });
}

interface TeamRow {
    id: string;
    name: string;
    industry: string | null;
    description: string | null;
    is_discoverable: boolean;
    status: string;
    created_by: string | null;
    created_at: Date;
}

function mapTeam(row: TeamRow) {
    return {
        id: row.id,
        name: row.name,
        industry: row.industry,
        description: row.description,
        isDiscoverable: row.is_discoverable,
        status: row.status,
        createdBy: row.created_by,
        createdAt: row.created_at,
    };
}

export async function GET(request: NextRequest) {
    await ensureSchema();
    await requireUser(request);

    const result = await rawQuery<TeamRow>(`
        SELECT *
        FROM ats_teams
        WHERE status = 'active' AND is_discoverable = TRUE
        ORDER BY created_at DESC
    `);

    return json(result.rows.map(mapTeam));
}

export async function POST(request: NextRequest) {
    await ensureSchema();
    const user = await requireUser(request);
    requireSystemRole(user, ['master_admin']);
    const body = await request.json().catch(() => ({}));
    const id = randomId('team_');

    const result = await rawQuery<TeamRow>(
        `
            INSERT INTO ats_teams (id, name, industry, description, is_discoverable, created_by)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `,
        [
            id,
            body.name || 'Untitled Team',
            body.industry || null,
            body.description || null,
            body.isDiscoverable ?? true,
            user.id,
        ]
    );

    await rawQuery(
        `
            INSERT INTO ats_team_memberships (user_id, team_id, role)
            VALUES ($1, $2, 'admin')
            ON CONFLICT (user_id, team_id) DO UPDATE SET role = 'admin'
        `,
        [user.id, id]
    );

    await rawQuery(
        `
            INSERT INTO ats_team_settings (team_id, data)
            VALUES ($1, '{}'::jsonb)
            ON CONFLICT (team_id) DO NOTHING
        `,
        [id]
    );

    return json(mapTeam(result.rows[0]), 201);
}
