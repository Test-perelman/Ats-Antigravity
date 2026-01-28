'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/firebase/AuthContext';
import { db } from '../../lib/firebase/config';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Button } from '../../components/ui/button';
import { Plus, Search, Truck } from 'lucide-react';
import DynamicTable, { Column } from '../../components/ui/DynamicTable';
import DetailModal from '../../components/ui/DetailModal';

interface Vendor {
    id: string;
    name: string;
    serviceType?: string;
    contactPerson?: string;
    email?: string;
    createdAt?: any;
}

export default function VendorsPage() {
    const router = useRouter();
    const { userData } = useAuth();
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    useEffect(() => {
        if (!userData?.teamId) return;

        const q = query(
            collection(db, 'teams', userData.teamId, 'vendors'),
            orderBy('name', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Vendor[];
            setVendors(list);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching vendors:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userData?.teamId]);

    const columns: Column<Vendor>[] = [
        {
            id: 'name',
            label: 'Vendor Name',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-full text-primary shrink-0">
                        <Truck size={16} />
                    </div>
                    <div>
                        <div className="font-bold">{row.name}</div>
                        {row.serviceType && <div className="text-xs text-muted-foreground">{row.serviceType}</div>}
                    </div>
                </div>
            )
        },
        {
            id: 'contact',
            label: 'Contact',
            render: (row) => (
                <div className="text-sm">
                    {row.contactPerson && <div className="font-medium">{row.contactPerson}</div>}
                    {row.email && <div className="text-muted-foreground">{row.email}</div>}
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
                    <h1 className="title">Vendor Management</h1>
                    <p className="subtitle">Manage external suppliers and partners</p>
                </div>
                <Button onClick={() => router.push('/vendors/new')}>
                    <Plus size={16} className="mr-2" />
                    Add Vendor
                </Button>
            </div>

            <div className="flex items-center gap-4 mb-6">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search vendors..."
                        className="pl-10 w-full p-2 border rounded"
                    />
                </div>
            </div>

            <DynamicTable<Vendor>
                id="vendors-table"
                data={vendors}
                columns={columns}
                isLoading={loading}
                onRowClick={(row) => {
                    setSelectedVendor(row);
                    setIsDetailOpen(true);
                }}
                emptyMessage="No vendors found."
            />

            <DetailModal
                isOpen={isDetailOpen}
                onClose={() => {
                    setIsDetailOpen(false);
                    setSelectedVendor(null);
                }}
                type="vendor"
                id={selectedVendor?.id || ''}
                title={`Vendor: ${selectedVendor?.name}`}
            />
        </div>
    );
}
