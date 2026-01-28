'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/firebase/AuthContext';
import { db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { Calendar, AlertCircle } from 'lucide-react';
import NotesList from '../NotesList';

interface ImmigrationDetailViewProps {
    caseId: string;
}

export default function ImmigrationDetailView({ caseId }: ImmigrationDetailViewProps) {
    const { userData } = useAuth();
    const [caseData, setCaseData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userData?.teamId || !caseId) return;

        const fetchCase = async () => {
            try {
                const docRef = doc(db, 'teams', userData.teamId, 'immigration', caseId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setCaseData({ id: docSnap.id, ...docSnap.data() });
                }
            } catch (err) {
                console.error("Error fetching immigration case:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCase();
    }, [userData?.teamId, caseId]);

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

    if (loading) return <div className="p-8 text-center">Loading case details...</div>;
    if (!caseData) return <div className="p-8 text-center">Case not found.</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
                <div className="bg-white border rounded-xl shadow-sm p-6">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{caseData.candidateName}</h1>
                            <p className="text-primary font-medium text-lg">{caseData.visaType}</p>
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-sm font-semibold uppercase ${getStatusColor(caseData.status)}`}>
                            {caseData.status}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700 mb-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <label className="text-xs text-gray-500 uppercase font-bold tracking-wide block mb-1">Expiry Date</label>
                            <div className="flex items-center gap-2 text-lg font-medium">
                                <Calendar size={20} className="text-gray-400" />
                                <span>{caseData.expiryDate}</span>
                            </div>
                        </div>

                        {caseData.status === 'rfe' && (
                            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                <label className="text-xs text-yellow-700 uppercase font-bold tracking-wide block mb-1">Alert</label>
                                <div className="flex items-center gap-2 text-red-600 font-medium">
                                    <AlertCircle size={20} />
                                    <span>RFE Response Required</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Notes / Description</h3>
                        <p className="text-gray-600 whitespace-pre-wrap">{caseData.description || 'No additional notes provided.'}</p>
                    </div>
                </div>
            </div>

            <div className="md:col-span-1">
                <NotesList parentId={caseId} parentType="immigration" />
            </div>
        </div>
    );
}
