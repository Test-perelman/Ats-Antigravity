import { rawQuery } from './postgres';
import { randomId, requireSystemRole, type SessionUser } from './auth';

interface Constraint {
    type: 'where' | 'orderBy' | 'limit';
    field?: string;
    op?: string;
    value?: unknown;
    direction?: 'asc' | 'desc';
    count?: number;
}

type AnyRecord = Record<string, unknown>;
type RecordRow = { id: string; data: AnyRecord; created_at?: Date; updated_at?: Date };

function normalizeDate(value: unknown): unknown {
    if (value instanceof Date) return value.toISOString();
    if (Array.isArray(value)) return value.map(normalizeDate);
    if (value && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value as AnyRecord).map(([key, nested]) => [key, normalizeDate(nested)])
        );
    }
    return value;
}

function lastCollectionSegment(collection: string) {
    return collection.split('/').pop() || collection;
}

function stringValue(value: unknown) {
    return typeof value === 'string' ? value.trim() : '';
}

function normalizeAtsRecord(collection: string, data: AnyRecord) {
    const type = lastCollectionSegment(collection);
    const normalized = { ...data };

    if (type === 'jobs') {
        if (normalized.maxRate == null && normalized.billRateMax != null) normalized.maxRate = normalized.billRateMax;
        if (normalized.billRateMax == null && normalized.maxRate != null) normalized.billRateMax = normalized.maxRate;
    }

    if (type === 'vendors') {
        if (!normalized.contactPerson && normalized.contactName) normalized.contactPerson = normalized.contactName;
        if (!normalized.contactName && normalized.contactPerson) normalized.contactName = normalized.contactPerson;
        if (!normalized.email && normalized.contactEmail) normalized.email = normalized.contactEmail;
        if (!normalized.contactEmail && normalized.email) normalized.contactEmail = normalized.email;
        if (!normalized.address && normalized.streetAddress) normalized.address = normalized.streetAddress;
        if (!normalized.streetAddress && normalized.address) normalized.streetAddress = normalized.address;
    }

    if (type === 'clients') {
        if (!normalized.location && normalized.address) normalized.location = normalized.address;
        if (!normalized.address && normalized.location) normalized.address = normalized.location;
        if (!normalized.description && normalized.notes) normalized.description = normalized.notes;
    }

    if (type === 'projects') {
        if (normalized.value == null && normalized.budget != null) normalized.value = normalized.budget;
        if (normalized.budget == null && normalized.value != null) normalized.budget = normalized.value;
    }

    if (type === 'immigration') {
        if (!normalized.description && normalized.notes) normalized.description = normalized.notes;
        if (!normalized.notes && normalized.description) normalized.notes = normalized.description;
    }

    if (type === 'notes') {
        if (!normalized.text && normalized.content) normalized.text = normalized.content;
        if (!normalized.content && normalized.text) normalized.content = normalized.text;
        if (!normalized.userName && normalized.authorName) normalized.userName = normalized.authorName;
        if (!normalized.authorName && normalized.userName) normalized.authorName = normalized.userName;
        if (!normalized.createdAt && normalized.createAt) normalized.createdAt = normalized.createAt;
    }

    if (type === 'submissions') {
        if (!normalized.submittedAt && normalized.createdAt) normalized.submittedAt = normalized.createdAt;
        if (!normalized.createdAt && normalized.submittedAt) normalized.createdAt = normalized.submittedAt;
    }

    if (type === 'interviews') {
        if (!normalized.interviewType && normalized.mode) normalized.interviewType = normalized.mode;
        if (!normalized.mode && normalized.interviewType) normalized.mode = normalized.interviewType;
        if (!normalized.meetingLink && normalized.location) normalized.meetingLink = normalized.location;
    }

    if (type === 'candidates') {
        const firstName = stringValue(normalized.firstName);
        const lastName = stringValue(normalized.lastName);
        if (!normalized.fullName && (firstName || lastName)) {
            normalized.fullName = `${firstName} ${lastName}`.trim();
        }
    }

    return normalized;
}

function rowToRecord(row: { id: string; data: AnyRecord; created_at?: Date; updated_at?: Date }, collection: string): AnyRecord & { id: string } {
    const data = normalizeAtsRecord(collection, row.data || {});
    return {
        id: row.id,
        ...data,
        createdAt: data.createdAt || row.created_at?.toISOString(),
        updatedAt: data.updatedAt || row.updated_at?.toISOString(),
    };
}

