'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/firebase/AuthContext';
import { db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { ClipboardCheck, Building2, User, Calendar } from 'lucide-react';
import NotesList from '../NotesList';

interface OnboardingDetailViewProps {
    recordId: string;
}

export default function OnboardingDetailView({ recordId }: OnboardingDetailViewProps) {
    const { userData } = useAuth();
    const [record, setRecord] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userData?.teamId || !recordId) return;

        const fetchRecord = async () => {
            try {
                const docRef = doc(db, 'teams', userData.teamId, 'onboarding', recordId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setRecord({ id: docSnap.id, ...docSnap.data() });
                }
            } catch (err) {
                console.error("Error fetching onboarding record:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchRecord();
    }, [userData?.teamId, recordId]);

    const formatDate = (timestamp: any) => {
        if (!timestamp) return '-';
        if (timestamp.toDate) return timestamp.toDate().toLocaleDateString();
        return new Date(timestamp).toLocaleDateString();
    };

    if (loading) return <div className="p-8 text-center">Loading onboarding details...</div>;
    if (!record) return <div className="p-8 text-center">Record not found.</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">

                {/* Header Card */}
                <div className="bg-white border rounded-xl shadow-sm p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                                <User size={24} />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">{record.candidateName}</h1>
                                <p className="text-sm text-gray-500">{record.jobTitle}</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                                ${record.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    record.status === 'background_check' ? 'bg-amber-100 text-amber-800' :
                                        'bg-blue-100 text-blue-800'}`}>
                                {record.status ? record.status.replace('_', ' ') : 'INITIATED'}
                            </span>
                            <div className="text-xs text-gray-400">Progress: {record.progress || 0}%</div>
                        </div>
                    </div>

                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-6">
                        <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${record.progress || 0}%` }}
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <Building2 size={16} />
                            <span className="font-medium">Client:</span> {record.clientName}
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            <span className="font-medium">Start Date:</span> {formatDate(record.startDate)}
                        </div>
                    </div>
                </div>

                {/* Checklist (Placeholder Visualization) */}
                <div className="bg-white border rounded-xl shadow-sm p-6">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <ClipboardCheck size={20} />
                        Onboarding Checklist
                    </h3>
                    {/* If we had checklist items in data, map here. For now static placeholder or empty check */}
                    {record.checklist && record.checklist.length > 0 ? (
                        <ul className="space-y-2">
                            {record.checklist.map((item: any, idx: number) => (
                                <li key={idx} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                                    <input
                                        type="checkbox"
                                        checked={item.completed}
                                        readOnly
                                        className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                                    />
                                    <span className={item.completed ? "text-gray-400 line-through" : "text-gray-700"}>
                                        {item.label}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-400 italic text-sm">No checklist items configured.</p>
                    )}
                </div>

            </div>

            <div className="md:col-span-1">
                <NotesList parentId={recordId} parentType="onboarding" />
            </div>
        </div>
    );
}
