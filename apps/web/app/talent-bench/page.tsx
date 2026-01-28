'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/AuthContext';
import { db } from '@/lib/firebase/config';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, Timestamp } from 'firebase/firestore';
import DynamicTable, { Column } from '../../components/ui/DynamicTable';
import DetailModal from '../../components/ui/DetailModal';
import { Button } from '@/components/ui/button';
import { Plus, Search, MoreHorizontal, Armchair, Briefcase, Globe, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Candidate } from '@/lib/firebase/hooks';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function TalentBenchPage() {
    const router = useRouter();
    const { userData } = useAuth();
    const [profiles, setProfiles] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProfile, setSelectedProfile] = useState<Candidate | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!userData?.teamId) return;

        // Query main 'candidates' collection
        const q = query(
            collection(db, 'teams', userData.teamId, 'candidates'),
            orderBy('updatedAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const allCandidates = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Candidate[];

            // Apply inclusion logic
            const now = new Date();
            const benchCandidates = allCandidates.filter(c => {
                // 1. Explicitly marked as Bench Ready
                if (c.benchReady) return true;

                // Exclude rejected/withdrawn
                if (c.status === 'rejected' || c.status === 'withdrawn') return false;

                // 2. Status = screening (new) or interviewing
                if (c.status === 'new' || c.status === 'interviewing') return true;

                // 3. Status = hired AND project ending within 30 days
                // Note: 'hired' is the status for placed candidates
                if (c.status === 'hired') {
                    if (c.currentProjectEndDate) {
                        const endDate = c.currentProjectEndDate.toDate ? c.currentProjectEndDate.toDate() : new Date(c.currentProjectEndDate);
                        const diffTime = endDate.getTime() - now.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        return diffDays <= 30; // Included if ending in <= 30 days (or already ended)
                    }
                    // If hired but no project end date, assuming active and NOT on bench, so exclude
                    return false;
                }

                return false;
            });

            setProfiles(benchCandidates);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching talent bench:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userData?.teamId]);

    const handleToggleBenchReady = async (candidate: Candidate) => {
        if (!userData?.teamId) return;
        try {
            const ref = doc(db, 'teams', userData.teamId, 'candidates', candidate.id);
            await updateDoc(ref, {
                benchReady: !candidate.benchReady
            });
        } catch (e) {
            console.error("Error toggling bench ready:", e);
        }
    };

    const handleTogglePriority = async (candidate: Candidate) => {
        if (!userData?.teamId) return;
        try {
            const ref = doc(db, 'teams', userData.teamId, 'candidates', candidate.id);
            await updateDoc(ref, {
                highPriority: !candidate.highPriority
            });
        } catch (e) {
            console.error("Error toggling priority:", e);
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formatDate = (timestamp: any) => {
        if (!timestamp) return '-';
        if (timestamp.toDate) return timestamp.toDate().toLocaleDateString();
        return new Date(timestamp).toLocaleDateString();
    };

    const filteredProfiles = profiles.filter(p => {
        const term = searchTerm.toLowerCase();
        return p.firstName.toLowerCase().includes(term) ||
            p.lastName.toLowerCase().includes(term) ||
            p.skills?.some(s => s.toLowerCase().includes(term));
    });

    const columns: Column<Candidate>[] = [
        {
            id: 'name',
            label: 'Name',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <div>
                        <div className="font-bold flex items-center gap-2">
                            {row.firstName} {row.lastName}
                            {row.highPriority && <span title="High Priority">🔥</span>}
                        </div>
                        <div className="text-sm text-muted-foreground">{row.email}</div>
                    </div>
                </div>
            )
        },
        {
            id: 'skills',
            label: 'Skills',
            render: (row) => (
                <div>
                    {row.skills && row.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                            {row.skills.slice(0, 3).map((skill, i) => (
                                <span key={i} className="px-1.5 py-0.5 bg-secondary text-secondary-foreground text-[10px] rounded border">
                                    {skill}
                                </span>
                            ))}
                            {row.skills.length > 3 && <span className="text-[10px] text-muted-foreground">+{row.skills.length - 3}</span>}
                        </div>
                    ) : '-'}
                </div>
            )
        },
        {
            id: 'availability',
            label: 'Availability',
            render: (row) => (
                <div className="text-sm">
                    <div className="flex items-center gap-1 mb-1">
                        <Armchair size={12} className="text-muted-foreground" />
                        <span className={row.availabilityStatus === 'Immediate' ? 'text-green-600 font-medium' : ''}>
                            {row.availabilityStatus || 'Unknown'}
                        </span>
                    </div>
                    {row.availabilityDate && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock size={10} /> {formatDate(row.availabilityDate)}
                        </div>
                    )}
                </div>
            )
        },
        {
            id: 'visa',
            label: 'Visa Status',
            render: (row) => (
                <div className="text-sm">
                    <div className="flex items-center gap-1">
                        <Globe size={12} className="text-muted-foreground" />
                        <span>{row.visaStatus || 'N/A'}</span>
                    </div>
                    {row.visaExpiry && (
                        <div className="text-xs text-muted-foreground">
                            Exp: {formatDate(row.visaExpiry)}
                        </div>
                    )}
                </div>
            )
        },
        {
            id: 'bench_status',
            label: 'Status',
            render: (row) => (
                <div className="flex flex-col gap-1">
                    <span className={`inline-flex w-fit items-center px-2 py-0.5 rounded-full text-xs font-medium 
                        ${row.status === 'new' ? 'bg-blue-100 text-blue-800' :
                            row.status === 'interviewing' ? 'bg-purple-100 text-purple-800' :
                                row.status === 'hired' ? 'bg-orange-100 text-orange-800' : // Hired but ending soon
                                    'bg-gray-100 text-gray-800'}`}>
                        {row.status}
                    </span>
                    {row.benchReady && (
                        <span className="inline-flex w-fit items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Bench Ready
                        </span>
                    )}
                </div>
            )
        },
        {
            id: 'actions',
            label: 'Actions',
            render: (row) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal size={16} />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => {
                            setSelectedProfile(row);
                            setIsDetailOpen(true);
                        }}>
                            View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleBenchReady(row)}>
                            {row.benchReady ? 'Unmark Bench Ready' : 'Mark Bench Ready'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleTogglePriority(row)}>
                            {row.highPriority ? 'Remove Priority' : 'Mark High Priority'}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    ];

    return (
        <div className="container p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="title">Talent Bench</h1>
                    <p className="subtitle">Curated view of available consultants</p>
                </div>
                {/* 
                <div className="flex gap-2">
                     No direct add here, adds to candidates
                </div> 
                */}
            </div>

            <div className="flex items-center gap-4 mb-6">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search bench (name, skills)..."
                        className="pl-10 w-full p-2 border rounded"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="text-sm text-muted-foreground ml-auto">
                    Showing {filteredProfiles.length} bench-eligible candidates
                </div>
            </div>

            <DynamicTable<Candidate>
                id="bench-table"
                data={filteredProfiles}
                columns={columns}
                onRowClick={(row) => {
                    setSelectedProfile(row);
                    setIsDetailOpen(true);
                }}
                isLoading={loading}
                emptyMessage="No available consultants found."
            />

            <DetailModal
                isOpen={isDetailOpen}
                onClose={() => {
                    setIsDetailOpen(false);
                    setSelectedProfile(null);
                }}
                type="candidate"
                id={selectedProfile?.id || ''}
                title={`Profile: ${selectedProfile?.firstName} ${selectedProfile?.lastName}`}
            />
        </div>
    );
}
