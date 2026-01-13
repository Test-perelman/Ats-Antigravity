'use client';

import React, { useEffect, useState } from 'react';
import MetricCard from '@/components/dashboard/MetricCard';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import TeamPerformance from '@/components/dashboard/TeamPerformance';
import ChartCard from '@/components/dashboard/ChartCard';
import DateRangeSelector, { DateRange } from '@/components/dashboard/DateRangeSelector';
import ExportButton from '@/components/dashboard/ExportButton';
import PerformanceChart from '@/components/dashboard/charts/PerformanceChart';
import SubmissionsChart from '@/components/dashboard/charts/SubmissionsChart';

export default function MasterAdminDashboard() {
    const [metrics, setMetrics] = useState({
        teams: 0,
        users: 0,
        jobs: 0,
        accessRequests: 0
    });

    const [teams, setTeams] = useState<Array<{
        id: string;
        name: string;
        members: number;
        industry: string;
        status: string;
    }>>([]);
    const [activities, setActivities] = useState<Array<{
        id: string;
        type: 'user' | 'team' | 'candidate' | 'job' | 'submission';
        action: string;
        user: string;
        timestamp: string;
    }>>([]);
    const [teamMembers, setTeamMembers] = useState<Array<{
        id: string;
        name: string;
        role: string;
        metrics: {
            submissions: number;
            placements: number;
            interviews: number;
        };
    }>>([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState<DateRange>('month');
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // TODO: Replace with actual API calls
                setMetrics({
                    teams: 8,
                    users: 156,
                    jobs: 89,
                    accessRequests: 5
                });

                setTeams([
                    { id: '1', name: 'Tech Corp', members: 24, industry: 'Technology', status: 'active' },
                    { id: '2', name: 'Finance Inc', members: 18, industry: 'Finance', status: 'active' },
                    { id: '3', name: 'Healthcare Plus', members: 32, industry: 'Healthcare', status: 'active' }
                ]);

                setActivities([
                    {
                        id: '1',
                        type: 'team',
                        action: 'created new team "Marketing Agency"',
                        user: 'System Admin',
                        timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString()
                    },
                    {
                        id: '2',
                        type: 'user',
                        action: 'approved access request for Tech Corp',
                        user: 'System Admin',
                        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString()
                    }
                ]);

                setTeamMembers([
                    {
                        id: '1',
                        name: 'Sarah Johnson',
                        role: 'Senior Recruiter',
                        metrics: { submissions: 45, placements: 8, interviews: 23 }
                    },
                    {
                        id: '2',
                        name: 'Mike Chen',
                        role: 'Recruiter',
                        metrics: { submissions: 38, placements: 6, interviews: 19 }
                    },
                    {
                        id: '3',
                        name: 'Emily Davis',
                        role: 'Lead Recruiter',
                        metrics: { submissions: 52, placements: 10, interviews: 28 }
                    },
                    {
                        id: '4',
                        name: 'John Smith',
                        role: 'Recruiter',
                        metrics: { submissions: 31, placements: 5, interviews: 16 }
                    }
                ]);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [dateRange]);

    const handleExport = async (format: 'csv' | 'pdf') => {
        setExporting(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log(`Exporting dashboard as ${format}`);
        setExporting(false);
    };

    const handleRefresh = () => {
        setLoading(true);
        setTimeout(() => setLoading(false), 1000);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-pulse text-[#4B9DA9]">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#4B9DA9] to-[#E37434] bg-clip-text text-transparent mb-2">
                            Master Admin Dashboard
                        </h1>
                        <p className="text-gray-600">System-wide overview and management</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleRefresh}
                            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
                        >
                            🔄 Refresh
                        </button>
                        <ExportButton onExport={handleExport} loading={exporting} />
                    </div>
                </div>

                {/* Date Range Selector */}
                <DateRangeSelector
                    value={dateRange}
                    onChange={setDateRange}
                />
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MetricCard
                    title="Total Teams"
                    value={metrics.teams}
                    icon={<span className="text-2xl">🏢</span>}
                    trend={{ value: 15, isPositive: true }}
                    variant="primary"
                />
                <MetricCard
                    title="Total Users"
                    value={metrics.users}
                    icon={<span className="text-2xl">👥</span>}
                    trend={{ value: 8, isPositive: true }}
                    variant="primary"
                />
                <MetricCard
                    title="Active Jobs"
                    value={metrics.jobs}
                    icon={<span className="text-2xl">💼</span>}
                    variant="accent"
                />
                <MetricCard
                    title="Pending Requests"
                    value={metrics.accessRequests}
                    icon={<span className="text-2xl">📋</span>}
                    onClick={() => window.location.href = '/admin/access-requests'}
                    variant="warning"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <ChartCard title="Platform Activity" subtitle="System-wide submissions over time">
                    <SubmissionsChart />
                </ChartCard>

                <ChartCard title="Top Performers" subtitle="Team member performance comparison">
                    <PerformanceChart />
                </ChartCard>
            </div>

            {/* Team Performance & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <TeamPerformance members={teamMembers} />
                <ActivityFeed activities={activities} />
            </div>

            {/* Teams Table */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">All Teams</h3>
                    <button className="px-4 py-2 bg-gradient-to-r from-[#4B9DA9] to-[#91C6BC] text-white rounded-lg hover:shadow-lg transition-all">
                        + Create Team
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Team Name</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Industry</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Members</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teams.map((team) => (
                                <tr key={team.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4 font-medium text-gray-900">{team.name}</td>
                                    <td className="py-3 px-4 text-gray-600">{team.industry}</td>
                                    <td className="py-3 px-4 text-gray-600">{team.members}</td>
                                    <td className="py-3 px-4">
                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                            {team.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4">
                                        <button className="text-[#4B9DA9] hover:text-[#E37434] font-medium text-sm">
                                            View Details →
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
