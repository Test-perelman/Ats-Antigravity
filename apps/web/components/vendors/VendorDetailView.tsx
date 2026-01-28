'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/firebase/AuthContext';
import { db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { MapPin, Globe, Phone, Mail, Truck } from 'lucide-react';
import NotesList from '../NotesList';

interface VendorDetailViewProps {
    vendorId: string;
}

export default function VendorDetailView({ vendorId }: VendorDetailViewProps) {
    const { userData } = useAuth();
    const [vendor, setVendor] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userData?.teamId || !vendorId) return;

        const fetchVendor = async () => {
            try {
                const docRef = doc(db, 'teams', userData.teamId, 'vendors', vendorId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setVendor({ id: docSnap.id, ...docSnap.data() });
                }
            } catch (err) {
                console.error("Error fetching vendor:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchVendor();
    }, [userData?.teamId, vendorId]);

    if (loading) return <div className="p-8 text-center">Loading vendor details...</div>;
    if (!vendor) return <div className="p-8 text-center">Vendor not found.</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
                <div className="bg-white border rounded-xl shadow-sm p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{vendor.name}</h1>
                            <p className="text-primary font-medium flex items-center gap-2">
                                <Truck size={16} />
                                {vendor.serviceType}
                            </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${vendor.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {vendor.status}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-6">
                        <div className="flex items-center gap-2">
                            <Mail size={16} />
                            <a href={`mailto:${vendor.email}`} className="hover:text-primary transition-colors">{vendor.email}</a>
                        </div>
                        <div className="flex items-center gap-2">
                            <Phone size={16} />
                            {vendor.phone || 'N/A'}
                        </div>
                        <div className="flex items-center gap-2">
                            <Globe size={16} />
                            <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">{vendor.website || 'N/A'}</a>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin size={16} />
                            {vendor.address || 'N/A'}
                        </div>
                    </div>
                </div>
            </div>

            <div className="md:col-span-1">
                <NotesList parentId={vendorId} parentType="vendors" />
            </div>
        </div>
    );
}
