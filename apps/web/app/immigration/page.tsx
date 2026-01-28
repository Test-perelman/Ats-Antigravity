'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/firebase/AuthContext';
import { db } from '../../lib/firebase/config';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Button } from '../../components/ui/button';
import { Plus, ArrowLeft, AlertCircle, Calendar } from 'lucide-react';
import DynamicTable, { Column } from '../../components/ui/DynamicTable';
import DetailModal from '../../components/ui/DetailModal';

interface ImmigrationCase {
    id: string;
    candidateName: string;
    visaType: string;
    status: string;
    expiryDate: string;
    createdAt?: any;
}

const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case 'active': return 'bg-green-100 text-green-800';
        case 'expired': return 'bg-red-100 text-red-800';
        case 'rfe': return 'bg-yellow-100 text-yellow-800';
        case 'pending': return 'bg-blue-100 text-blue-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

export default function ImmigrationPage() {
    const router = useRouter();
    const { userData } = useAuth();
    const [cases, setCases] = useState<ImmigrationCase[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCase, setSelectedCase] = useState<ImmigrationCase | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    useEffect(() => {
        if (!userData?.teamId) return;

        const q = query(
            collection(db, 'teams', userData.teamId, 'immigration'),
            orderBy('expiryDate', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as ImmigrationCase[];
            setCases(list);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching immigration cases:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userData?.teamId]);

    const columns: Column<ImmigrationCase>[] = [
        {
            id: 'candidate',
            label: 'Candidate',
            render: (row) => <div className="font-bold text-lg text-gray-900">{row.candidateName}</div>
        },
        {
            id: 'visa',
            label: 'Visa Type',
            render: (row) => <div className="text-sm font-medium text-primary">{row.visaType}</div>
        },
        {
            id: 'status',
            label: 'Status',
            render: (row) => (
                <div className="flex flex-col gap-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${getStatusColor(row.status)} w-fit`}>
                        {row.status}
                    </span>
                    {row.status === 'rfe' && (
                        <div className="text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle size={12} /> Action Required
                        </div>
                    )}
                </div>
            )
        },
        {
            id: 'expiry',
            label: 'Expiry Date',
            render: (row) => (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={14} />
                    <span>{row.expiryDate}</span>
                </div>
            )
        },
        {
            id: 'actions',
            label: 'Actions',
            render: () => (
                <Button variant="ghost" size="sm">View</Button>
            )
        }
    ];

    return (
        <div className="container p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <Button variant="ghost" onClick={() => router.push('/dashboard')} className="mb-2 pl-0 hover:bg-transparent hover:text-primary p-0 h-auto">
                        <ArrowLeft size={16} className="mr-2" />
                        Back to Dashboard
                    </Button>
                    <h1 className="title">Immigration Tracking</h1>
                    <p className="subtitle">Monitor visa statuses and expiries</p>
                </div>
                <Button onClick={() => router.push('/immigration/new')}>
                    <Plus size={16} className="mr-2" />
                    New Case
                </Button>
            </div>

            <DynamicTable<ImmigrationCase>
                id="immigration-table"
                data={cases}
                columns={columns}
                isLoading={loading}
                onRowClick={(row) => {
                    setSelectedCase(row);
                    setIsDetailOpen(true);
                }}
                emptyMessage="No active cases."
            />

            <DetailModal
                isOpen={isDetailOpen}
                onClose={() => {
                    setIsDetailOpen(false);
                    setSelectedCase(null);
                }}
                type="immigration"
                id={selectedCase?.id || ''}
                title={`Case: ${selectedCase?.candidateName}`}
            />
        </div>
    );
}
