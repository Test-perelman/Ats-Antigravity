'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Calendar, Download, Plus, Search } from 'lucide-react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/lib/firebase/AuthContext';
import { Button } from '@/components/ui/button';
import DynamicTable, { Column } from '../../components/ui/DynamicTable';

interface Invoice {
    id: string;
    invoiceNumber: string;
    clientName: string;
    issueDate: string;
    dueDate: string;
    amount: number;
    status: 'draft' | 'sent' | 'paid' | 'overdue';
}

export default function InvoicesPage() {
    const router = useRouter();
    const { userData } = useAuth();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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

    const filteredInvoices = invoices.filter((invoice) => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return true;
        return [
            invoice.invoiceNumber,
            invoice.clientName,
            invoice.issueDate,
            invoice.dueDate,
            invoice.amount,
            invoice.status,
        ].some((value) => String(value || '').toLowerCase().includes(term));
    });

    const downloadInvoice = (invoice: Invoice) => {
        const lines = [
            ['Invoice Number', invoice.invoiceNumber],
            ['Client', invoice.clientName],
            ['Issue Date', invoice.issueDate],
            ['Due Date', invoice.dueDate],
            ['Amount', String(invoice.amount)],
            ['Status', invoice.status],
        ];
        const blob = new Blob([lines.map((line) => line.join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `${invoice.invoiceNumber || 'invoice'}.csv`;
        anchor.click();
        URL.revokeObjectURL(url);
    };

    const columns: Column<Invoice>[] = [
        {
            id: 'invoiceNumber',
            label: 'Invoice #',
            render: (row) => <div className="font-medium text-primary">{row.invoiceNumber}</div>
        },
        {
            id: 'client',
            label: 'Client',
            render: (row) => row.clientName
        },
        {
            id: 'dates',
            label: 'Dates',
            render: (row) => (
                <div className="text-sm text-gray-600">
                    <div className="flex items-center gap-1"><Calendar size={12} /> Issued: {row.issueDate}</div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">Due: {row.dueDate}</div>
                </div>
            )
        },
        {
            id: 'amount',
            label: 'Amount',
            render: (row) => <div className="font-medium">${Number(row.amount).toLocaleString()}</div>
        },
        {
            id: 'status',
            label: 'Status',
            render: (row) => (
                <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${getStatusColor(row.status)}`}>
                    {row.status}
                </span>
            )
        },
        {
            id: 'actions',
            label: 'Actions',
            render: (row) => (
                <div className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => downloadInvoice(row)}>
                        <Download size={16} />
                    </Button>
                </div>
            )
        }
    ];

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
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        className="pl-10 w-full p-2 border rounded"
                    />
                </div>
            </div>

            <DynamicTable<Invoice>
                id="invoices-table"
                data={filteredInvoices}
                columns={columns}
                // onRowClick={(row) => console.log('View invoice', row.id)}
                isLoading={loading}
                emptyMessage="No invoices yet."
            />
        </div>
    );
}
