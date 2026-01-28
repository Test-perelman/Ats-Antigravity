'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/firebase/AuthContext';
import { db } from '../../lib/firebase/config';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Button } from '../../components/ui/button';
import { Plus, Building, Users } from 'lucide-react';
import DynamicTable, { Column } from '../../components/ui/DynamicTable';
import DetailModal from '../../components/ui/DetailModal';

interface Client {
    id: string;
    name: string;
    industry?: string;
    contactPerson?: string;
    email?: string;
    createdAt?: any;
}

export default function ClientsPage() {
    const router = useRouter();
    const { userData } = useAuth();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

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

    const columns: Column<Client>[] = [
        {
            id: 'name',
            label: 'Client Name',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-full text-primary shrink-0">
                        <Building size={16} />
                    </div>
                    <div>
                        <div className="font-bold">{row.name}</div>
                        {row.industry && <div className="text-xs text-muted-foreground uppercase">{row.industry}</div>}
                    </div>
                </div>
            )
        },
        {
            id: 'contact',
            label: 'Contact Person',
            render: (row) => (
                <div className="text-sm">
                    {row.contactPerson && <div className="flex items-center gap-2 font-medium"><Users size={14} /> {row.contactPerson}</div>}
                </div>
            )
        },
        {
            id: 'email',
            label: 'Email',
            render: (row) => (
                <div className="text-sm text-muted-foreground">{row.email}</div>
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
                    <h1 className="title">Clients</h1>
                    <p className="subtitle">Manage external clients</p>
                </div>
                <Button onClick={() => router.push('/clients/new')}>
                    <Plus size={16} className="mr-2" />
                    Add Client
                </Button>
            </div>

            <DynamicTable<Client>
                id="clients-table"
                data={clients}
                columns={columns}
                onRowClick={(row) => {
                    setSelectedClient(row);
                    setIsDetailOpen(true);
                }}
                isLoading={loading}
                emptyMessage="No clients yet."
            />

            <DetailModal
                isOpen={isDetailOpen}
                onClose={() => {
                    setIsDetailOpen(false);
                    setSelectedClient(null);
                }}
                type="client"
                id={selectedClient?.id || ''}
                title={`Client: ${selectedClient?.name}`}
            />
        </div>
    );
}