function getValue(item: AnyRecord, field?: string) {
    if (!field) return undefined;
    return field.split('.').reduce<unknown>((current, key) => {
        if (!current || typeof current !== 'object') return undefined;
        return (current as AnyRecord)[key];
    }, item);
}

function applyConstraints<T extends AnyRecord>(items: T[], constraints: Constraint[] = []) {
    let output = [...items];

    for (const constraint of constraints) {
        if (constraint.type === 'where') {
            output = output.filter((item) => {
                const actual = getValue(item, constraint.field);
                if (constraint.op === '==') return actual === constraint.value;
                if (constraint.op === '!=') return actual !== constraint.value;
                if (constraint.op === 'in' && Array.isArray(constraint.value)) {
                    return constraint.value.includes(actual);
                }
                return actual === constraint.value;
            });
        }

        if (constraint.type === 'orderBy') {
            const direction = constraint.direction === 'asc' ? 1 : -1;
            output.sort((a, b) => {
                const av = getValue(a, constraint.field);
                const bv = getValue(b, constraint.field);
                if (av == null && bv == null) return 0;
                if (av == null) return 1;
                if (bv == null) return -1;
                return String(av).localeCompare(String(bv)) * direction;
            });
        }

        if (constraint.type === 'limit' && constraint.count) {
            output = output.slice(0, constraint.count);
        }
    }

    return output;
}

function pathKind(path: string[]) {
    if (path[0] === 'users') return 'users';
    if (path[0] === 'teams' && path.length <= 2) return 'teams';
    if (path[0] === 'teams' && path.length >= 3) return 'records';
    return 'records';
}

function teamIdFromPath(path: string[]) {
    return path[0] === 'teams' ? path[1] : undefined;
}

function collectionFromPath(path: string[]) {
    if (path[0] === 'teams' && path.length >= 3) return path[2];
    return path[0];
}

function idFromPath(path: string[]) {
    if (path[0] === 'teams' && path.length >= 4) return path[3];
    if (path.length >= 2) return path[path.length - 1];
    return undefined;
}

function recordCollectionFromPath(path: string[]) {
    if (path[0] !== 'teams') return collectionFromPath(path);
    const rest = path.slice(2);
    const collectionSegments = rest.length % 2 === 0 ? rest.slice(0, -1) : rest;
    return collectionSegments.join('/');
}

function recordIdFromPath(path: string[]) {
    if (path[0] !== 'teams') return idFromPath(path);
    const rest = path.slice(2);
    return rest.length % 2 === 0 ? rest[rest.length - 1] : undefined;
}

function recordDocPath(path: string[], id: string) {
    if (path[0] !== 'teams') return path.length >= 2 ? [...path.slice(0, -1), id] : [...path, id];
    const rest = path.slice(2);
    return rest.length % 2 === 0 ? [...path.slice(0, -1), id] : [...path, id];
}

function assertTeamAccess(user: SessionUser, teamId?: string) {
    if (!teamId) return;
    if (user.systemRole === 'master_admin') return;
    if (!user.memberships.some((membership) => membership.teamId === teamId)) {
        throw new Response(JSON.stringify({ message: 'You do not have access to this team' }), {
            status: 403,
            headers: { 'content-type': 'application/json' },
        });
    }
}

function mapUserRow(row: AnyRecord) {
    return {
        id: row.id,
        uid: row.id,
        email: row.email,
        firstName: row.first_name || '',
        lastName: row.last_name || '',
        role: row.role || row.system_role || 'recruiter',
        systemRole: row.system_role || 'user',
        teamId: row.team_id,
        createdAt: row.created_at,
    };
}

