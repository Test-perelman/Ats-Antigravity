import { Pool, type QueryResultRow } from 'pg';

let pool: Pool | null = null;
let schemaReady: Promise<void> | null = null;

function getConnectionString() {
    return (
        process.env.DATABASE_URL ||
        process.env.POSTGRES_URL ||
        process.env.POSTGRES_PRISMA_URL ||
        process.env.VPSONE_DATABASE_URL ||
        ''
    );
}

export function getPool() {
    if (pool) return pool;

    const connectionString = getConnectionString();
    if (!connectionString) {
        throw new Error(
            'Postgres is not configured. Set DATABASE_URL to the VPS/Postgres connection string.'
        );
    }

    const sslMode = process.env.DATABASE_SSL || process.env.PGSSLMODE;
    pool = new Pool({
        connectionString,
        ssl: sslMode === 'true' || sslMode === 'require'
            ? { rejectUnauthorized: false }
            : undefined,
    });

    return pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(text: string, params: unknown[] = []) {
    await ensureSchema();
    return getPool().query<T>(text, params);
}

export async function rawQuery<T extends QueryResultRow = QueryResultRow>(text: string, params: unknown[] = []) {
    return getPool().query<T>(text, params);
}

export async function ensureSchema() {
    if (schemaReady) return schemaReady;

    schemaReady = (async () => {
        const db = getPool();

        await db.query(`
            CREATE TABLE IF NOT EXISTS ats_users (
                id TEXT PRIMARY KEY,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT,
                first_name TEXT NOT NULL DEFAULT '',
                last_name TEXT NOT NULL DEFAULT '',
                system_role TEXT NOT NULL DEFAULT 'user',
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS ats_teams (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                industry TEXT,
                description TEXT,
                is_discoverable BOOLEAN NOT NULL DEFAULT TRUE,
                status TEXT NOT NULL DEFAULT 'active',
                created_by TEXT REFERENCES ats_users(id) ON DELETE SET NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS ats_team_memberships (
                user_id TEXT NOT NULL REFERENCES ats_users(id) ON DELETE CASCADE,
                team_id TEXT NOT NULL REFERENCES ats_teams(id) ON DELETE CASCADE,
                role TEXT NOT NULL DEFAULT 'recruiter',
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                PRIMARY KEY (user_id, team_id)
            );

            CREATE TABLE IF NOT EXISTS ats_team_settings (
                team_id TEXT PRIMARY KEY REFERENCES ats_teams(id) ON DELETE CASCADE,
                data JSONB NOT NULL DEFAULT '{}'::jsonb,
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS ats_team_access_requests (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES ats_users(id) ON DELETE CASCADE,
                team_id TEXT NOT NULL REFERENCES ats_teams(id) ON DELETE CASCADE,
                status TEXT NOT NULL DEFAULT 'pending',
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                UNIQUE (user_id, team_id)
            );

            CREATE TABLE IF NOT EXISTS ats_records (
                id TEXT PRIMARY KEY,
                team_id TEXT NOT NULL REFERENCES ats_teams(id) ON DELETE CASCADE,
                collection TEXT NOT NULL,
                data JSONB NOT NULL DEFAULT '{}'::jsonb,
                created_by TEXT REFERENCES ats_users(id) ON DELETE SET NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                UNIQUE (team_id, collection, id)
            );

            CREATE INDEX IF NOT EXISTS ats_records_team_collection_idx
                ON ats_records(team_id, collection);
        `);
    })();

    return schemaReady;
}
