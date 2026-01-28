'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/AuthContext';
import { db } from '@/lib/firebase/config';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import DynamicTable, { Column } from '../../components/ui/DynamicTable';
import DetailModal from '../../components/ui/DetailModal';
import { Button } from '@/components/ui/button';
import { Plus, Search, MoreHorizontal, ClipboardCheck, Building2, User } from 'lucide-react';

interface OnboardingRecord {
    id: string;
    candidateName: string;
    jobTitle: string;
    clientName: string;
    startDate: any;
    status: 'initiated' | 'background_check' | 'docs_pending' | 'completed';
    progress: number; // 0-100
}

export default function OnboardingPage() {
    const router = useRouter();
    const { userData } = useAuth();
    const [records, setRecords] = useState<OnboardingRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRecord, setSelectedRecord] = useState<OnboardingRecord | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    useEffect(() => {
        if (!userData?.teamId) return;

        const q = query(
            collection(db, 'teams', userData.teamId, 'onboarding'),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as OnboardingRecord[];
            setRecords(list);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching onboarding:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userData?.teamId]);

    const formatDate = (timestamp: any) => {
        if (!timestamp) return '-';
        if (timestamp.toDate) return timestamp.toDate().toLocaleDateString();
        return new Date(timestamp).toLocaleDateString();
    };

    const columns: Column<OnboardingRecord>[] = [
        {
            id: 'candidate',
            label: 'Candidate',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                        <User size={14} />
                    </div>
                    <div>
                        <div className="font-bold">{row.candidateName}</div>
                        <div className="text-xs text-muted-foreground">{row.jobTitle}</div>
                    </div>
                </div>
            )
        },
        {
            id: 'client',
            label: 'Client',
            render: (row) => (
                <div className="flex items-center gap-1 text-sm">
                    <Building2 size={14} className="text-muted-foreground" />
                    <span>{row.clientName}</span>
                </div>
            )
        },
        {
            id: 'start_date',
            label: 'Start Date',
            render: (row) => (
                <div className="text-sm">{formatDate(row.startDate)}</div>
            )
        },
        {
            id: 'status',
            label: 'Status',
            render: (row) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                    ${row.status === 'completed' ? 'bg-green-100 text-green-800' :
                        row.status === 'background_check' ? 'bg-amber-100 text-amber-800' :
                            'bg-blue-100 text-blue-800'}`}>
                    {row.status ? row.status.replace('_', ' ').toUpperCase() : 'INITIATED'}
                </span>
            )
        },
        {
            id: 'progress',
            label: 'Progress',
            render: (row) => (
                <div className="w-full max-w-[100px]">
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${row.progress || 0}%` }}
                        />
                    </div>
                    <div className="text-[10px] text-right text-muted-foreground mt-1">
                        {row.progress || 0}%
                    </div>
                </div>
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
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="title">Onboarding</h1>
                    <p className="subtitle">Track candidate onboarding progress</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => router.push('/onboarding/new')}>
                        <Plus size={16} className="mr-2" />
                        Start Onboarding
                    </Button>
                </div>
            </div>

            <DynamicTable<OnboardingRecord>
                id="onboarding-table"
                data={records}
                columns={columns}
                onRowClick={(row) => {
                    setSelectedRecord(row);
                    setIsDetailOpen(true);
                }}
                isLoading={loading}
                emptyMessage="No active onboarding records."
            />

            <DetailModal
                isOpen={isDetailOpen}
                onClose={() => {
                    setIsDetailOpen(false);
                    setSelectedRecord(null);
                }}
                type="onboarding"
                id={selectedRecord?.id || ''}
                title={`Onboarding: ${selectedRecord?.candidateName}`}
            />
        </div>
    );
}
