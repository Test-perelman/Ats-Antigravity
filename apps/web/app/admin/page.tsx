'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import MetricCard from '@/components/dashboard/MetricCard';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import TeamPerformance from '@/components/dashboard/TeamPerformance';
import ChartCard from '@/components/dashboard/ChartCard';
import DateRangeSelector, { DateRange } from '@/components/dashboard/DateRangeSelector';
import ExportButton from '@/components/dashboard/ExportButton';
import PerformanceChart from '@/components/dashboard/charts/PerformanceChart';
import SubmissionsChart from '@/components/dashboard/charts/SubmissionsChart';

type RecordData = Record<string, unknown>;

interface Team extends RecordData {
    id: string;
    name: string;
    industry?: string;
    status?: string;
}

interface UserProfile extends RecordData {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
    teamId?: string;
}

interface Activity {
    id: string;
    type: 'user' | 'team' | 'candidate' | 'job' | 'submission';
    action: string;
    user: string;
    timestamp: string;
}

function toDate(value: unknown) {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value === 'object' && value && 'toDate' in value && typeof (value as { toDate?: unknown }).toDate === 'function') {
        return (value as { toDate: () => Date }).toDate();
    }
    const date = new Date(String(value));
    return Number.isNaN(date.getTime()) ? null : date;
}

function getBounds(range: DateRange) {
    const now = new Date();
    const start = new Date(now);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    if (range === 'today') start.setHours(0, 0, 0, 0);
    else if (range === 'week') {
        start.setDate(now.getDate() - 6);
        start.setHours(0, 0, 0, 0);
    } else if (range === 'quarter') {
        start.setMonth(now.getMonth() - 2, 1);
        start.setHours(0, 0, 0, 0);
    } else if (range === 'year') {
        start.setMonth(0, 1);
        start.setHours(0, 0, 0, 0);
    } else {
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
    }

    return { start, end };
}

function inRange(value: unknown, start: Date, end: Date) {
    const date = toDate(value);
    return Boolean(date && date >= start && date <= end);
}

function csvValue(value: unknown) {
    return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
}

function displayName(user: UserProfile) {
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || user.id;
}

async function readCollection<T extends RecordData>(path: string[]) {
    const snapshot = await getDocs(collection(db, ...path));
    return snapshot.docs.map((item) => ({ id: item.id, ...item.data() })) as T[];
}

