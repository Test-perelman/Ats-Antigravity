/* eslint-disable @typescript-eslint/no-explicit-any */

type PathSegment = string;

type Constraint =
    | { type: 'where'; field: string; op: string; value: unknown }
    | { type: 'orderBy'; field: string; direction: 'asc' | 'desc' }
    | { type: 'limit'; count: number };

interface CollectionRef {
    kind: 'collection';
    path: PathSegment[];
}

interface DocRef {
    kind: 'doc';
    path: PathSegment[];
    id: string;
}

interface QueryRef {
    kind: 'query';
    ref: CollectionRef;
    constraints: Constraint[];
}

type FirestoreData = Record<string, unknown>;

class SnapshotDoc {
    id: string;
    private value: FirestoreData;

    constructor(value: FirestoreData) {
        this.id = String(value.id);
        this.value = value;
    }

    data(): any {
        const data = { ...this.value };
        delete data.id;
        return data;
    }

    exists() {
        return Boolean(this.value);
    }
}

export class DocumentSnapshot {
    id: string;
    private value: FirestoreData | null;

    constructor(id: string, value: FirestoreData | null) {
        this.id = id;
        this.value = value;
    }

    exists() {
        return this.value !== null;
    }

    data(): any {
        if (!this.value) return undefined;
        const data = { ...this.value };
        delete data.id;
        return data;
    }
}

export class QuerySnapshot {
    docs: SnapshotDoc[];

    constructor(items: FirestoreData[]) {
        this.docs = items.map((item) => new SnapshotDoc(item));
    }

    get size() {
        return this.docs.length;
    }

    get empty() {
        return this.docs.length === 0;
    }
}

function randomId() {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return crypto.randomUUID();
    }
    return Math.random().toString(36).slice(2);
}

function tokenHeaders() {
    const headers: Record<string, string> = { 'content-type': 'application/json' };
    if (typeof window !== 'undefined') {
        const token = window.localStorage.getItem('token');
        if (token) headers.authorization = `Bearer ${token}`;
    }
    return headers;
}

async function request(action: string, path: string[], payload: FirestoreData = {}) {
    const response = await fetch('/api/postgres/firestore', {
        method: 'POST',
        headers: tokenHeaders(),
        body: JSON.stringify({ action, path, ...payload }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || 'Database request failed');
    return data;
}

export function getFirestore(_app?: unknown) {
    void _app;
    return {};
}

export function collection(_dbOrRef: unknown, ...segments: string[]): CollectionRef {
    const base = (_dbOrRef as CollectionRef | DocRef | undefined)?.path || [];
    return { kind: 'collection', path: [...base, ...segments.map(String)] };
}

export function doc(_dbOrRef: unknown, ...segments: string[]): DocRef {
    const base = (_dbOrRef as CollectionRef | DocRef | undefined)?.path || [];
    const path = [...base, ...segments.map(String)];
    if ((_dbOrRef as CollectionRef | undefined)?.kind === 'collection' && segments.length === 0) {
        path.push(randomId());
    }
    const id = path[path.length - 1] || randomId();
    return { kind: 'doc', path, id };
}

export function query(ref: CollectionRef, ...constraints: Constraint[]): QueryRef {
    return { kind: 'query', ref, constraints };
}

export function where(field: string, op: string, value: unknown): Constraint {
    return { type: 'where', field, op, value };
}

export function orderBy(field: string, direction: 'asc' | 'desc' = 'asc'): Constraint {
    return { type: 'orderBy', field, direction };
}

export function limit(count: number): Constraint {
    return { type: 'limit', count };
}

export async function getDocs(refOrQuery: CollectionRef | QueryRef) {
    const ref = refOrQuery.kind === 'query' ? refOrQuery.ref : refOrQuery;
    const constraints = refOrQuery.kind === 'query' ? refOrQuery.constraints : [];
    const data = await request('list', ref.path, { constraints });
    return new QuerySnapshot(data.items || []);
}

export async function getDoc(ref: DocRef) {
    const data = await request('get', ref.path);
    return new DocumentSnapshot(ref.id, data.item || null);
}

export async function addDoc(ref: CollectionRef, data: any) {
    const id = randomId();
    await request('set', [...ref.path, id], { id, data });
    return { id, path: [...ref.path, id], kind: 'doc' as const };
}

export async function setDoc(ref: DocRef, data: any) {
    await request('set', ref.path, { id: ref.id, data });
}

export async function updateDoc(ref: DocRef, data: any) {
    await request('update', ref.path, { data });
}

export async function deleteDoc(ref: DocRef) {
    await request('delete', ref.path);
}

export function onSnapshot(
    refOrQuery: CollectionRef | QueryRef,
    next: (snapshot: QuerySnapshot) => void,
    error?: (error: Error) => void
): () => void;
export function onSnapshot(
    refOrQuery: DocRef,
    next: (snapshot: DocumentSnapshot) => void,
    error?: (error: Error) => void
): () => void;
export function onSnapshot(
    refOrQuery: CollectionRef | QueryRef | DocRef,
    next: (snapshot: any) => void,
    error?: (error: Error) => void
) {
    Promise.resolve()
        .then(async () => {
            if (refOrQuery.kind === 'doc') {
                next(await getDoc(refOrQuery));
            } else {
                next(await getDocs(refOrQuery));
            }
        })
        .catch((err) => error?.(err instanceof Error ? err : new Error(String(err))));

    return () => undefined;
}

export function serverTimestamp() {
    return new Date().toISOString();
}

export class Timestamp {
    private date: Date;

    constructor(date = new Date()) {
        this.date = date;
    }

    static now() {
        return new Timestamp();
    }

    toDate() {
        return this.date;
    }
}

export function writeBatch(_db?: unknown) {
    void _db;
    const operations: Array<() => Promise<void>> = [];
    return {
        set(ref: DocRef, data: any) {
            operations.push(() => setDoc(ref, data));
        },
        update(ref: DocRef, data: any) {
            operations.push(() => updateDoc(ref, data));
        },
        delete(ref: DocRef) {
            operations.push(() => deleteDoc(ref));
        },
        async commit() {
            for (const operation of operations) {
                await operation();
            }
        },
    };
}
