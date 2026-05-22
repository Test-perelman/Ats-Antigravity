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

    await rawQuery('UPDATE ats_team_access_requests SET status = $1, updated_at = NOW() WHERE id = $2 AND team_id = $3', ['rejected', requestId, id]);
    return NextResponse.json({ ok: true });
}
