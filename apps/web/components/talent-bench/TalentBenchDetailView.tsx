'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/firebase/AuthContext';
import { db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { Armchair, Mail, Phone, Briefcase, Globe } from 'lucide-react';
import NotesList from '../NotesList';

interface TalentBenchDetailViewProps {
    profileId: string;
}

export default function TalentBenchDetailView({ profileId }: TalentBenchDetailViewProps) {
    const { userData } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userData?.teamId || !profileId) return;

        const fetchProfile = async () => {
            try {
                const docRef = doc(db, 'teams', userData.teamId, 'talent_bench', profileId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setProfile({ id: docSnap.id, ...docSnap.data() });
                }
            } catch (err) {
                console.error("Error fetching bench profile:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [userData?.teamId, profileId]);

    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'Immediate';
        if (timestamp.toDate) return timestamp.toDate().toLocaleDateString();
        return new Date(timestamp).toLocaleDateString();
    };

    if (loading) return <div className="p-8 text-center">Loading profile...</div>;
    if (!profile) return <div className="p-8 text-center">Profile not found.</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
                <div className="bg-white border rounded-xl shadow-sm p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{profile.firstName} {profile.lastName}</h1>
                            <p className="text-primary font-medium">{profile.title}</p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                            ${profile.status === 'active' ? 'bg-green-100 text-green-800' :
                                profile.status === 'placed' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'}`}>
                            {profile.status || 'Active'}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-6">
                        <div className="flex items-center gap-2">
                            <Armchair size={16} />
                            Availability: {formatDate(profile.availabilityDate)}
                        </div>
                        <div className="flex items-center gap-2">
                            <Mail size={16} />
                            {profile.email}
                        </div>
                        <div className="flex items-center gap-2">
                            <Phone size={16} />
                            {profile.phone || 'N/A'}
                        </div>
                        <div className="flex items-center gap-2">
                            <Briefcase size={16} />
                            Exp: {profile.experience ? `${profile.experience} years` : 'N/A'}
                        </div>
                        <div className="flex items-center gap-2">
                            <Globe size={16} />
                            Visa: {profile.visaStatus || 'N/A'}
                        </div>
                        {profile.rate && (
                            <div className="flex items-center gap-2 font-semibold">
                                Rate: {profile.rate}
                            </div>
                        )}
                        {profile.vendor && (
                            <div className="flex items-center gap-2 text-gray-500">
                                Vendor: {profile.vendor}
                            </div>
                        )}
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                            {profile.skills && profile.skills.length > 0 ? (
                                profile.skills.map((skill: string, idx: number) => (
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
                <NotesList parentId={profileId} parentType="talent_bench" />
            </div>
        </div>
    );
}
