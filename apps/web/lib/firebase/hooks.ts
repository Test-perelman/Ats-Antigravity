import { useEffect, useMemo, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from './config';
import { useAuth } from './AuthContext';

export type DashboardDateRange = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

export interface Candidate {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    skills: string[];
    status: string;
    createdAt: unknown;
    updatedAt?: unknown;

    benchReady?: boolean;
    highPriority?: boolean;
    visaStatus?: string;
    visaExpiry?: unknown;
    availabilityDate?: unknown;
    availabilityStatus?: 'Immediate' | 'In 2 weeks' | 'In 30 days' | 'On Project';
    currentProjectEndDate?: unknown;
    expectedRate?: string;
    assignedRecruiter?: string;
}

export interface Job {
    id: string;
    title: string;
    department?: string;
    location?: string;
    maxRate?: string | number;
    billRateMax?: string | number;
    status: 'Open' | 'Closed' | 'Draft' | string;
    createdAt: unknown;
    updatedAt?: unknown;
}

export interface Submission {
    id: string;
    candidateId: string;
    jobId: string;
    candidateName: string;
    jobTitle: string;
    status: 'pending' | 'approved' | 'rejected' | 'interviewing' | 'submitted' | 'screening' | 'interview' | 'offered';
    submittedBy?: string;
    createdBy?: string;
    submittedAt?: unknown;
    createdAt?: unknown;
    updatedAt?: unknown;
}

export interface Interview {
    id: string;
    candidateName: string;
    jobTitle: string;
    scheduledAt: string;
    interviewType?: 'phone' | 'video' | 'onsite' | string;
    mode?: string;
    status: 'scheduled' | 'completed' | string;
    meetingLink?: string;
    location?: string;
    createdAt?: unknown;
}

interface Timesheet {
    id: string;
    candidateName?: string;
    projectName?: string;
    weekEnding?: unknown;
    totalHours?: number;
    status?: string;
    createdAt?: unknown;
    updatedAt?: unknown;
}

interface Project {
    id: string;
    name: string;
    status?: string;
    budget?: string | number;
    value?: string | number;
    createdAt?: unknown;
}

export interface DashboardActivity {
    id: string;
    type: 'user' | 'team' | 'candidate' | 'job' | 'submission';
    action: string;
    user: string;
    timestamp: string;
}

interface DashboardRecords {
    candidates: Candidate[];
    jobs: Job[];
    submissions: Submission[];
    interviews: Interview[];
    timesheets: Timesheet[];
    projects: Project[];
}

function toDate(value: unknown): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value === 'object' && value && 'toDate' in value && typeof (value as { toDate?: unknown }).toDate === 'function') {
        return (value as { toDate: () => Date }).toDate();
    }
    const date = new Date(String(value));
    return Number.isNaN(date.getTime()) ? null : date;
}

function toIso(value: unknown) {
    return toDate(value)?.toISOString() || new Date(0).toISOString();
}

