'use client';

import React, { useEffect, useState, use } from 'react';
import ScheduleInterviewModal from '../../../components/schedule-interview-modal';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/firebase/AuthContext';
import { db } from '../../../lib/firebase/config';
import { doc, getDoc, collection, getDocs, addDoc, query, where, serverTimestamp } from 'firebase/firestore';
import JobDetailView from '@/components/jobs/JobDetailView';
import { Button } from '../../../components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface Job {
    id: string;
    title: string;
    location: string;
    maxRate: string;
    minExperience: number;
    description: string;
    visaRequirements: string;
    status: string;
    createdAt: any;
}

// Separate interface for submissions as they are fetched separately in Firestore
interface Submission {
    id: string;
    status: string;
    createdAt: any;
    candidateId: string;
    candidateName: string;
    candidateEmail: string;
    submittedRate: string;
}

interface Candidate {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const jobId = resolvedParams.id;
    const { userData } = useAuth();



    // Just keep loading state to prevent flash if needed, but the view component handles it too. 
    // Actually we can minimalize this.
    const [loading, setLoading] = useState(false);

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="container p-6 relative">
            <Button variant="ghost" onClick={() => router.push('/jobs')} className="mb-6 pl-0">
                <ArrowLeft size={16} className="mr-2" />
                Back to Jobs
            </Button>

            <JobDetailView jobId={jobId || ''} />
        </div>
    );
}
