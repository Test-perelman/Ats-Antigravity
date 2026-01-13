import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from './config';
import { useAuth } from './AuthContext';

export interface Candidate {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    skills: string[];
    status: string;
    createdAt: any;
}

export interface Job {
    id: string;
    title: string;
    department: string;
    location: string;
    status: 'Open' | 'Closed' | 'Draft';
    createdAt: any;
}

export interface Submission {
    id: string;
    candidateId: string;
    jobId: string;
    candidateName: string; // Denormalized for easy display
    jobTitle: string;      // Denormalized
    status: 'pending' | 'approved' | 'rejected' | 'interviewing';
    submittedBy: string;
    submittedAt: any;
}

export interface Interview {
    id: string;
    candidateName: string;
    jobTitle: string;
    scheduledAt: any;
    interviewType: 'phone' | 'video' | 'onsite';
    status: 'scheduled' | 'completed';
    meetingLink?: string;
}

export function useDashboardData() {
    const { userData, loading: authLoading } = useAuth();
    const [metrics, setMetrics] = useState({
        candidates: 0,
        jobs: 0,
        submissions: 0,
        timesheets: 0 // Mock for now
    });
    const [activities, setActivities] = useState<any[]>([]);
    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // If auth is still loading, wait
        if (authLoading) return;

        // If no user or teamId after auth load, stop loading and return
        if (!userData?.teamId) {
            setLoading(false);
            return;
        }

        const teamId = userData.teamId;

        if (!teamId) {
            console.warn('No team ID found for user, skipping dashboard data fetch.');
            setLoading(false);
            return;
        }

        // Listen to Submissions (for trend chart & recent list)
        const subRef = collection(db, 'teams', teamId, 'submissions');
        const unsubSub = onSnapshot(query(subRef, orderBy('submittedAt', 'desc'), limit(50)), (snap) => {
            const subs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission));
            setSubmissions(subs);
        });

        // Listen to Candidates Count
        const candRef = collection(db, 'teams', teamId, 'candidates');
        const unsubCand = onSnapshot(candRef, (snap) => {
            setMetrics(prev => ({ ...prev, candidates: snap.size }));
        });

        // Listen to Jobs Count
        const jobRef = collection(db, 'teams', teamId, 'jobs');
        const unsubJob = onSnapshot(jobRef, (snap) => {
            setMetrics(prev => ({ ...prev, jobs: snap.size }));
        });

        // Listen to Interviews
        const intRef = collection(db, 'teams', teamId, 'interviews');
        const unsubInt = onSnapshot(query(intRef, orderBy('scheduledAt', 'asc'), limit(5)), (snap) => {
            const ints = snap.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    // Convert Firestore Timestamp to Date, handling potential missing fields or already-date objects
                    scheduledAt: data.scheduledAt?.toDate ? data.scheduledAt.toDate() : new Date(data.scheduledAt || Date.now())
                } as Interview;
            });
            setInterviews(ints);
        });

        // Update submissions metric
        setMetrics(prev => ({ ...prev, submissions: submissions.length, timesheets: 12 })); // Mock timesheets

        setLoading(false);

        return () => {
            unsubSub();
            unsubCand();
            unsubJob();
            unsubInt();
        };
    }, [userData?.teamId, authLoading]);

    return { metrics, activities, interviews, submissions, loading };
}
