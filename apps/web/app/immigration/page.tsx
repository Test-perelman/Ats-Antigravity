'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/firebase/AuthContext';
import { db } from '../../lib/firebase/config';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Button } from '../../components/ui/button';
import { Plus, Search, Globe, Calendar, AlertCircle, ArrowLeft } from 'lucide-react';

interface ImmigrationCase {
    id: string;
    candidateName: string;
    visaType: string;
    status: 'filed' | 'approved' | 'rfe' | 'denied' | 'expired';
    expiryDate: string;
}

export default function ImmigrationPage() {
    const router = useRouter();
    const { userData } = useAuth();
    const [cases, setCases] = useState<ImmigrationCase[]>([]);
    const [loading, setLoading] = useState(true);

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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800';
            case 'filed': return 'bg-blue-100 text-blue-800';
            case 'rfe': return 'bg-yellow-100 text-yellow-800';
            case 'denied': return 'bg-red-100 text-red-800';
            case 'expired': return 'bg-gray-200 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-3 text-center p-8 text-muted-foreground">Loading cases...</div>
                ) : cases.length === 0 ? (
                    <div className="col-span-3 text-center p-12 border rounded dashed bg-secondary/30">
                        <Globe className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No active cases</h3>
                        <p className="text-muted-foreground mb-4">Start tracking immigration statutes for candidates.</p>
                        <Button onClick={() => router.push('/immigration/new')}>New Case</Button>
                    </div>
                ) : (
                    cases.map((item) => (
                        <div key={item.id} className="bg-white border rounded-xl shadow-sm p-6 relative overflow-hidden group hover:shadow-md transition-shadow">
                            <div className={`absolute top-0 left-0 w-1 h-full ${getStatusColor(item.status).replace('bg-', 'bg-opacity-100 bg-').split(' ')[0]}`}></div>

                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg text-gray-900">{item.candidateName}</h3>
                                <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase ${getStatusColor(item.status)}`}>
                                    {item.status}
                                </span>
                            </div>

                            <div className="text-sm font-medium text-primary mb-4">{item.visaType}</div>

                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                <Calendar size={14} />
                                <span>Expires: {item.expiryDate}</span>
                            </div>

                            {item.status === 'rfe' && (
                                <div className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded flex items-center gap-1">
                                    <AlertCircle size={12} /> Action Required
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
