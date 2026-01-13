'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/firebase/AuthContext';
import { db } from '../../lib/firebase/config';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Button } from '../../components/ui/button';
import { Plus, Search, FileText, Download, DollarSign, Calendar } from 'lucide-react';

interface Invoice {
    id: string;
    invoiceNumber: string;
    clientName: string;
    amount: number;
    issueDate: string;
    dueDate: string;
    status: 'draft' | 'sent' | 'paid' | 'overdue';
}

export default function InvoicesPage() {
    const router = useRouter();
    const { userData } = useAuth();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userData?.teamId) return;

        const q = query(
            collection(db, 'teams', userData.teamId, 'invoices'),
            orderBy('issueDate', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Invoice[];
            setInvoices(list);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching invoices:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userData?.teamId]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-800';
            case 'sent': return 'bg-blue-100 text-blue-800';
            case 'overdue': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="container p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="title">Invoices</h1>
                    <p className="subtitle">Manage billing and payments</p>
                </div>
                <Button onClick={() => router.push('/invoices/new')}>
                    <Plus size={16} className="mr-2" />
                    Create Invoice
                </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 mb-6">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search invoices..."
                        className="pl-10 w-full p-2 border rounded"
                    />
                </div>
            </div>

            <div className="border rounded-lg shadow-sm bg-white overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 font-medium text-gray-500">Invoice #</th>
                            <th className="p-4 font-medium text-gray-500">Client</th>
                            <th className="p-4 font-medium text-gray-500">Dates</th>
                            <th className="p-4 font-medium text-gray-500">Amount</th>
                            <th className="p-4 font-medium text-gray-500">Status</th>
                            <th className="p-4 font-medium text-gray-500 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {loading ? (
                            <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading invoices...</td></tr>
                        ) : invoices.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-12 text-center">
                                    <FileText className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                                    <h3 className="text-lg font-medium text-gray-900">No invoices yet</h3>
                                    <p className="text-muted-foreground mb-4">Create your first invoice to get started.</p>
                                    <Button variant="outline" onClick={() => router.push('/invoices/new')}>Create Invoice</Button>
                                </td>
                            </tr>
                        ) : (
                            invoices.map((inv) => (
                                <tr key={inv.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => console.log('View invoice', inv.id)}>
                                    <td className="p-4 font-medium text-primary">{inv.invoiceNumber}</td>
                                    <td className="p-4">{inv.clientName}</td>
                                    <td className="p-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-1"><Calendar size={12} /> Issued: {inv.issueDate}</div>
                                        <div className="flex items-center gap-1 text-xs text-gray-400">Due: {inv.dueDate}</div>
                                    </td>
                                    <td className="p-4 font-medium">
                                        ${Number(inv.amount).toLocaleString()}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${getStatusColor(inv.status)}`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <Button variant="ghost" size="sm">
                                            <Download size={16} />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
