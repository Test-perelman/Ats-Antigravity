'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/firebase/AuthContext';
import { db } from '../../lib/firebase/config';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Button } from '../../components/ui/button';
import { Calendar, Video, Phone, MapPin, Clock } from 'lucide-react';
import DynamicTable, { Column } from '../../components/ui/DynamicTable';

interface Interview {
    id: string;
    candidateName?: string;
    submissionId?: string;
    jobTitle?: string;
    scheduledAt: string;
    mode?: string;
    interviewType?: string;
    round?: string;
    interviewerName?: string;
}

export default function InterviewsPage() {
    const router = useRouter();
    const { userData } = useAuth();
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userData?.teamId) return;

        // Listen to interviews
        const q = query(
            collection(db, 'teams', userData.teamId, 'interviews'),
            orderBy('scheduledAt', 'asc')
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const list = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    // Handle Timestamp conversion safely
                    scheduledAt: data.scheduledAt?.toDate
                        ? data.scheduledAt.toDate().toISOString()
                        : (data.scheduledAt || new Date().toISOString())
                };
            }) as Interview[];

            setInterviews(list);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userData?.teamId]);

    const getModeIcon = (mode?: string) => {
        const m = mode?.toLowerCase();
        switch (m) {
            case 'video': return <Video size={16} />;
            case 'phone': return <Phone size={16} />;
            default: return <MapPin size={16} />;
        }
    };

    const columns: Column<Interview>[] = [
        {
            id: 'candidate',
            label: 'Candidate',
            render: (row) => (
                <div>
                    <div className="font-bold text-lg">
                        {row.candidateName || `Candidate (ID: ${row.submissionId?.slice(0, 6) || '?'})`}
                    </div>
                    {row.jobTitle && (
                        <div className="text-sm font-normal text-muted-foreground">for {row.jobTitle}</div>
                    )}
                </div>
            )
        },
        {
            id: 'schedule',
            label: 'Schedule',
            render: (row) => (
                <div className="flex items-center gap-1 font-semibold text-foreground">
                    <Clock size={16} />
                    {new Date(row.scheduledAt).toLocaleString()}
                </div>
            )
        },
        {
            id: 'mode',
            label: 'Mode',
            render: (row) => (
                <div className="flex items-center gap-1 capitalize">
                    {getModeIcon(row.mode || row.interviewType)}
                    {row.mode || row.interviewType || 'Onsite'}
                </div>
            )
        },
        {
            id: 'round',
            label: 'Round',
            render: (row) => row.round ? (
                <span className="bg-secondary px-2 py-0.5 rounded text-xs uppercase tracking-wide font-bold">
                    {row.round}
                </span>
            ) : null
        },
        {
            id: 'interviewer',
            label: 'Interviewer',
            render: (row) => row.interviewerName ? (
                <div className="text-xs text-muted-foreground">
                    {row.interviewerName}
                </div>
            ) : <span className="text-xs text-gray-400">-</span>
        },
        {
            id: 'actions',
            label: 'Actions',
            render: () => (
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">Reschedule</Button>
                    <Button size="sm">Join Call</Button>
                </div>
            )
        }
    ];

    return (
        <div className="container p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="title">Interviews</h1>
                    <p className="subtitle">Upcoming schedule</p>
                </div>
                <div className="flex gap-4">
                    {/* Search bar could go here */}
                    <input
                        type="text"
                        placeholder="Search..."
                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary"
                    />
                    <Button onClick={() => router.push('/interviews/schedule')} className="bg-primary hover:bg-primary/90 text-white">
                        <Calendar size={18} className="mr-2" />
                        Schedule Interview
                    </Button>
                </div>
            </div>

            <DynamicTable<Interview>
                id="interviews-table"
                data={interviews}
                columns={columns}
                // onRowClick={(row) => router.push(`/interviews/${row.id}`)}
                isLoading={loading}
                emptyMessage="No interviews scheduled."
            />
        </div>
    );
}
