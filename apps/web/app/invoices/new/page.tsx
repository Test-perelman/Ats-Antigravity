'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/firebase/AuthContext';
import { db } from '../../../lib/firebase/config';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { Button } from '../../../components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface Client {
    id: string;
    name: string;
}

export default function NewInvoicePage() {
    const router = useRouter();
    const { userData } = useAuth();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        invoiceNumber: '',
        clientId: '',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        amount: '',
        status: 'draft',
        notes: ''
    });

    useEffect(() => {
        if (!userData?.teamId) return;
        const fetchClients = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'teams', userData.teamId, 'clients'));
                setClients(querySnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name })));

                // Simple auto-generate attempt for Invoice # (random for now, could be smarter)
                const randomNum = Math.floor(1000 + Math.random() * 9000);
                setFormData(prev => ({ ...prev, invoiceNumber: `INV-${new Date().getFullYear()}-${randomNum}` }));
            } catch (err) {
                console.error("Failed to fetch clients", err);
            }
        };
        fetchClients();
    }, [userData?.teamId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!userData?.teamId) {
            alert('Error: No team associated.');
            setLoading(false);
            return;
        }

        try {
            const selectedClient = clients.find(c => c.id === formData.clientId);

            await addDoc(collection(db, 'teams', userData.teamId, 'invoices'), {
                ...formData,
                clientName: selectedClient?.name || 'Unknown',
                amount: Number(formData.amount),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                createdBy: userData.uid
            });

            router.push('/invoices');
        } catch (error) {
            console.error('Failed to create invoice', error);
            alert('Failed to save invoice');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container p-6 max-w-3xl">
            <Button variant="ghost" onClick={() => router.back()} className="mb-6 pl-0 hover:bg-transparent hover:text-primary">
                <ArrowLeft size={16} className="mr-2" />
                Back to Invoices
            </Button>

            <div className="bg-white border rounded-xl shadow-md p-6">
                <h1 className="text-2xl font-bold mb-6 text-gray-900">Create New Invoice</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                            <input
                                required
                                value={formData.invoiceNumber}
                                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                            <select
                                required
                                value={formData.clientId}
                                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                            >
                                <option value="">-- Select Client --</option>
                                {clients.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                            <input
                                type="date"
                                required
                                value={formData.issueDate}
                                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                            <input
                                type="date"
                                required
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-white"
                            >
                                <option value="draft">Draft</option>
                                <option value="sent">Sent</option>
                                <option value="paid">Paid</option>
                                <option value="overdue">Overdue</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount ($)</label>
                        <input
                            type="number"
                            required
                            placeholder="0.00"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary text-lg font-bold"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes / Description</label>
                        <textarea
                            rows={3}
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Services rendered..."
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
                        <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
                            {loading ? 'Saving...' : 'Create Invoice'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
