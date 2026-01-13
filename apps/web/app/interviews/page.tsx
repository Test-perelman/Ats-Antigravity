'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/firebase/AuthContext';
import { db } from '../../lib/firebase/config';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Button } from '../../components/ui/button';
import { Calendar, Clock, Video, Phone, MapPin } from 'lucide-react';

// Extended interface to match Seed Data + UI requirements
interface Interview {
    id: string;
    round?: string;
    scheduledAt: any; // Allow Timestamp or serialized string
    mode?: string;
    interviewType?: string; // Seed data uses this
    interviewerName?: string;
    status: string;
    submissionId?: string;
    candidateName?: string; // Seed data uses this
    jobTitle?: string;      // Seed data uses this
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

            <div className="space-y-4">
                {loading ? (
                    <div className="p-8 text-center text-muted-foreground">Loading schedule...</div>
                ) : interviews.length === 0 ? (
                    <div className="p-12 text-center border rounded dashed bg-secondary/30">
                        <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium">No interviews scheduled</h3>
                        <p className="text-muted-foreground">Schedule an interview to see it here.</p>
                        <Button onClick={() => router.push('/interviews/schedule')} variant="outline" className="mt-4">
                            Schedule Now
                        </Button>
                    </div>
                ) : (
                    interviews.map((interview) => (
                        <div key={interview.id} className="bg-card border rounded p-6 shadow hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex-grow">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-lg">
                                        {interview.candidateName || `Candidate (ID: ${interview.submissionId?.slice(0, 6) || '?'})`}
                                    </span>
                                    {interview.jobTitle && (
                                        <span className="text-sm font-normal text-muted-foreground">for {interview.jobTitle}</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1 font-semibold text-foreground">
                                        <Clock size={16} />
                                        {new Date(interview.scheduledAt).toLocaleString()}
                                    </span>
                                    <span className="flex items-center gap-1 capitalize">
                                        {getModeIcon(interview.mode || interview.interviewType)}
                                        {interview.mode || interview.interviewType || 'Onsite'}
                                    </span>
                                    {interview.round && (
                                        <span className="bg-secondary px-2 py-0.5 rounded text-xs uppercase tracking-wide font-bold">
                                            {interview.round}
                                        </span>
                                    )}
                                </div>

                                {interview.interviewerName && (
                                    <div className="text-xs text-muted-foreground mt-2">
                                        Interviewer: {interview.interviewerName}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <Button variant="outline" size="sm">Reschedule</Button>
                                <Button size="sm">Join Call</Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div >
    );
}
