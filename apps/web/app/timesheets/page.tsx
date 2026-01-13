'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/firebase/AuthContext';
import { db } from '../../lib/firebase/config';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Button } from '../../components/ui/button';
import { Clock, Calendar, FileText, Plus, Loader2 } from 'lucide-react';

interface Timesheet {
    id: string;
    totalHours: number;
    weekEnding: any; // Timestamp or date string
    status: string;
    candidateId: string;
    candidateName?: string;
    projectId: string;
    projectName?: string;
}

export default function TimesheetsPage() {
    const router = useRouter();
    const { userData } = useAuth();
    const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userData?.teamId) return;

        // Reference to the team's timesheets collection
        const q = query(
            collection(db, 'teams', userData.teamId, 'timesheets'),
            orderBy('weekEnding', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Timesheet[];
            setTimesheets(list);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching timesheets:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userData?.teamId]);

    const statusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'approved': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            case 'submitted': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="container p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="title">Timesheets</h1>
                    <p className="subtitle">Track hours and approvals</p>
                </div>
                <Button onClick={() => router.push('/timesheets/new')}>
                    <Plus size={16} className="mr-2" />
                    Log Time
                </Button>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : timesheets.length === 0 ? (
                    <div className="p-12 text-center border rounded dashed bg-secondary/30">
                        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium">No timesheets found</h3>
                        <p className="text-muted-foreground mb-4">Log your first timesheet entry.</p>
                        <Button onClick={() => router.push('/timesheets/new')}>Log Time</Button>
                    </div>
                ) : (
                    <div className="bg-card border rounded shadow overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-secondary/50 text-muted-foreground font-medium border-b">
                                <tr>
                                    <th className="px-6 py-3">Candidate</th>
                                    <th className="px-6 py-3">Project</th>
                                    <th className="px-6 py-3">Week Ending</th>
                                    <th className="px-6 py-3">Hours</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {timesheets.map((ts) => (
                                    <tr key={ts.id} className="hover:bg-secondary/20 transition-colors">
                                        <td className="px-6 py-4 font-medium">{ts.candidateName || 'Unknown'}</td>
                                        <td className="px-6 py-4">{ts.projectName || 'Unknown'}</td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {ts.weekEnding?.toDate ? ts.weekEnding.toDate().toLocaleDateString() : new Date(ts.weekEnding).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 font-bold">{ts.totalHours}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${statusColor(ts.status)}`}>
                                                {ts.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button variant="ghost" size="sm">View</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
