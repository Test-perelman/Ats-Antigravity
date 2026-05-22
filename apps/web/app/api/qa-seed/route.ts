import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json(
        {
            message: 'QA seeding through Firebase has been disabled. Use the authenticated /seed page so data is written to Postgres.',
        },
        { status: 410 }
    );
}
