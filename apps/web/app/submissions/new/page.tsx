'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/firebase/AuthContext';
import { db } from '../../../lib/firebase/config';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { Button } from '../../../components/ui/button';
import { ArrowLeft, User, Briefcase, FileText } from 'lucide-react';

interface Option {
    id: string;
    name?: string;
    title?: string;
    firstName?: string;
    lastName?: string;
}

export default function NewSubmissionPage() {
    const router = useRouter();
    const { userData } = useAuth();
    const [loading, setLoading] = useState(false);

    // Dropdown data
    const [candidates, setCandidates] = useState<Option[]>([]);
    const [jobs, setJobs] = useState<Option[]>([]);

    const [formData, setFormData] = useState({
        candidateId: '',
        jobId: '',
        status: 'submitted',
        notes: ''
    });

    useEffect(() => {
        if (!userData?.teamId) return;

        const fetchData = async () => {
            try {
                // Fetch Candidates
                const candidatesSnap = await getDocs(collection(db, 'teams', userData.teamId, 'candidates'));
                setCandidates(candidatesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

                // Fetch Jobs
                const jobsSnap = await getDocs(collection(db, 'teams', userData.teamId, 'jobs'));
                setJobs(jobsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (err) {
                console.error("Failed to fetch data", err);
            }
        };
        fetchData();
    }, [userData?.teamId]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!userData?.teamId) {
            setLoading(false);
            return;
        }

        try {
            const selectedCandidate = candidates.find(c => c.id === formData.candidateId);
            const selectedJob = jobs.find(j => j.id === formData.jobId);

            // Construct names
            const candName = selectedCandidate ? `${selectedCandidate.firstName} ${selectedCandidate.lastName}` : 'Unknown';
            const jobTitle = selectedJob?.title || 'Unknown Job';

            const docRef = await addDoc(collection(db, 'teams', userData.teamId, 'submissions'), {
                ...formData,
                candidateName: candName,
                jobTitle: jobTitle,
                clientName: (selectedJob as any)?.clientName || '', // If available from job data
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                createdBy: userData.uid
            });

            // Add initial notes if present
            if (formData.notes.trim()) {
                const notesRef = collection(db, 'teams', userData.teamId, 'submissions', docRef.id, 'notes');
                await addDoc(notesRef, {
                    content: formData.notes,
                    createdAt: serverTimestamp(),
                    createdBy: userData.uid,
                    authorName: userData.firstName + ' ' + userData.lastName,
                    type: 'initial_remark'
                });
            }

            router.push('/submissions');
        } catch (error) {
            console.error('Failed to create submission', error);
            alert('Failed to submit candidate');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container p-6 max-w-2xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">New Submission</h1>
                    <p className="text-gray-500 mt-1">Submit a candidate to a job requirement.</p>
                </div>
                <Button variant="ghost" onClick={() => router.back()} className="text-gray-600">
                    <ArrowLeft size={16} className="mr-2" />
                    Back
                </Button>
            </div>

            <div className="bg-white border rounded-2xl shadow-sm overflow-hidden p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Candidate <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <select
                                required
                                value={formData.candidateId}
                                onChange={(e) => setFormData({ ...formData, candidateId: e.target.value })}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                            >
                                <option value="">Select Candidate...</option>
                                {candidates.map(c => (
                                    <option key={c.id} value={c.id}>{c.firstName} {c.lastName} - {c.title}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Job Requirement <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <select
                                required
                                value={formData.jobId}
                                onChange={(e) => setFormData({ ...formData, jobId: e.target.value })}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                            >
                                <option value="">Select Job...</option>
                                {jobs.map(j => (
                                    <option key={j.id} value={j.id}>{j.title} - {(j as any).clientName}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Initial Status</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        >
                            <option value="submitted">Submitted</option>
                            <option value="screening">Screening</option>
                            <option value="interviewing">Interviewing</option>
                            <option value="offered">Offered</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Submission Notes</label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 text-gray-400" size={18} />
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows={4}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                placeholder="Add any specific notes for this submission (e.g. Rate expectations, availability)..."
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t flex justify-end">
                        <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-white px-8">
                            {loading ? 'Submitting...' : 'Create Submission'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
