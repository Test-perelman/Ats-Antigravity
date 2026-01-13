'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/firebase/AuthContext';
import { db } from '../../../lib/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '../../../components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function NewVendorPage() {
    const router = useRouter();
    const { userData } = useAuth();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        serviceType: 'General',
        email: '',
        phone: '',
        website: '',
        status: 'active',
        streetAddress: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        paymentTerms: '',
        paymentTermsDays: '',
        ein: '',
        w9Received: false,
        msaSigned: false,
        notes: '',
        tier: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!userData?.teamId) {
            alert('Error: No team associated.');
            setLoading(false);
            return;
        }

        try {
            await addDoc(collection(db, 'teams', userData.teamId, 'vendors'), {
                ...formData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                createdBy: userData.uid
            });

            router.push('/vendors');
        } catch (error) {
            console.error('Failed to create vendor', error);
            alert('Failed to save vendor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container p-6 max-w-3xl">
            <Button variant="ghost" onClick={() => router.back()} className="mb-6 pl-0 hover:bg-transparent hover:text-primary">
                <ArrowLeft size={16} className="mr-2" />
                Back to Vendors
            </Button>

            <div className="bg-white border rounded-xl shadow-md p-6">
                <h1 className="text-2xl font-bold mb-6 text-gray-900">Add New Vendor</h1>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Basic Information */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Basic Information</h2>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name <span className="text-red-500">*</span></label>
                                <input
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Acme Staffing Solutions"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tier Level</label>
                                <select
                                    value={formData.tier}
                                    onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-white"
                                >
                                    <option value="">Select an option...</option>
                                    <option value="Tier 1">Tier 1 (Preferred)</option>
                                    <option value="Tier 2">Tier 2</option>
                                    <option value="Tier 3">Tier 3</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mt-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                                <input
                                    value={formData.website}
                                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                    placeholder="https://www.example.com"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                            <div className="flex items-center pt-6">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.status === 'active'}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'active' : 'inactive' })}
                                        className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Active Vendor</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Contact Information</h2>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                                <input
                                    value={formData.contactName}
                                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                                    placeholder="John Doe"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                                <input
                                    type="email"
                                    value={formData.contactEmail}
                                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                                    placeholder="john@example.com"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                            <input
                                value={formData.contactPhone}
                                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                                placeholder="123-456-7890"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Address</h2>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                            <input
                                value={formData.streetAddress}
                                onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                                placeholder="123 Main Street"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                <input
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    placeholder="New York"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                <input
                                    value={formData.state}
                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                    placeholder="NY"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6 mt-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                                <input
                                    value={formData.zip}
                                    onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                                    placeholder="10001"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                <input
                                    value={formData.country}
                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                    placeholder="USA"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Business Details */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Business Details</h2>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                                <input
                                    value={formData.paymentTerms}
                                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                                    placeholder="Net 30, Net 45, etc."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms (Days)</label>
                                <input
                                    type="number"
                                    value={formData.paymentTermsDays}
                                    onChange={(e) => setFormData({ ...formData, paymentTermsDays: e.target.value })}
                                    placeholder="30"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mt-4">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.w9Received}
                                    onChange={(e) => setFormData({ ...formData, w9Received: e.target.checked })}
                                    className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                                />
                                <span className="ml-2 text-sm text-gray-700">W9 Received</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.msaSigned}
                                    onChange={(e) => setFormData({ ...formData, msaSigned: e.target.checked })}
                                    className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                                />
                                <span className="ml-2 text-sm text-gray-700">MSA Signed</span>
                            </label>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">EIN (Tax ID)</label>
                            <input
                                value={formData.ein}
                                onChange={(e) => setFormData({ ...formData, ein: e.target.value })}
                                placeholder="12-3456789"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Internal Notes */}
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Internal Notes</h2>
                        <textarea
                            rows={4}
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                            placeholder="Add any internal notes about this vendor..."
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
                        <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
                            {loading ? 'Saving...' : 'Add Vendor'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
