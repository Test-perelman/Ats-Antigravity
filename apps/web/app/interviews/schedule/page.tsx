'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../lib/firebase/AuthContext';
import { db } from '../../../lib/firebase/config';
import { collection, addDoc, doc, updateDoc, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { Button } from '../../../components/ui/button';
import { ArrowLeft, User, Calendar, MapPin, Video, Link as LinkIcon } from 'lucide-react';

interface SubmissionOption {
    id: string;
    candidateName: string;
    jobTitle: string;
}

export default function ScheduleInterviewPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const preselectedSubmissionId = searchParams.get('submissionId');
    const { userData } = useAuth();
    const [loading, setLoading] = useState(false);

    const [submissions, setSubmissions] = useState<SubmissionOption[]>([]);

    const [formData, setFormData] = useState({
        submissionId: preselectedSubmissionId || '',
        round: 'Round 1',
        interviewerName: '',
        scheduledAt: '',
        mode: 'video',
        location: '', // Can be meeting link or physical address
        notes: ''
    });

    useEffect(() => {
        if (!userData?.teamId) return;

        const fetchSubmissions = async () => {
            try {
                // Fetch active submissions
                const q = query(collection(db, 'teams', userData.teamId, 'submissions'));
                // In a real app, filter by status != 'rejected' etc.
                const snap = await getDocs(q);
                setSubmissions(snap.docs.map(doc => ({
                    id: doc.id,
                    candidateName: doc.data().candidateName,
                    jobTitle: doc.data().jobTitle
                })));
            } catch (err) {
                console.error("Failed to fetch submissions", err);
            }
        };
        fetchSubmissions();
    }, [userData?.teamId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!userData?.teamId) {
            setLoading(false);
            return;
        }

        try {
            const selectedSubmission = submissions.find(s => s.id === formData.submissionId);

            // 1. Create Interview Document
            await addDoc(collection(db, 'teams', userData.teamId, 'interviews'), {
                ...formData,
                candidateName: selectedSubmission?.candidateName || 'Unknown',
                jobTitle: selectedSubmission?.jobTitle || 'Unknown',
                scheduledAt: new Date(formData.scheduledAt).toISOString(),
                status: 'scheduled',
                createdBy: userData.uid,
                createdAt: serverTimestamp()
            });

            // 2. Update Submission Status
            if (formData.submissionId) {
                const submissionRef = doc(db, 'teams', userData.teamId, 'submissions', formData.submissionId);
                await updateDoc(submissionRef, {
                    status: 'interviewing', // or 'interview' depending on conventions
                    updatedAt: serverTimestamp()
                });
            }

            router.push('/interviews');
        } catch (error) {
            console.error('Failed to schedule interview', error);
            alert('Failed to schedule interview');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container p-6 max-w-2xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Schedule Interview</h1>
                    <p className="text-gray-500 mt-1">Create a new interview schedule</p>
                </div>
                <Button variant="ghost" onClick={() => router.back()} className="text-gray-600">
                    <ArrowLeft size={16} className="mr-2" />
                    Back
                </Button>
            </div>

            <div className="bg-white border rounded-2xl shadow-sm overflow-hidden p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Interview Information</h3>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Submission <span className="text-red-500">*</span></label>
                        <select
                            required
                            value={formData.submissionId}
                            onChange={(e) => setFormData({ ...formData, submissionId: e.target.value })}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        >
                            <option value="">Select an option...</option>
                            {submissions.map(s => (
                                <option key={s.id} value={s.id}>{s.candidateName} - {s.jobTitle}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Interview Round <span className="text-red-500">*</span></label>
                        <select
                            required
                            value={formData.round}
                            onChange={(e) => setFormData({ ...formData, round: e.target.value })}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        >
                            <option value="Round 1">Round 1 (Prescreen)</option>
                            <option value="Round 2">Round 2 (Technical)</option>
                            <option value="Round 3">Round 3 (Manager)</option>
                            <option value="Final">Final Round</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Scheduled Time <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <input
                                type="datetime-local"
                                required
                                value={formData.scheduledAt}
                                onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                            <Calendar className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Interviewer Name</label>
                        <input
                            value={formData.interviewerName}
                            onChange={(e) => setFormData({ ...formData, interviewerName: e.target.value })}
                            placeholder="Enter interviewer name"
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Interview Mode</label>
                        <select
                            value={formData.mode}
                            onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        >
                            <option value="video">Video Call</option>
                            <option value="phone">Phone Call</option>
                            <option value="onsite">On-site</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Location / Meeting Link</label>
                        <input
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            placeholder="Enter location or meeting link"
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    </div>

                    <div className="pt-4 flex justify-between gap-4">
                        <Button type="button" variant="ghost" onClick={() => router.back()}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-amber-500 hover:bg-amber-600 text-white flex-1">
                            {loading ? 'Scheduling...' : 'Schedule Interview'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
