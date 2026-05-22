import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/server/auth';
import { ensureSchema, rawQuery } from '@/lib/server/postgres';

interface Params {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
    await ensureSchema();
    await requireUser(request);
    const { id } = await params;

    const result = await rawQuery('SELECT * FROM ats_teams WHERE id = $1', [id]);
    const row = result.rows[0];
    if (!row) return NextResponse.json({ message: 'Team not found' }, { status: 404 });

    return NextResponse.json({
        id: row.id,
        name: row.name,
        industry: row.industry,
        description: row.description,
        isDiscoverable: row.is_discoverable,
        status: row.status,
        createdBy: row.created_by,
        createdAt: row.created_at,
    });
}
