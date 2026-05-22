'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/AuthContext';
import { useDashboardData } from '@/lib/firebase/hooks';
import MetricCard from '@/components/dashboard/MetricCard';
import QuickActions from '@/components/dashboard/QuickActions';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import UpcomingInterviews from '@/components/dashboard/UpcomingInterviews';
import RecentSubmissions from '@/components/dashboard/RecentSubmissions';
import SubmissionsChart from '@/components/dashboard/charts/SubmissionsChart';
import PipelineChart from '@/components/dashboard/charts/PipelineChart';
import ChartCard from '@/components/dashboard/ChartCard';
import DateRangeSelector, { DateRange } from '@/components/dashboard/DateRangeSelector';
import ExportButton from '@/components/dashboard/ExportButton';
import SkeletonLoader from '@/components/dashboard/SkeletonLoader';

function escapeCsv(value: unknown) {
    const text = String(value ?? '');
    return `"${text.replace(/"/g, '""')}"`;
}

function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
}

function fullName(item: { firstName?: string; lastName?: string; email?: string }) {
    return `${item.firstName || ''} ${item.lastName || ''}`.trim() || item.email || '';
}

export default function TeamDashboard() {
    const { userData } = useAuth(); // Get user info
    const router = useRouter();
    const [dateRange, setDateRange] = useState<DateRange>('month');
    const [customRange, setCustomRange] = useState<{ startDate: Date; endDate: Date }>();
    const [exporting, setExporting] = useState(false);
    const {
        metrics,
        activities,
        interviews,
        submissions,
        submissionChartData,
        pipelineData,
        exportRows,
        loading
    } = useDashboardData(dateRange, customRange);

    const quickActions = [
        { id: '1', label: 'Add Candidate', icon: '👤', href: '/candidates/new', color: 'primary' as const },
        { id: '2', label: 'Create Job', icon: '💼', href: '/jobs/new', color: 'primary' as const },
        { id: '3', label: 'Review Timesheets', icon: '⏰', href: '/timesheets', color: 'accent' as const },
        { id: '4', label: 'Manage Team', icon: '👥', href: '/settings', color: 'primary' as const }
    ];

    const handleExport = (format: 'csv' | 'json') => {
        setExporting(true);
        try {
            const timestamp = new Date().toISOString().slice(0, 10);

            if (format === 'json') {
                downloadBlob(
                    new Blob([JSON.stringify(exportRows, null, 2)], { type: 'application/json;charset=utf-8' }),
                    `dashboard-export-${timestamp}.json`
                );
                return;
            }

            const rows = [
                ['section', 'id', 'name', 'status', 'date', 'amount'],
                ...exportRows.candidates.map((item) => ['candidate', item.id, fullName(item), item.status, item.createdAt, '']),
                ...exportRows.jobs.map((item) => ['job', item.id, item.title, item.status, item.createdAt, item.maxRate || item.billRateMax || '']),
                ...exportRows.submissions.map((item) => ['submission', item.id, `${item.candidateName || ''} -> ${item.jobTitle || ''}`, item.status, item.submittedAt || item.createdAt, '']),
                ...exportRows.interviews.map((item) => ['interview', item.id, `${item.candidateName || ''} -> ${item.jobTitle || ''}`, item.status, item.scheduledAt, '']),
                ...exportRows.timesheets.map((item) => ['timesheet', item.id, `${item.candidateName || ''} / ${item.projectName || ''}`, item.status, item.weekEnding || item.createdAt, item.totalHours || '']),
                ...exportRows.projects.map((item) => ['project', item.id, item.name, item.status, item.createdAt, item.value || item.budget || '']),
            ];
            const csv = rows.map((row) => row.map(escapeCsv).join(',')).join('\n');
            downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), `dashboard-export-${timestamp}.csv`);
        } finally {
            setExporting(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 max-w-[1600px] mx-auto space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => <SkeletonLoader key={i} type="metric" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2"><SkeletonLoader type="chart" /></div>
                    <div><SkeletonLoader type="list" count={4} /></div>
                </div>
            </div>
        );
    }

    // Default to empty state if no data
    if (metrics.candidates === 0 && metrics.jobs === 0) {
        return (
            <div className="p-8 max-w-[1600px] mx-auto min-h-screen flex flex-col items-center justify-center text-center">
                <h1 className="text-3xl font-bold mb-4">Welcome to your Dashboard, {userData?.firstName}!</h1>
                <p className="text-gray-600 mb-8 max-w-md">It looks like you have not added any data yet. Get started by creating your first job or adding a candidate.</p>
                <div className="flex gap-4">
                    <button onClick={() => router.push('/jobs/new')} className="px-6 py-3 bg-[#4B9DA9] text-white rounded-lg shadow hover:bg-[#3A7D87]">Create Job</button>
                    <button onClick={() => router.push('/candidates/new')} className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">Add Candidate</button>
                </div>
            </div>
        )
    }

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Welcome back, <span className="bg-gradient-to-r from-[#4B9DA9] to-[#E37434] bg-clip-text text-transparent">{userData?.firstName || 'Team'}</span>! 👋
                    </h1>
                    <p className="text-gray-500 mt-1 text-lg">Here is what is happening today.</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <DateRangeSelector
                        value={dateRange}
                        onChange={setDateRange}
                        onCustomRangeChange={(startDate, endDate) => setCustomRange({ startDate, endDate })}
                    />
                    <ExportButton
                        onExport={handleExport}
                        loading={exporting}
                    />
                    <button
                        onClick={() => window.location.reload()}
                        className="p-2.5 text-gray-500 hover:text-[#4B9DA9] hover:bg-[#4B9DA9]/10 rounded-lg transition-colors"
                        title="Refresh Data"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    </button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Active Candidates"
                    value={metrics.candidates}
                    icon="👥"
                    variant="primary"
                    onClick={() => router.push('/candidates')}
                />
                <MetricCard
                    title="Open Jobs"
                    value={metrics.jobs}
                    icon="💼"
                    variant="accent"
                    onClick={() => router.push('/jobs')}
                />
                <MetricCard
                    title="Total Submissions"
                    value={metrics.submissions}
                    icon="📝"
                    variant="primary"
                />
                <MetricCard
                    title="Pending Timesheets"
                    value={metrics.timesheets}
                    icon="⏱️"
                    variant="warning"
                />
            </div>

            <QuickActions actions={quickActions} />

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartCard title="Submissions Over Time" subtitle="Selected range">
                    <SubmissionsChart data={submissionChartData} />
                </ChartCard>
                <ChartCard title="Candidate Pipeline" subtitle="Current Funnel">
                    <PipelineChart data={pipelineData} />
                </ChartCard>
            </div>

            {/* Recent Activity & Interviews */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <RecentSubmissions submissions={submissions} />
                </div>
                <div className="space-y-8">
                    <UpcomingInterviews interviews={interviews} />
                    <ActivityFeed activities={activities || []} />
                </div>
            </div>
        </div>
    );
}
