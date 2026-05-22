'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/firebase/AuthContext';
import { db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { Calendar, Building, DollarSign } from 'lucide-react';
import NotesList from '../NotesList';

interface PlacementDetailViewProps {
    placementId: string;
}

interface TimestampLike {
    toDate: () => Date;
}

interface PlacementRecord {
    id: string;
    name?: string;
    clientName?: string;
    status?: string;
    startDate?: unknown;
    endDate?: unknown;
    budget?: string | number;
    value?: string | number;
    description?: string;
}

function isTimestampLike(value: unknown): value is TimestampLike {
    return typeof value === 'object' && value !== null && 'toDate' in value && typeof (value as { toDate?: unknown }).toDate === 'function';
}

export default function PlacementDetailView({ placementId }: PlacementDetailViewProps) {
    const { userData } = useAuth();
    const [project, setProject] = useState<PlacementRecord | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userData?.teamId || !placementId) return;

        const fetchProject = async () => {
            try {
                // Keeping collection name 'projects' as per backend
                const docRef = doc(db, 'teams', userData.teamId, 'projects', placementId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setProject({ id: docSnap.id, ...docSnap.data() } as PlacementRecord);
                }
            } catch (err) {
                console.error("Error fetching placement:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [userData?.teamId, placementId]);

    const formatDate = (date: unknown) => {
        if (!date) return 'N/A';
        if (isTimestampLike(date)) return date.toDate().toLocaleDateString();
        return new Date(String(date)).toLocaleDateString();
    };

    if (loading) return <div className="p-8 text-center">Loading placement details...</div>;
    if (!project) return <div className="p-8 text-center">Placement not found.</div>;
    const value = Number(project.value ?? project.budget ?? 0);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
                <div className="bg-white border rounded-xl shadow-sm p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                            <div className="flex items-center gap-2 text-primary font-medium mt-1">
                                <Building size={16} />
                                {project.clientName}
                            </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${project.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {project.status}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-6">
                        <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            Start: {formatDate(project.startDate)}
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            End: {project.endDate ? formatDate(project.endDate) : 'Ongoing'}
                        </div>
                        <div className="flex items-center gap-2">
                            <DollarSign size={16} />
                            Value: ${value.toLocaleString()}
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                        <p className="text-gray-600">{project.description || 'No description provided.'}</p>
                    </div>
                </div>
            </div>

            <div className="md:col-span-1">
                <NotesList parentId={placementId} parentType="projects" />
            </div>
        </div>
    );
}
