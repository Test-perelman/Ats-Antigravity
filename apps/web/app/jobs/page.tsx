// ... imports
import DynamicTable, { Column } from '../../components/ui/DynamicTable';
import DetailModal from '../../components/ui/DetailModal';

// ... interface Job

export default function JobsPage() {
    const router = useRouter();
    const { userData } = useAuth();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    useEffect(() => {
        if (!userData?.teamId) return;

        // Reference to the team's jobs collection
        const q = query(
            collection(db, 'teams', userData.teamId, 'jobs'),
            orderBy('createdAt', 'desc')
        );

        // Real-time listener
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Job[];
            setJobs(list);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching jobs:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userData?.teamId]);

    const columns: Column<Job>[] = [
        {
            id: 'title',
            label: 'Job Title',
            render: (row) => (
                <div>
                    <div className="font-bold text-primary">{row.title}</div>
                    {(row.clientName && row.clientName !== 'Unknown') && (
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Building size={12} /> {row.clientName}
                        </div>
                    )}
                </div>
            )
        },
        {
            id: 'details',
            label: 'Location & Rate',
            render: (row) => (
                <div className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <MapPin size={12} /> {row.location || 'Remote'}
                    </div>
                    {row.maxRate && (
                        <div className="flex items-center gap-1">
                            <DollarSign size={12} /> {row.maxRate}
                        </div>
                    )}
                </div>
            )
        },
        {
            id: 'submissions',
            label: 'Candidates',
            render: (row) => (
                <div className="text-center">
                    <div className="font-bold">{row._count?.submissions || 0}</div>
                    <div className="text-[10px] text-muted-foreground uppercase">Submissions</div>
                </div>
            )
        },
        {
            id: 'status',
            label: 'Status',
            render: (row) => (
                <span className={`capitalize px-2 py-0.5 rounded text-xs font-semibold ${row.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {row.status}
                </span>
            )
        },
        {
            id: 'actions',
            label: 'Actions',
            render: () => (
                <Button variant="ghost" size="sm">
                    <MoreHorizontal size={16} />
                </Button>
            )
        }
    ];

    return (
        <div className="container p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="title">Job Board</h1>
                    <p className="subtitle">Manage open requirements</p>
                </div>
                <Button onClick={() => router.push('/jobs/new')}>
                    <Plus size={16} className="mr-2" />
                    Post New Job
                </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 mb-6">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search jobs..."
                        className="pl-10 w-full p-2 border rounded"
                    />
                </div>
            </div>

            {/* Dynamic Table */}
            <DynamicTable<Job>
                id="jobs-table"
                data={jobs}
                columns={columns}
                onRowClick={(row) => {
                    setSelectedJob(row);
                    setIsDetailOpen(true);
                }}
                isLoading={loading}
                emptyMessage="No jobs posted yet."
            />

            <DetailModal
                isOpen={isDetailOpen}
                onClose={() => {
                    setIsDetailOpen(false);
                    setSelectedJob(null);
                }}
                type="job"
                id={selectedJob?.id || ''}
                title={`Job: ${selectedJob?.title}`}
            />
        </div>

    );
}