export async function listPath(user: SessionUser, path: string[], constraints: Constraint[] = []) {
    const kind = pathKind(path);

    if (kind === 'users') {
        if (user.systemRole === 'master_admin') {
            const result = await rawQuery(`
            SELECT u.*, m.team_id, m.role
            FROM ats_users u
            LEFT JOIN ats_team_memberships m ON m.user_id = u.id
        `);
            return applyConstraints(result.rows.map(mapUserRow), constraints);
        }

        const adminTeamIds = user.memberships
            .filter((membership) => ['admin', 'manager'].includes(membership.role))
            .map((membership) => membership.teamId);

        if (adminTeamIds.length > 0) {
            const result = await rawQuery(`
                SELECT u.*, m.team_id, m.role
                FROM ats_users u
                INNER JOIN ats_team_memberships m ON m.user_id = u.id
                WHERE m.team_id = ANY($1::text[])
            `, [adminTeamIds]);
            return applyConstraints(result.rows.map(mapUserRow), constraints);
        }

        const result = await rawQuery(`
            SELECT u.*, m.team_id, m.role
            FROM ats_users u
            LEFT JOIN ats_team_memberships m ON m.user_id = u.id
            WHERE u.id = $1
        `, [user.id]);
        return applyConstraints(result.rows.map(mapUserRow), constraints);
    }

    if (kind === 'teams') {
        const result = await rawQuery(`
            SELECT *
            FROM ats_teams
            WHERE status = 'active'
            ORDER BY created_at DESC
        `);

        const teams = result.rows.map((row) => ({
            id: row.id,
            name: row.name,
            industry: row.industry,
            description: row.description,
            isDiscoverable: row.is_discoverable,
            status: row.status,
            createdBy: row.created_by,
            createdAt: row.created_at,
        }));

        return applyConstraints(teams, constraints);
    }

    const teamId = teamIdFromPath(path);
    assertTeamAccess(user, teamId);
    const collection = recordCollectionFromPath(path);

    const result = await rawQuery<RecordRow>(
        `
            SELECT id, data, created_at, updated_at
            FROM ats_records
            WHERE team_id = $1 AND collection = $2
            ORDER BY updated_at DESC
        `,
        [teamId, collection]
    );

    const items = result.rows.map((row) => rowToRecord(row, collection));

    if (collection === 'jobs') {
        const counts = await rawQuery<{ job_id: string; count: string }>(
            `
                SELECT data->>'jobId' AS job_id, COUNT(*)::text AS count
                FROM ats_records
                WHERE team_id = $1 AND collection = 'submissions'
                GROUP BY data->>'jobId'
            `,
            [teamId]
        );
        const countByJob = new Map(counts.rows.map((row) => [row.job_id, Number(row.count)]));
        return applyConstraints(items.map((item) => ({
            ...item,
            submissionCount: countByJob.get(item.id as string) || 0,
            _count: {
                ...((item._count as AnyRecord | undefined) || {}),
                submissions: countByJob.get(item.id as string) || 0,
            },
        })), constraints);
    }

    return applyConstraints(items, constraints);
}

