// ... imports
import DynamicTable, { Column } from '../../components/ui/DynamicTable';

// ... interface Timesheet

export default function TimesheetsPage() {
    const router = useRouter();
    const { userData } = useAuth();
    const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userData?.teamId) return;

        // Reference to the team's timesheets collection
        const q = query(
            collection(db, 'teams', userData.teamId, 'timesheets'),
            orderBy('weekEnding', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Timesheet[];
            setTimesheets(list);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching timesheets:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userData?.teamId]);

    const statusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'approved': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            case 'submitted': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const columns: Column<Timesheet>[] = [
        {
            id: 'candidate',
            label: 'Candidate',
            render: (row) => <div className="font-medium">{row.candidateName || 'Unknown'}</div>
        },
        {
            id: 'project',
            label: 'Project',
            render: (row) => row.projectName || 'Unknown'
        },
        {
            id: 'weekEnding',
            label: 'Week Ending',
            render: (row) => (
                <div className="text-muted-foreground">
                    {row.weekEnding?.toDate ? row.weekEnding.toDate().toLocaleDateString() : new Date(row.weekEnding).toLocaleDateString()}
                </div>
            )
        },
        {
            id: 'hours',
            label: 'Hours',
            render: (row) => <div className="font-bold">{row.totalHours}</div>
        },
        {
            id: 'status',
            label: 'Status',
            render: (row) => (
                <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${statusColor(row.status)}`}>
                    {row.status}
                </span>
            )
        },
        {
            id: 'actions',
            label: 'Actions',
            render: () => (
                <div className="text-right">
                    <Button variant="ghost" size="sm">View</Button>
                </div>
            )
        }
    ];

    return (
        <div className="container p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="title">Timesheets</h1>
                    <p className="subtitle">Track hours and approvals</p>
                </div>
                <Button onClick={() => router.push('/timesheets/new')}>
                    <Plus size={16} className="mr-2" />
                    Log Time
                </Button>
            </div>

            <DynamicTable<Timesheet>
                id="timesheets-table"
                data={timesheets}
                columns={columns}
                isLoading={loading}
                emptyMessage="No timesheets found."
            />
        </div>
    );
}