export default function MasterAdminDashboard() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [jobs, setJobs] = useState<RecordData[]>([]);
    const [submissions, setSubmissions] = useState<RecordData[]>([]);
    const [interviews, setInterviews] = useState<RecordData[]>([]);
    const [projects, setProjects] = useState<RecordData[]>([]);
    const [accessRequests, setAccessRequests] = useState<RecordData[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState<DateRange>('month');
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        let active = true;

        async function fetchData() {
            setLoading(true);
            try {
                const [teamRows, userRows] = await Promise.all([
                    readCollection<Team>(['teams']),
                    readCollection<UserProfile>(['users']),
                ]);

                const teamCollections = await Promise.all(teamRows.map(async (team) => {
                    const [teamJobs, teamSubmissions, teamInterviews, teamProjects, teamRequests] = await Promise.all([
                        readCollection<RecordData>(['teams', team.id, 'jobs']).catch(() => []),
                        readCollection<RecordData>(['teams', team.id, 'submissions']).catch(() => []),
                        readCollection<RecordData>(['teams', team.id, 'interviews']).catch(() => []),
                        readCollection<RecordData>(['teams', team.id, 'projects']).catch(() => []),
                        fetch(`/api/teams/${team.id}/requests`, {
                            headers: { authorization: `Bearer ${window.localStorage.getItem('token') || ''}` },
                        }).then((response) => response.ok ? response.json() : []).catch(() => []),
                    ]);
                    return {
                        jobs: teamJobs.map((item) => ({ ...item, teamId: team.id, teamName: team.name })),
                        submissions: teamSubmissions.map((item) => ({ ...item, teamId: team.id, teamName: team.name })),
                        interviews: teamInterviews.map((item) => ({ ...item, teamId: team.id, teamName: team.name })),
                        projects: teamProjects.map((item) => ({ ...item, teamId: team.id, teamName: team.name })),
                        requests: teamRequests.map((item: RecordData) => ({ ...item, teamId: team.id, teamName: team.name })),
                    };
                }));

                if (!active) return;
                setTeams(teamRows);
                setUsers(userRows);
                setJobs(teamCollections.flatMap((item) => item.jobs));
                setSubmissions(teamCollections.flatMap((item) => item.submissions));
                setInterviews(teamCollections.flatMap((item) => item.interviews));
                setProjects(teamCollections.flatMap((item) => item.projects));
                setAccessRequests(teamCollections.flatMap((item) => item.requests));
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                if (active) setLoading(false);
            }
        }

        fetchData();
        return () => {
            active = false;
        };
    }, []);

    const dashboard = useMemo(() => {
        const { start, end } = getBounds(dateRange);
        const rangeSubmissions = submissions.filter((item) => inRange(item.submittedAt || item.createdAt, start, end));
        const rangeInterviews = interviews.filter((item) => inRange(item.scheduledAt || item.createdAt, start, end));
        const rangeProjects = projects.filter((item) => inRange(item.createdAt, start, end));

        const userById = new Map(users.map((user) => [user.id, user]));
        const performance = users.slice(0, 25).map((user) => {
            const name = displayName(user);
            return {
                id: user.id,
                name,
                role: String(user.role || 'user'),
                metrics: {
                    submissions: rangeSubmissions.filter((item) => item.createdBy === user.id || item.submittedBy === name).length,
                    interviews: rangeInterviews.filter((item) => item.createdBy === user.id).length,
                    placements: rangeProjects.filter((item) => item.createdBy === user.id || item.status === 'completed').length,
                },
            };
        });

        const chartMap = new Map<string, { date: string; submitted: number; approved: number; rejected: number }>();
        rangeSubmissions.forEach((submission) => {
            const date = toDate(submission.submittedAt || submission.createdAt);
            if (!date) return;
            const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const current = chartMap.get(label) || { date: label, submitted: 0, approved: 0, rejected: 0 };
            current.submitted += 1;
            if (submission.status === 'approved' || submission.status === 'offered') current.approved += 1;
            if (submission.status === 'rejected') current.rejected += 1;
            chartMap.set(label, current);
        });

        const activities: Activity[] = [
            ...teams.filter((team) => inRange(team.createdAt, start, end)).map((team) => ({
                id: `team-${team.id}`,
                type: 'team' as const,
                action: `created team ${team.name}`,
                user: userById.get(String(team.createdBy || '')) ? displayName(userById.get(String(team.createdBy || ''))!) : 'System',
                timestamp: toDate(team.createdAt)?.toISOString() || new Date(0).toISOString(),
            })),
            ...rangeSubmissions.map((submission) => ({
                id: `submission-${submission.id}`,
                type: 'submission' as const,
                action: `submitted ${submission.candidateName || 'candidate'} to ${submission.jobTitle || 'job'}`,
                user: String(submission.submittedBy || 'Team'),
                timestamp: toDate(submission.submittedAt || submission.createdAt)?.toISOString() || new Date(0).toISOString(),
            })),
        ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        return {
            metrics: {
                teams: teams.length,
                users: new Set(users.map((user) => user.id)).size,
                jobs: jobs.filter((job) => ['open', 'active'].includes(String(job.status || '').toLowerCase())).length,
                accessRequests: accessRequests.length,
            },
            performance,
            performanceChart: performance.map((member) => ({
                name: member.name,
                submissions: member.metrics.submissions,
                interviews: member.metrics.interviews,
                placements: member.metrics.placements,
            })),
            submissionsChart: Array.from(chartMap.values()),
            activities,
            rangeRows: { teams, users, jobs, submissions: rangeSubmissions, interviews: rangeInterviews, projects: rangeProjects, accessRequests },
        };
    }, [accessRequests, dateRange, interviews, jobs, projects, submissions, teams, users]);

    const handleExport = (format: 'csv' | 'json') => {
        setExporting(true);
        try {
            const filenameDate = new Date().toISOString().slice(0, 10);
            if (format === 'json') {
                downloadBlob(
                    new Blob([JSON.stringify(dashboard.rangeRows, null, 2)], { type: 'application/json;charset=utf-8' }),
                    `admin-dashboard-${filenameDate}.json`
                );
                return;
            }

            const rows = [
                ['section', 'id', 'name', 'status', 'team'],
                ...teams.map((team) => ['team', team.id, team.name, team.status || '', '']),
                ...users.map((user) => ['user', user.id, displayName(user), user.role || '', user.teamId || '']),
                ...jobs.map((job) => ['job', job.id, job.title || '', job.status || '', job.teamName || '']),
                ...submissions.map((submission) => ['submission', submission.id, submission.candidateName || '', submission.status || '', submission.teamName || '']),
            ];
            downloadBlob(new Blob([rows.map((row) => row.map(csvValue).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' }), `admin-dashboard-${filenameDate}.csv`);
        } finally {
            setExporting(false);
        }
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
            <div className="mb-8">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Master Admin Dashboard</h1>
                        <p className="text-gray-600">System-wide overview from Postgres data</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all"
                        >
                            Refresh
                        </button>
                        <ExportButton onExport={handleExport} loading={exporting} />
                    </div>
                </div>

                <DateRangeSelector value={dateRange} onChange={setDateRange} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MetricCard title="Total Teams" value={dashboard.metrics.teams} icon={<span className="text-sm font-bold">TM</span>} variant="primary" />
                <MetricCard title="Total Users" value={dashboard.metrics.users} icon={<span className="text-sm font-bold">US</span>} variant="primary" />
                <MetricCard title="Active Jobs" value={dashboard.metrics.jobs} icon={<span className="text-sm font-bold">JB</span>} variant="accent" />
                <MetricCard title="Pending Requests" value={dashboard.metrics.accessRequests} icon={<span className="text-sm font-bold">RQ</span>} variant="warning" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <ChartCard title="Platform Submissions" subtitle="Selected range">
                    <SubmissionsChart data={dashboard.submissionsChart} />
                </ChartCard>

                <ChartCard title="Top Performers" subtitle="Selected range">
                    <PerformanceChart data={dashboard.performanceChart} />
                </ChartCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <TeamPerformance members={dashboard.performance} />
                <ActivityFeed activities={dashboard.activities} />
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">All Teams</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Team Name</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Industry</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Members</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {teams.map((team) => (
                                <tr key={team.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4 font-medium text-gray-900">{team.name}</td>
                                    <td className="py-3 px-4 text-gray-600">{team.industry || 'General'}</td>
                                    <td className="py-3 px-4 text-gray-600">{users.filter((user) => user.teamId === team.id).length}</td>
                                    <td className="py-3 px-4">
                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                            {team.status || 'active'}
                                        </span>
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
