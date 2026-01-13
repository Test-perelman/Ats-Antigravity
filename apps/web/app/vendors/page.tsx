'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/firebase/AuthContext';
import { db } from '../../lib/firebase/config';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Button } from '../../components/ui/button';
import { Plus, Search, Truck, Mail, Phone, MoreHorizontal } from 'lucide-react';

interface Vendor {
    id: string;
    name: string;
    email: string;
    phone: string;
    serviceType: string;
    status: 'active' | 'inactive';
}

export default function VendorsPage() {
    const router = useRouter();
    const { userData } = useAuth();
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);

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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-3 text-center p-8 text-muted-foreground">Loading vendors...</div>
                ) : vendors.length === 0 ? (
                    <div className="col-span-3 text-center p-12 border rounded dashed bg-secondary/30">
                        <Truck className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No vendors found</h3>
                        <p className="text-muted-foreground mb-4">Add your first vendor to start tracking.</p>
                        <Button onClick={() => router.push('/vendors/new')}>Add Vendor</Button>
                    </div>
                ) : (
                    vendors.map((vendor) => (
                        <div key={vendor.id} className="bg-white border rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <Truck size={24} />
                                </div>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal size={16} />
                                </Button>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 mb-1">{vendor.name}</h3>
                            <div className="text-sm font-medium text-gray-500 mb-4">{vendor.serviceType}</div>

                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Mail size={14} />
                                    <a href={`mailto:${vendor.email}`} className="hover:text-primary transition-colors">{vendor.email}</a>
                                </div>
                                {vendor.phone && (
                                    <div className="flex items-center gap-2">
                                        <Phone size={14} />
                                        <span>{vendor.phone}</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 pt-4 border-t flex justify-between items-center">
                                <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${vendor.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {vendor.status}
                                </span>
                                <Button variant="link" className="text-primary p-0 h-auto text-sm">View Details</Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
