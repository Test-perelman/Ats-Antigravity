'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/firebase/AuthContext';
import { db } from '../../../lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '../../../components/ui/button';
import { ArrowLeft, MapPin, Globe, Phone, Mail } from 'lucide-react';
import NotesList from '../../../components/NotesList';

export default function ClientDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { userData } = useAuth();
    const { id } = React.use(params);
    const [client, setClient] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userData?.teamId || !id) return;

        const fetchClient = async () => {
            try {
                const docRef = doc(db, 'teams', userData.teamId, 'clients', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setClient({ id: docSnap.id, ...docSnap.data() });
                }
            } catch (err) {
                console.error("Error fetching client:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchClient();
    }, [userData?.teamId, id]);

    if (loading) return <div className="p-8 text-center">Loading client details...</div>;
    if (!client) return <div className="p-8 text-center">Client not found.</div>;

    return (
        <div className="container p-6 max-w-5xl">
            <Button variant="ghost" onClick={() => router.back()} className="mb-6 pl-0 hover:bg-transparent hover:text-primary">
                <ArrowLeft size={16} className="mr-2" />
                Back to Clients
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white border rounded-xl shadow-sm p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
                                <p className="text-primary font-medium">{client.industry}</p>
                            </div>
                            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-50 text-green-700 capitalize">
                                Active
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-6">
                            <div className="flex items-center gap-2">
                                <Mail size={16} />
                                <a href={`mailto:${client.email}`} className="hover:text-primary transition-colors">{client.email}</a>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone size={16} />
                                {client.phone || 'N/A'}
                            </div>
                            <div className="flex items-center gap-2">
                                <Globe size={16} />
                                <a href={client.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">{client.website || 'N/A'}</a>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin size={16} />
                                {client.location || 'N/A'}
                            </div>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                            <p className="text-gray-600">{client.description || 'No description provided.'}</p>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-1">
                    <NotesList parentId={id} parentType="clients" />
                </div>
            </div>
        </div>
    );
}
