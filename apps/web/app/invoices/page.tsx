// ... imports
import DynamicTable, { Column } from '../../components/ui/DynamicTable';

// ... interface Invoice

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
            render: () => (
                <div className="text-right">
                    <Button variant="ghost" size="sm">
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
                        className="pl-10 w-full p-2 border rounded"
                    />
                </div>
            </div>

            <DynamicTable<Invoice>
                id="invoices-table"
                data={invoices}
                columns={columns}
                // onRowClick={(row) => console.log('View invoice', row.id)}
                isLoading={loading}
                emptyMessage="No invoices yet."
            />
        </div>
    );
}
