'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/firebase/AuthContext';
import { db } from '@/lib/firebase/config';
import { addDoc, collection, getDocs, orderBy, query } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

type Option = {
    id: string;
    label: string;
    clientName?: string;
};

export default function NewOnboardingPage() {
    const router = useRouter();
    const { userData } = useAuth();
    const [candidates, setCandidates] = useState<Option[]>([]);
    const [jobs, setJobs] = useState<Option[]>([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        candidateId: '',
        jobId: '',
        startDate: '',
        status: 'initiated',
        owner: '',
        notes: '',
    });

    useEffect(() => {
        if (!userData?.teamId) return;

        const loadOptions = async () => {
            const [candidateSnap, jobSnap] = await Promise.all([
                getDocs(query(collection(db, 'teams', userData.teamId, 'candidates'), orderBy('createdAt', 'desc'))),
                getDocs(query(collection(db, 'teams', userData.teamId, 'jobs'), orderBy('createdAt', 'desc'))),
            ]);

            setCandidates(candidateSnap.docs.map((item) => {
                const data = item.data();
                return { id: item.id, label: `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.email || item.id };
            }));
            setJobs(jobSnap.docs.map((item) => {
                const data = item.data();
                return { id: item.id, label: data.title || item.id, clientName: data.clientName || '' };
            }));
        };

        loadOptions().catch((error) => console.error('Failed to load onboarding options', error));
    }, [userData?.teamId]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!userData?.teamId) return;

        const candidate = candidates.find((item) => item.id === formData.candidateId);
        const job = jobs.find((item) => item.id === formData.jobId);
        const progressByStatus: Record<string, number> = {
            initiated: 10,
            docs_pending: 35,
            background_check: 65,
            completed: 100,
        };

        setLoading(true);
        try {
            await addDoc(collection(db, 'teams', userData.teamId, 'onboarding'), {
                ...formData,
                candidateName: candidate?.label || '',
                jobTitle: job?.label || '',
                clientName: job?.clientName || '',
                progress: progressByStatus[formData.status] || 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            router.push('/onboarding');
        } catch (error) {
            console.error('Failed to create onboarding record', error);
            alert('Failed to create onboarding record');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container p-6 max-w-2xl">
            <Button variant="ghost" onClick={() => router.back()} className="mb-6 pl-0">
                <ArrowLeft size={16} className="mr-2" />
                Back
            </Button>

            <h1 className="title mb-6">Start Onboarding</h1>

            <form onSubmit={handleSubmit} className="space-y-4 bg-card border rounded p-6">
                <div>
                    <label htmlFor="candidateId">Candidate</label>
                    <select
                        id="candidateId"
                        required
                        value={formData.candidateId}
                        onChange={(event) => setFormData({ ...formData, candidateId: event.target.value })}
                    >
                        <option value="">Select candidate</option>
                        {candidates.map((candidate) => (
                            <option key={candidate.id} value={candidate.id}>{candidate.label}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="jobId">Job</label>
                    <select
                        id="jobId"
                        required
                        value={formData.jobId}
                        onChange={(event) => setFormData({ ...formData, jobId: event.target.value })}
                    >
                        <option value="">Select job</option>
                        {jobs.map((job) => (
                            <option key={job.id} value={job.id}>{job.label}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="startDate">Start Date</label>
                    <input
                        id="startDate"
                        type="date"
                        required
                        value={formData.startDate}
                        onChange={(event) => setFormData({ ...formData, startDate: event.target.value })}
                    />
                </div>

                <div>
                    <label htmlFor="status">Status</label>
                    <select
                        id="status"
                        value={formData.status}
                        onChange={(event) => setFormData({ ...formData, status: event.target.value })}
                    >
                        <option value="initiated">Initiated</option>
                        <option value="docs_pending">Docs Pending</option>
                        <option value="background_check">Background Check</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="owner">Owner</label>
                    <input
                        id="owner"
                        value={formData.owner}
                        onChange={(event) => setFormData({ ...formData, owner: event.target.value })}
                        placeholder="Onboarding owner"
                    />
                </div>

                <div>
                    <label htmlFor="notes">Notes</label>
                    <textarea
                        id="notes"
                        rows={4}
                        value={formData.notes}
                        onChange={(event) => setFormData({ ...formData, notes: event.target.value })}
                        placeholder="Checklist notes"
                    />
                </div>

                <Button type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Onboarding'}
                </Button>
            </form>
        </div>
    );
}
