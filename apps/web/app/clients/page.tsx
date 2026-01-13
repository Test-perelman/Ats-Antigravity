'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/firebase/AuthContext';
import { db } from '../../lib/firebase/config';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Button } from '../../components/ui/button';
import { Building, Plus, Users, Loader2 } from 'lucide-react';

interface Client {
    id: string;
    name: string;
    contactPerson: string;
    email: string;
    industry?: string;
    // _count?: { projects: number }; // TODO: implement counters or sub-queries
}

export default function ClientsPage() {
    const router = useRouter();
    const { userData } = useAuth();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userData?.teamId) return;

        // Reference to the team's clients collection
        const q = query(
            collection(db, 'teams', userData.teamId, 'clients'),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Client[];
            setClients(list);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching clients:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userData?.teamId]);

    return (
        <div className="container p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="title">Clients</h1>
                    <p className="subtitle">Manage external clients</p>
                </div>
                <Button onClick={() => router.push('/clients/new')}>
                    <Plus size={16} className="mr-2" />
                    Add Client
                </Button>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : clients.length === 0 ? (
                    <div className="p-12 text-center border rounded dashed bg-secondary/30">
                        <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium">No clients yet</h3>
                        <p className="text-muted-foreground mb-4">Add your first client to start creating projects.</p>
                        <Button onClick={() => router.push('/clients/new')}>Add Client</Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {clients.map((client) => (
                            <div key={client.id} onClick={() => router.push(`/clients/${client.id}`)} className="bg-card border rounded p-6 shadow hover:shadow-md transition-all cursor-pointer">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                                        <Building size={24} />
                                    </div>
                                    {/* Placeholder for project count if needed later */}
                                    {/* <div className="text-lg font-bold text-muted-foreground/30">
                                        0 Proj
                                    </div> */}
                                </div>
                                <h3 className="font-bold text-lg mb-1">{client.name}</h3>
                                {client.industry && <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{client.industry}</div>}
                                <div className="text-sm text-muted-foreground space-y-1">
                                    {client.contactPerson && <div className="flex items-center gap-2"><Users size={14} /> {client.contactPerson}</div>}
                                    {client.email && <div className="text-xs truncate" title={client.email}>{client.email}</div>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
