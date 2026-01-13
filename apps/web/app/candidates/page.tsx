'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/firebase/AuthContext';
import { db } from '../../lib/firebase/config';
import { collection, query, orderBy, onSnapshot, DocumentData } from 'firebase/firestore';
import { Button } from '../../components/ui/button';
import { Plus, Search, MoreHorizontal, Briefcase, Globe } from 'lucide-react';
import SkeletonLoader from '../../components/dashboard/SkeletonLoader';

interface Candidate {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    title: string;
    status: string;
    skills?: string[];
    experience?: number;
    visaStatus?: string;
    createdAt: any; // Firestore Timestamp
}

export default function CandidatesPage() {
    const router = useRouter();
    const { userData } = useAuth();
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userData?.teamId) return;

        // Reference to the team's candidates collection
        const q = query(
            collection(db, 'teams', userData.teamId, 'candidates'),
            orderBy('createdAt', 'desc')
        );

        // Real-time listener
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Candidate[];
            setCandidates(list);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching candidates:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userData?.teamId]);

    // Format Firestore Timestamp to date string
    const formatDate = (timestamp: any) => {
        if (!timestamp) return '-';
        if (timestamp.toDate) return timestamp.toDate().toLocaleDateString();
        return new Date(timestamp).toLocaleDateString(); // Fallback
    };

    return (
        <div className="container p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="title">Candidates</h1>
                    <p className="subtitle">Manage your talent pool</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => router.push('/candidates/new')}>
                        <Plus size={16} className="mr-2" />
                        Add Candidate
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 mb-6">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search candidates..."
                        className="pl-10 w-full p-2 border rounded"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-card rounded shadow border overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b bg-secondary/50 text-sm text-muted-foreground">
                            <th className="p-4 font-medium">Name</th>
                            <th className="p-4 font-medium">Title/Skills</th>
                            <th className="p-4 font-medium">Visa & Exp</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="p-4">
                                    <SkeletonLoader type="table" count={1} />
                                </td>
                            </tr>
                        ) : candidates.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-muted-foreground">No candidates found.</td>
                            </tr>
                        ) : (
                            candidates.map((candidate) => (
                                <tr key={candidate.id} className="border-b last:border-0 hover:bg-secondary/10 transition-colors cursor-pointer" onClick={() => router.push(`/candidates/${candidate.id}`)}>
                                    <td className="p-4">
                                        <div className="font-bold">{candidate.firstName} {candidate.lastName}</div>
                                        <div className="text-sm text-muted-foreground">{candidate.email}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-medium text-sm">{candidate.title || '-'}</div>
                                        {candidate.skills && candidate.skills.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {candidate.skills.slice(0, 3).map((skill, i) => (
                                                    <span key={i} className="px-1.5 py-0.5 bg-secondary text-secondary-foreground text-[10px] rounded border">
                                                        {skill}
                                                    </span>
                                                ))}
                                                {candidate.skills.length > 3 && <span className="text-[10px] text-muted-foreground">+{candidate.skills.length - 3}</span>}
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4 text-sm">
                                        <div className="flex items-center gap-1 mb-1" title="Visa Status">
                                            <Globe size={12} className="text-muted-foreground" />
                                            <span>{candidate.visaStatus || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-1" title="Experience">
                                            <Briefcase size={12} className="text-muted-foreground" />
                                            <span>{candidate.experience || 0} Yrs</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                            ${candidate.status === 'new' ? 'bg-blue-100 text-blue-800' :
                                                candidate.status === 'interviewing' ? 'bg-purple-100 text-purple-800' :
                                                    candidate.status === 'hired' ? 'bg-green-100 text-green-800' :
                                                        'bg-gray-100 text-gray-800'}`}>
                                            {candidate.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <Button variant="ghost" size="sm">
                                            <MoreHorizontal size={16} />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
