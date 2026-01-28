// ... imports
import DynamicTable, { Column } from '../../components/ui/DynamicTable';
import DetailModal from '../../components/ui/DetailModal';

// ... interface Project

export default function ProjectsPage() {
    const router = useRouter();
    const { userData } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    useEffect(() => {
        if (!userData?.teamId) return;
        // ... (existing query logic)
        const q = query(
            collection(db, 'teams', userData.teamId, 'projects'),
            orderBy('startDate', 'desc')
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Project[];
            setProjects(list);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching projects:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userData?.teamId]);

    // Helper to format date safely
    const formatDate = (date: any) => {
        if (!date) return '';
        if (date.toDate) return date.toDate().toLocaleDateString(); // Firestore Timestamp
        return new Date(date).toLocaleDateString(); // String or Date object
    };

    const filteredProjects = projects.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.clientName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || (p.status || 'active') === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const columns: Column<Project>[] = [
        {
            id: 'name',
            label: 'Project Name',
            render: (row) => <div className="font-bold text-gray-900">{row.name}</div>
        },
        {
            id: 'client',
            label: 'Client',
            render: (row) => (
                <div className="flex items-center gap-1 font-medium text-gray-700">
                    <Building size={14} /> {row.clientName || 'Unknown'}
                </div>
            )
        },
        {
            id: 'timeline',
            label: 'Timeline',
            render: (row) => (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Calendar size={14} />
                    {formatDate(row.startDate)}
                    {row.endDate ? ` - ${formatDate(row.endDate)}` : ' - Ongoing'}
                </div>
            )
        },
        {
            id: 'status',
            label: 'Status',
            render: (row) => (
                <span className={`px-2 py-0.5 rounded text-xs uppercase font-bold tracking-wide ${(row.status || 'active') === 'active' ? 'bg-green-100 text-green-800' :
                    (row.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800')
                    }`}>
                    {row.status || 'Active'}
                </span>
            )
        },
        {
            id: 'actions',
            label: 'Actions',
            render: () => (
                <div className="flex gap-2">
                    <Button variant="ghost" size="sm">Edit</Button>
                </div>
            )
        }
    ];

    return (
        <div className="container p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="title">Placements</h1>
                    <p className="subtitle">Manage active placements</p>
                </div>
                <Button onClick={() => router.push('/projects/new')} className="bg-amber-500 hover:bg-amber-600 text-white">
                    <Plus size={16} className="mr-2" />
                    New Project
                </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder="Search projects..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-w-[150px]"
                >
                    <option value="all">Select an option...</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On Hold</option>
                </select>
            </div>

            <DynamicTable<Project>
                id="projects-table"
                data={filteredProjects}
                columns={columns}
                onRowClick={(row) => {
                    setSelectedProject(row);
                    setIsDetailOpen(true);
                }}
                isLoading={loading}
                emptyMessage="No placements found."
            />

            <DetailModal
                isOpen={isDetailOpen}
                onClose={() => {
                    setIsDetailOpen(false);
                    setSelectedProject(null);
                }}
                type="placement"
                id={selectedProject?.id || ''}
                title={`Placement: ${selectedProject?.name}`}
            />
        </div>
    );
}
