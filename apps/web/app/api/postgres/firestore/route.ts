import { NextRequest, NextResponse } from 'next/server';
import { ensureSchema } from '@/lib/server/postgres';
import { requireUser } from '@/lib/server/auth';
import { deletePath, getPath, listPath, setPath, updatePath } from '@/lib/server/firestore-store';

function json(data: unknown, status = 200) {
    return NextResponse.json(data, { status });
}

function isThrownResponse(error: unknown): error is Response {
    return error instanceof Response;
}

export async function POST(request: NextRequest) {
    try {
        await ensureSchema();
        const user = await requireUser(request);
        const body = await request.json().catch(() => ({}));
        const path = Array.isArray(body.path) ? body.path.map(String) : [];

        if (!path.length) return json({ message: 'Path is required' }, 400);

        if (body.action === 'list') {
            const items = await listPath(user, path, body.constraints || []);
            return json({ items });
        }

        if (body.action === 'get') {
            const item = await getPath(user, path);
            return json({ item });
        }

        if (body.action === 'set' || body.action === 'create') {
            const item = await setPath(user, path, body.data || {}, body.id);
            return json({ item });
        }

        if (body.action === 'update') {
            const item = await updatePath(user, path, body.data || {});
            return json({ item });
        }

        if (body.action === 'delete') {
            await deletePath(user, path);
            return json({ ok: true });
        }

        return json({ message: 'Unsupported data action' }, 400);
    } catch (error) {
        if (isThrownResponse(error)) return error;
        console.error('[postgres/firestore]', error);
        return json({ message: error instanceof Error ? error.message : 'Database request failed' }, 500);
    }
}
