'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/firebase/AuthContext';
import { db } from '../../lib/firebase/config';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Button } from '../../components/ui/button';
import { Plus, Search, MoreHorizontal, Briefcase, MapPin, DollarSign, Building } from 'lucide-react';

interface Job {
    id: string;
    title: string;
    location: string;
    maxRate: string;
    status: string;
    clientName?: string;
    createdAt: any;
    _count?: {
        submissions: number;
    };
}

export default function JobsPage() {
    const router = useRouter();
    const { userData } = useAuth();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userData?.teamId) return;

        // Reference to the team's jobs collection
        const q = query(
            collection(db, 'teams', userData.teamId, 'jobs'),
            orderBy('createdAt', 'desc')
        );

        // Real-time listener
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Job[];
            setJobs(list);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching jobs:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userData?.teamId]);

    return (
        <div className="container p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="title">Job Board</h1>
                    <p className="subtitle">Manage open requirements</p>
                </div>
                <Button onClick={() => router.push('/jobs/new')}>
                    <Plus size={16} className="mr-2" />
                    Post New Job
                </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 mb-6">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search jobs..."
                        className="pl-10 w-full p-2 border rounded"
                    />
                </div>
            </div>

            {/* Grid / List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="p-8 text-center text-muted-foreground">Loading jobs...</div>
                ) : jobs.length === 0 ? (
                    <div className="p-12 text-center border rounded dashed bg-secondary/30">
                        <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium">No jobs posted yet</h3>
                        <p className="text-muted-foreground mb-4">Get started by creating your first job requirement.</p>
                        <Button onClick={() => router.push('/jobs/new')}>Post Job</Button>
                    </div>
                ) : (
                    jobs.map((job) => (
                        <div
                            key={job.id}
                            className="bg-card border rounded shadow p-6 flex flex-col md:flex-row justify-between hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => router.push(`/jobs/${job.id}`)}
                        >
                            <div className="mb-4 md:mb-0">
                                <h3 className="text-lg font-bold text-primary mb-1">{job.title}</h3>
                                {(job.clientName && job.clientName !== 'Unknown') && (
                                    <div className="text-sm font-medium text-muted-foreground flex items-center gap-1 mb-2">
                                        <Building size={12} /> {job.clientName}
                                    </div>
                                )}
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <MapPin size={14} /> {job.location || 'Remote'}
                                    </span>
                                    {job.maxRate && (
                                        <span className="flex items-center gap-1">
                                            <DollarSign size={14} /> {job.maxRate}
                                        </span>
                                    )}
                                    <span className={`capitalize px-2 py-0.5 rounded text-xs font-semibold ${job.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {job.status}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{job._count?.submissions || 0}</div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-wide">Candidates</div>
                                </div>
                                <Button variant="ghost" size="sm">
                                    <MoreHorizontal size={16} />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
