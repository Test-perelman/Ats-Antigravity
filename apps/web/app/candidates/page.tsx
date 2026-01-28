'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/firebase/AuthContext';
import { db } from '../../lib/firebase/config';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Button } from '../../components/ui/button';
import { Plus, Search, MoreHorizontal, Globe, Briefcase } from 'lucide-react';
import DynamicTable, { Column } from '../../components/ui/DynamicTable';
import DetailModal from '../../components/ui/DetailModal';

interface Candidate {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    title?: string;
    skills?: string[];
    visaStatus?: string;
    experience?: number;
    status: string;
    createdAt: any;
}

export default function CandidatesPage() {
    const router = useRouter();
    const { userData } = useAuth();
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

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

    // Columns Definition
    const columns: Column<Candidate>[] = [
        {
            id: 'name',
            label: 'Name',
            render: (row) => (
                <div>
                    <div className="font-bold">{row.firstName} {row.lastName}</div>
                    <div className="text-sm text-muted-foreground">{row.email}</div>
                </div>
            )
        },
        {
            id: 'title',
            label: 'Title / Skills',
            render: (row) => (
                <div>
                    <div className="font-medium text-sm">{row.title || '-'}</div>
                    {row.skills && row.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                            {row.skills.slice(0, 3).map((skill, i) => (
                                <span key={i} className="px-1.5 py-0.5 bg-secondary text-secondary-foreground text-[10px] rounded border">
                                    {skill}
                                </span>
                            ))}
                            {row.skills.length > 3 && <span className="text-[10px] text-muted-foreground">+{row.skills.length - 3}</span>}
                        </div>
                    )}
                </div>
            )
        },
        {
            id: 'visa_exp',
            label: 'Visa & Experience',
            render: (row) => (
                <div className="text-sm">
                    <div className="flex items-center gap-1 mb-1" title="Visa Status">
                        <Globe size={12} className="text-muted-foreground" />
                        <span>{row.visaStatus || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1" title="Experience">
                        <Briefcase size={12} className="text-muted-foreground" />
                        <span>{row.experience || 0} Yrs</span>
                    </div>
                </div>
            )
        },
        {
            id: 'status',
            label: 'Status',
            render: (row) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                    ${row.status === 'new' ? 'bg-blue-100 text-blue-800' :
                        row.status === 'interviewing' ? 'bg-purple-100 text-purple-800' :
                            row.status === 'hired' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'}`}>
                    {row.status}
                </span>
            )
        },
        {
            id: 'actions',
            label: 'Actions',
            render: () => (
                <Button variant="ghost" size="sm">
                    <MoreHorizontal size={16} />
                </Button>
            )
        }
    ];

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

            {/* Dynamic Table */}
            <DynamicTable<Candidate>
                id="candidates-table"
                data={candidates}
                columns={columns}
                onRowClick={(row) => {
                    setSelectedCandidate(row);
                    setIsDetailOpen(true);
                }}
                isLoading={loading}
                emptyMessage="No candidates found."
            />

            <DetailModal
                isOpen={isDetailOpen}
                onClose={() => {
                    setIsDetailOpen(false);
                    setSelectedCandidate(null);
                }}
                type="candidate"
                id={selectedCandidate?.id || ''}
                title={`Candidate: ${selectedCandidate?.firstName} ${selectedCandidate?.lastName}`}
            />
        </div>
    );
}
