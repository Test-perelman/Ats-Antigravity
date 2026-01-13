'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/firebase/AuthContext';
import { db } from '../../../lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '../../../components/ui/button';
import { ArrowLeft, User, Mail, Phone, Briefcase, Globe } from 'lucide-react';
import NotesList from '../../../components/NotesList';

export default function CandidateDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { userData } = useAuth();
    const { id } = React.use(params);
    const [candidate, setCandidate] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userData?.teamId || !id) return;

        const fetchCandidate = async () => {
            try {
                const docRef = doc(db, 'teams', userData.teamId, 'candidates', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setCandidate({ id: docSnap.id, ...docSnap.data() });
                } else {
                    console.log("No such document!");
                }
            } catch (err) {
                console.error("Error fetching candidate:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchCandidate();
    }, [userData?.teamId, id]);

    if (loading) return <div className="p-8 text-center">Loading candidate details...</div>;
    if (!candidate) return <div className="p-8 text-center">Candidate not found.</div>;

    return (
        <div className="container p-6 max-w-5xl">
            <Button variant="ghost" onClick={() => router.back()} className="mb-6 pl-0 hover:bg-transparent hover:text-primary">
                <ArrowLeft size={16} className="mr-2" />
                Back to Candidates
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white border rounded-xl shadow-sm p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{candidate.firstName} {candidate.lastName}</h1>
                                <p className="text-primary font-medium">{candidate.title}</p>
                            </div>
                            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-50 text-blue-700 capitalize">
                                {candidate.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-6">
                            <div className="flex items-center gap-2">
                                <Mail size={16} />
                                {candidate.email}
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone size={16} />
                                {candidate.phone || 'N/A'}
                            </div>
                            <div className="flex items-center gap-2">
                                <Briefcase size={16} />
                                Exp: {candidate.experience ? `${candidate.experience} years` : 'N/A'}
                            </div>
                            <div className="flex items-center gap-2">
                                <Globe size={16} />
                                Visa: {candidate.visaStatus || 'N/A'}
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {candidate.skills && candidate.skills.length > 0 ? (
                                    candidate.skills.map((skill: string, idx: number) => (
                                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                            {skill}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-gray-400 text-sm">No skills listed</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-1">
                    <NotesList parentId={id} parentType="candidates" />
                </div>
            </div>
        </div>
    );
}