function getDateRangeBounds(range: DashboardDateRange, customRange?: { startDate: Date; endDate: Date }) {
    const now = new Date();
    const start = new Date(now);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    if (range === 'custom' && customRange) {
        const customStart = new Date(customRange.startDate);
        const customEnd = new Date(customRange.endDate);
        customStart.setHours(0, 0, 0, 0);
        customEnd.setHours(23, 59, 59, 999);
        return { start: customStart, end: customEnd };
    }

    if (range === 'today') {
        start.setHours(0, 0, 0, 0);
    } else if (range === 'week') {
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

function isInRange(value: unknown, start: Date, end: Date) {
    const date = toDate(value);
    if (!date) return false;
    return date >= start && date <= end;
}

function recordDate(record: { createdAt?: unknown; submittedAt?: unknown; updatedAt?: unknown; weekEnding?: unknown; scheduledAt?: unknown }) {
    return record.submittedAt || record.createdAt || record.weekEnding || record.scheduledAt || record.updatedAt;
}

function groupSubmissionsByDay(submissions: Submission[]) {
    const counts = new Map<string, { date: string; submitted: number; approved: number; rejected: number }>();

    submissions.forEach((submission) => {
        const date = toDate(recordDate(submission));
        if (!date) return;
        const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const current = counts.get(label) || { date: label, submitted: 0, approved: 0, rejected: 0 };
        current.submitted += 1;
        if (submission.status === 'approved' || submission.status === 'offered') current.approved += 1;
        if (submission.status === 'rejected') current.rejected += 1;
        counts.set(label, current);
    });

    return Array.from(counts.values());
}

function pipelineFromCandidates(candidates: Candidate[]) {
    const stages = ['new', 'screening', 'interviewing', 'offered', 'hired'];
    const total = Math.max(candidates.length, 1);

    return stages.map((stage) => {
        const count = candidates.filter((candidate) => candidate.status === stage).length;
        return {
            stage: stage.charAt(0).toUpperCase() + stage.slice(1),
            count,
            percentage: Math.round((count / total) * 100),
        };
    });
}

function makeActivities(records: DashboardRecords, currentUserName: string, start: Date, end: Date): DashboardActivity[] {
    const activities: DashboardActivity[] = [];

    records.candidates.forEach((candidate) => {
        if (!isInRange(candidate.createdAt, start, end)) return;
        activities.push({
            id: `candidate-${candidate.id}`,
            type: 'candidate',
            action: `added candidate ${`${candidate.firstName || ''} ${candidate.lastName || ''}`.trim() || candidate.email}`,
            user: currentUserName,
            timestamp: toIso(candidate.createdAt),
        });
    });

    records.jobs.forEach((job) => {
        if (!isInRange(job.createdAt, start, end)) return;
        activities.push({
            id: `job-${job.id}`,
            type: 'job',
            action: `created job ${job.title || job.id}`,
            user: currentUserName,
            timestamp: toIso(job.createdAt),
        });
    });

    records.submissions.forEach((submission) => {
        const date = recordDate(submission);
        if (!isInRange(date, start, end)) return;
        activities.push({
            id: `submission-${submission.id}`,
            type: 'submission',
            action: `submitted ${submission.candidateName || 'a candidate'} to ${submission.jobTitle || 'a job'}`,
            user: submission.submittedBy || currentUserName,
            timestamp: toIso(date),
        });
    });

    records.interviews.forEach((interview) => {
        if (!isInRange(interview.createdAt || interview.scheduledAt, start, end)) return;
        activities.push({
            id: `interview-${interview.id}`,
            type: 'submission',
            action: `scheduled ${interview.candidateName || 'candidate'} for ${interview.jobTitle || 'an interview'}`,
            user: currentUserName,
            timestamp: toIso(interview.createdAt || interview.scheduledAt),
        });
    });

    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 15);
}

export function useDashboardData(
    dateRange: DashboardDateRange = 'month',
    customRange?: { startDate: Date; endDate: Date }
) {
    const { userData, loading: authLoading } = useAuth();
    const [records, setRecords] = useState<DashboardRecords>({
        candidates: [],
        jobs: [],
        submissions: [],
        interviews: [],
        timesheets: [],
        projects: [],
    });
    const [loadedTeamId, setLoadedTeamId] = useState<string | null>(null);

    useEffect(() => {
        if (authLoading || !userData?.teamId) return;

        const loaded = new Set<keyof DashboardRecords>();
        const teamId = userData.teamId;
        const markLoaded = (key: keyof DashboardRecords) => {
            loaded.add(key);
            if (loaded.size === 6) setLoadedTeamId(teamId);
        };

        const subscriptions = [
            onSnapshot(query(collection(db, 'teams', teamId, 'candidates'), orderBy('createdAt', 'desc')), (snap) => {
                setRecords((prev) => ({ ...prev, candidates: snap.docs.map((item) => ({ id: item.id, ...item.data() })) as Candidate[] }));
                markLoaded('candidates');
            }),
            onSnapshot(query(collection(db, 'teams', teamId, 'jobs'), orderBy('createdAt', 'desc')), (snap) => {
                setRecords((prev) => ({ ...prev, jobs: snap.docs.map((item) => ({ id: item.id, ...item.data() })) as Job[] }));
                markLoaded('jobs');
            }),
            onSnapshot(query(collection(db, 'teams', teamId, 'submissions'), orderBy('createdAt', 'desc')), (snap) => {
                setRecords((prev) => ({ ...prev, submissions: snap.docs.map((item) => ({ id: item.id, ...item.data() })) as Submission[] }));
                markLoaded('submissions');
            }),
            onSnapshot(query(collection(db, 'teams', teamId, 'interviews'), orderBy('scheduledAt', 'asc')), (snap) => {
                setRecords((prev) => ({ ...prev, interviews: snap.docs.map((item) => ({ id: item.id, ...item.data() })) as Interview[] }));
                markLoaded('interviews');
            }),
            onSnapshot(query(collection(db, 'teams', teamId, 'timesheets'), orderBy('createdAt', 'desc')), (snap) => {
                setRecords((prev) => ({ ...prev, timesheets: snap.docs.map((item) => ({ id: item.id, ...item.data() })) as Timesheet[] }));
                markLoaded('timesheets');
            }),
            onSnapshot(query(collection(db, 'teams', teamId, 'projects'), orderBy('createdAt', 'desc')), (snap) => {
                setRecords((prev) => ({ ...prev, projects: snap.docs.map((item) => ({ id: item.id, ...item.data() })) as Project[] }));
                markLoaded('projects');
            }),
        ];

        return () => subscriptions.forEach((unsubscribe) => unsubscribe());
    }, [userData?.teamId, authLoading]);

    const loading = authLoading || Boolean(userData?.teamId && loadedTeamId !== userData.teamId);

    return useMemo(() => {
        const { start, end } = getDateRangeBounds(dateRange, customRange);
        const rangeSubmissions = records.submissions.filter((submission) => isInRange(recordDate(submission), start, end));
        const rangeTimesheets = records.timesheets.filter((timesheet) => isInRange(recordDate(timesheet), start, end));
        const rangeInterviews = records.interviews
            .filter((interview) => isInRange(interview.scheduledAt, start, end))
            .map((interview) => ({
                ...interview,
                scheduledAt: toDate(interview.scheduledAt)?.toISOString() || new Date(0).toISOString(),
                interviewType: interview.interviewType || interview.mode || 'onsite',
                meetingLink: interview.meetingLink || interview.location,
            }));

        const currentUserName = `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() || userData?.email || 'Team';

        return {
            metrics: {
                candidates: records.candidates.filter((candidate) => !['rejected', 'withdrawn'].includes(candidate.status)).length,
                jobs: records.jobs.filter((job) => ['open', 'active'].includes(String(job.status || '').toLowerCase())).length,
                submissions: rangeSubmissions.length,
                timesheets: rangeTimesheets.filter((timesheet) => !['approved', 'paid'].includes(String(timesheet.status || '').toLowerCase())).length,
                projects: records.projects.filter((project) => String(project.status || '').toLowerCase() === 'active').length,
            },
            activities: makeActivities(records, currentUserName, start, end),
            interviews: rangeInterviews,
            submissions: rangeSubmissions.map((submission) => ({
                ...submission,
                submittedAt: toIso(recordDate(submission)),
                submittedBy: submission.submittedBy || currentUserName,
            })),
            submissionChartData: groupSubmissionsByDay(rangeSubmissions),
            pipelineData: pipelineFromCandidates(records.candidates),
            exportRows: {
                candidates: records.candidates,
                jobs: records.jobs,
                submissions: rangeSubmissions,
                interviews: rangeInterviews,
                timesheets: rangeTimesheets,
                projects: records.projects,
            },
            range: { start, end },
            loading,
        };
    }, [records, dateRange, customRange, userData?.email, userData?.firstName, userData?.lastName, loading]);
}
