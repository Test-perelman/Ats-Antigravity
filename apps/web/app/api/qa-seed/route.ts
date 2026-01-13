
import { NextResponse } from 'next/server';
import { signInWithEmailAndPassword, setPersistence, inMemoryPersistence } from 'firebase/auth';
import { collection, addDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';

// Force dynamic to avoid caching the response
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        console.log('Starting QA Seed process...');

        // Fix persistence for server-side
        await setPersistence(auth, inMemoryPersistence);

        // 1. Authenticate
        const userCred = await signInWithEmailAndPassword(auth, 'test.admin@gmail.com', 'Test@2026');
        const user = userCred.user;
        console.log('Authenticated as:', user.email);

        let teamId: string | null = null;
        let requiresUserDocInfo = false;

        // 2. Get Team ID via User Doc
        const userSnapshot = await getDocs(query(collection(db, 'users'), where('uid', '==', user.uid)));

        if (userSnapshot.empty) {
            console.log('User meta-data not found. Creating new Team and User...');

            try {
                console.log('Attempting to create Team...');
                // Create a new Team
                const teamRef = await addDoc(collection(db, 'teams'), {
                    name: 'QA Test Team',
                    createdAt: Timestamp.now(),
                    createdBy: user.uid,
                    members: [user.uid]
                });
                console.log('Team created with ID:', teamRef.id);
                teamId = teamRef.id;
                requiresUserDocInfo = true;
            } catch (err: any) {
                console.error('Error creating team:', err);
                throw new Error('Failed to create Team: ' + err.message);
            }

            try {
                // Create user document
                console.log('Attempting to create User doc...');
                await addDoc(collection(db, 'users'), {
                    uid: user.uid,
                    email: user.email,
                    firstName: 'Test',
                    lastName: 'Admin',
                    role: 'admin',
                    teamId: teamId,
                    createdAt: Timestamp.now()
                });
                console.log('User doc created.');
            } catch (err: any) {
                console.error('Error creating user doc:', err);
                // Continue if user doc fails but team exists, though likely critical.
            }
        } else {
            const userData = userSnapshot.docs[0].data();
            teamId = userData.teamId;
            console.log('Found existing teamId:', teamId);
        }

        if (!teamId) {
            return NextResponse.json({ success: false, error: 'Team ID not found for user' }, { status: 200 });
        }

        // 3. Create Jobs
        console.log('Seeding Jobs...');
        const jobs = [
            { title: 'QA Engineer', department: 'Engineering', location: 'Remote', status: 'Open' },
            { title: 'Product Manager', department: 'Product', location: 'New York', status: 'Open' },
            { title: 'Designer', department: 'Design', location: 'London', status: 'Draft' },
            { title: 'Sales Rep', department: 'Sales', location: 'San Francisco', status: 'Closed' },
            { title: 'Backend Dev', department: 'Engineering', location: 'Remote', status: 'Open' }
        ];

        const createdJobs = [];
        for (const job of jobs) {
            const docRef = await addDoc(collection(db, 'teams', teamId, 'jobs'), {
                ...job,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            });
            createdJobs.push({ id: docRef.id, ...job });
        }

        // 4. Create Candidates
        console.log('Seeding Candidates...');
        const candidates = [
            { firstName: 'Alice', lastName: 'Tester', email: 'alice.qa@example.com', phone: '123-456-7890', skills: ['Selenium', 'Cypress'], status: 'New' },
            { firstName: 'Bob', lastName: 'Builder', email: 'bob.build@example.com', phone: '987-654-3210', skills: ['React', 'Node'], status: 'Screening' },
            { firstName: 'Charlie', lastName: 'Designer', email: 'charlie@example.com', phone: '555-555-5555', skills: ['Figma', 'Sketch'], status: 'New' },
            { firstName: 'David', lastName: 'Sales', email: 'david@example.com', phone: '444-444-4444', skills: ['Salesforce'], status: 'Offer' },
            { firstName: 'Eve', lastName: 'Hacker', email: 'eve@example.com', phone: '333-333-3333', skills: ['Python', 'Go'], status: 'Rejected' },
        ];

        const createdCandidates = [];
        for (const cand of candidates) {
            const docRef = await addDoc(collection(db, 'teams', teamId, 'candidates'), {
                ...cand,
                createdAt: Timestamp.now()
            });
            createdCandidates.push({ id: docRef.id, ...cand });
        }

        // 5. Create Interviews
        console.log('Seeding Interviews...');
        const interviews = [
            { candidateName: 'Alice Tester', jobTitle: 'QA Engineer', interviewType: 'video', status: 'scheduled', scheduledAt: Timestamp.fromDate(new Date(Date.now() + 86400000)) }, // +1 day
            { candidateName: 'Bob Builder', jobTitle: 'Backend Dev', interviewType: 'phone', status: 'scheduled', scheduledAt: Timestamp.fromDate(new Date(Date.now() + 172800000)) }, // +2 days
            { candidateName: 'David Sales', jobTitle: 'Sales Rep', interviewType: 'onsite', status: 'completed', scheduledAt: Timestamp.fromDate(new Date(Date.now() - 86400000)) }, // -1 day
        ];

        const createdInterviews = [];
        for (const int of interviews) {
            const docRef = await addDoc(collection(db, 'teams', teamId, 'interviews'), {
                ...int,
                createdAt: Timestamp.now()
            });
            createdInterviews.push({ id: docRef.id, ...int });
        }

        return NextResponse.json({
            success: true,
            teamId,
            message: 'Successfully seeded data (Jobs, Candidates, Interviews)',
            counts: {
                jobs: createdJobs.length,
                candidates: createdCandidates.length,
                interviews: createdInterviews.length
            },
            data: {
                jobs: createdJobs.map(j => j.id),
                candidates: createdCandidates.map(c => c.id),
                interviews: createdInterviews.map(i => i.id)
            }
        });

    } catch (error: any) {
        console.error('Seeding error:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 200 });
    }
}