export async function getPath(user: SessionUser, path: string[]) {
    const kind = pathKind(path);
    const id = idFromPath(path);
    if (!id) return null;

    if (kind === 'users') {
        const result = await rawQuery(`
            SELECT u.*, m.team_id, m.role
            FROM ats_users u
            LEFT JOIN ats_team_memberships m ON m.user_id = u.id
            WHERE u.id = $1
            ORDER BY m.created_at ASC
            LIMIT 1
        `, [id]);
        if (result.rows[0] && user.systemRole !== 'master_admin' && id !== user.id) {
            const canManageUser = user.memberships.some(
                (membership) => ['admin', 'manager'].includes(membership.role) && membership.teamId === result.rows[0].team_id
            );
            if (!canManageUser) {
                throw new Response(JSON.stringify({ message: 'You do not have permission to view this user' }), {
                    status: 403,
                    headers: { 'content-type': 'application/json' },
                });
            }
        }
        return result.rows[0] ? mapUserRow(result.rows[0]) : null;
    }

    if (kind === 'teams') {
        const result = await rawQuery('SELECT * FROM ats_teams WHERE id = $1', [id]);
        const row = result.rows[0];
        if (!row) return null;
        assertTeamAccess(user, row.id);
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

    const teamId = teamIdFromPath(path);
    assertTeamAccess(user, teamId);
    const collection = recordCollectionFromPath(path);
    const recordId = recordIdFromPath(path);
    if (!recordId) return null;

    const result = await rawQuery<RecordRow>(
        `
            SELECT id, data, created_at, updated_at
            FROM ats_records
            WHERE team_id = $1 AND collection = $2 AND id = $3
        `,
        [teamId, collection, recordId]
    );

    return result.rows[0] ? rowToRecord(result.rows[0], collection) : null;
}

export async function setPath(user: SessionUser, path: string[], data: AnyRecord, providedId?: string) {
    const kind = pathKind(path);
    const collection = kind === 'records' ? recordCollectionFromPath(path) : collectionFromPath(path);
    const normalized = normalizeAtsRecord(collection, normalizeDate(data) as AnyRecord);
    const id = providedId || (kind === 'records' ? recordIdFromPath(path) : idFromPath(path)) || randomId();

    if (kind === 'users') {
        requireSystemRole(user, ['master_admin']);
        await rawQuery(
            `
                INSERT INTO ats_users (id, email, first_name, last_name, system_role)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT (id) DO UPDATE SET
                    email = EXCLUDED.email,
                    first_name = EXCLUDED.first_name,
                    last_name = EXCLUDED.last_name,
                    system_role = EXCLUDED.system_role,
                    updated_at = NOW()
            `,
            [
                id,
                normalized.email || user.email,
                normalized.firstName || '',
                normalized.lastName || '',
                normalized.role === 'master_admin' ? 'master_admin' : normalized.systemRole || user.systemRole || 'user',
            ]
        );

        if (normalized.teamId) {
            await rawQuery(
                `
                    INSERT INTO ats_team_memberships (user_id, team_id, role)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (user_id, team_id) DO UPDATE SET role = EXCLUDED.role
                `,
                [id, normalized.teamId, normalized.role || 'admin']
            );
        }

        return getPath(user, ['users', id]);
    }

    if (kind === 'teams') {
        await rawQuery(
            `
                INSERT INTO ats_teams (id, name, industry, description, is_discoverable, created_by)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    industry = EXCLUDED.industry,
                    description = EXCLUDED.description,
                    is_discoverable = EXCLUDED.is_discoverable,
                    updated_at = NOW()
            `,
            [
                id,
                normalized.name || 'Untitled Team',
                normalized.industry || null,
                normalized.description || null,
                normalized.isDiscoverable ?? true,
                normalized.ownerId || normalized.createdBy || user.id,
            ]
        );

        await rawQuery(
            `
                INSERT INTO ats_team_memberships (user_id, team_id, role)
                VALUES ($1, $2, $3)
                ON CONFLICT (user_id, team_id) DO UPDATE SET role = EXCLUDED.role
            `,
            [user.id, id, normalized.role || 'admin']
        );

        await rawQuery(
            `
                INSERT INTO ats_team_settings (team_id, data)
                VALUES ($1, '{}'::jsonb)
                ON CONFLICT (team_id) DO NOTHING
            `,
            [id]
        );

        return {
            id,
            name: normalized.name || 'Untitled Team',
            industry: normalized.industry || null,
            description: normalized.description || null,
            isDiscoverable: normalized.isDiscoverable ?? true,
            status: 'active',
            createdBy: normalized.ownerId || normalized.createdBy || user.id,
            createdAt: normalized.createdAt || new Date().toISOString(),
        };
    }

    const teamId = teamIdFromPath(path);
    assertTeamAccess(user, teamId);

    await rawQuery(
        `
            INSERT INTO ats_records (id, team_id, collection, data, created_by)
            VALUES ($1, $2, $3, $4::jsonb, $5)
            ON CONFLICT (team_id, collection, id) DO UPDATE SET
                data = EXCLUDED.data,
                updated_at = NOW()
        `,
        [id, teamId, collection, JSON.stringify(normalized), user.id]
    );

    return getPath(user, recordDocPath(path, id));
}

export async function updatePath(user: SessionUser, path: string[], data: AnyRecord) {
    const existing = await getPath(user, path);
    if (!existing) return null;
    const id = pathKind(path) === 'records' ? recordIdFromPath(path) : idFromPath(path);
    return setPath(user, path, { ...existing, ...data }, id);
}

export async function deletePath(user: SessionUser, path: string[]) {
    const kind = pathKind(path);
    const id = idFromPath(path);
    if (!id) return false;

    if (kind === 'records') {
        const teamId = teamIdFromPath(path);
        assertTeamAccess(user, teamId);
        const recordId = recordIdFromPath(path);
        if (!recordId) return false;
        await rawQuery(
            'DELETE FROM ats_records WHERE team_id = $1 AND collection = $2 AND id = $3',
            [teamId, recordCollectionFromPath(path), recordId]
        );
        return true;
    }

    return false;
}
