'use client';

import React, { useEffect, useState, use } from 'react';
import ScheduleInterviewModal from '../../../components/schedule-interview-modal';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/firebase/AuthContext';
import { db } from '../../../lib/firebase/config';
import { doc, getDoc, collection, getDocs, addDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { Button } from '../../../components/ui/button';
import { ArrowLeft, MapPin, DollarSign, Clock, Check } from 'lucide-react';

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

    const [job, setJob] = useState<Job | null>(null);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);

    // Submission Modal State
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [selectedCandidate, setSelectedCandidate] = useState('');
    const [submittedRate, setSubmittedRate] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Schedule Modal State
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);

    useEffect(() => {
        if (userData?.teamId && jobId) {
            fetchJob();
            fetchSubmissions();
        }
    }, [jobId, userData?.teamId]);

    const fetchJob = async () => {
        if (!userData?.teamId) return;
        try {
            const docRef = doc(db, 'teams', userData.teamId, 'jobs', jobId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setJob({ id: docSnap.id, ...docSnap.data() } as Job);
            } else {
                setJob(null);
            }
        } catch (error) {
            console.error('Failed to fetch job', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubmissions = async () => {
        if (!userData?.teamId) return;
        try {
            const q = query(
                collection(db, 'teams', userData.teamId, 'submissions'),
                where('jobId', '==', jobId)
            );
            const querySnapshot = await getDocs(q);
            const subs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Submission[];
            setSubmissions(subs);
        } catch (error) {
            console.error('Failed to fetch submissions', error);
        }
    };

    const fetchCandidates = async () => {
        if (!userData?.teamId) return;
        try {
            const querySnapshot = await getDocs(collection(db, 'teams', userData.teamId, 'candidates'));
            const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Candidate[];
            setCandidates(list);
        } catch (error) {
            console.error('Failed to fetch candidates', error);
        }
    };

    const openSubmitModal = () => {
        setIsSubmitModalOpen(true);
        fetchCandidates();
    };

    const handleSubmitCandidate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCandidate || !userData?.teamId || !job) return;
        setSubmitting(true);

        // Find candidate details to denormalize
        const candidateDetails = candidates.find(c => c.id === selectedCandidate);
        if (!candidateDetails) {
            alert('Selected candidate not found');
            setSubmitting(false);
            return;
        }

        try {
            await addDoc(collection(db, 'teams', userData.teamId, 'submissions'), {
                jobId: jobId,
                jobTitle: job.title, // Denormalized
                candidateId: selectedCandidate,
                candidateName: `${candidateDetails.firstName} ${candidateDetails.lastName}`, // Denormalized
                candidateEmail: candidateDetails.email, // Denormalized
                submittedRate: submittedRate,
                status: 'submitted',
                submittedBy: userData.uid,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            alert('Candidate submitted successfully!');
            setIsSubmitModalOpen(false);
            setSubmittedRate('');
            setSelectedCandidate('');
            fetchSubmissions(); // Refresh list
        } catch (error: any) {
            console.error(error);
            alert('Failed to submit candidate');
        } finally {
            setSubmitting(false);
        }
    };

    const openScheduleModal = (submissionId: string) => {
        setSelectedSubmissionId(submissionId);
        setIsScheduleModalOpen(true);
    };

    if (loading) return <div className="p-10 text-center">Loading job details...</div>;
    if (!job) return <div className="p-10 text-center">Job not found.</div>;

    return (
        <div className="container p-6 relative">
            <Button variant="ghost" onClick={() => router.push('/jobs')} className="mb-6 pl-0">
                <ArrowLeft size={16} className="mr-2" />
                Back to Jobs
            </Button>

            {/* Job Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="title text-3xl mb-2">{job.title}</h1>
                    <div className="flex items-center gap-6 text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin size={16} /> {job.location || 'Remote'}</span>
                        <span className="flex items-center gap-1"><DollarSign size={16} /> {job.maxRate || 'N/A'}</span>
                        <span className="flex items-center gap-1"><Clock size={16} /> {job.minExperience}+ Years</span>
                        <span className="capitalize px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-semibold">{job.status}</span>
                    </div>
                </div>
                <Button onClick={openSubmitModal}>Submit Candidate</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Col: Description */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-card border rounded shadow p-6">
                        <h2 className="font-semibold text-lg mb-4">Description</h2>
                        <p className="whitespace-pre-wrap text-muted-foreground">{job.description || 'No description provided.'}</p>
                    </div>

                    <div className="bg-card border rounded shadow p-6">
                        <h2 className="font-semibold text-lg mb-4">Visa Requirements</h2>
                        <p className="text-muted-foreground">{job.visaRequirements || 'None specified.'}</p>
                    </div>
                </div>

                {/* Right Col: Submissions */}
                <div className="lg:col-span-1 border-l pl-8">
                    <h2 className="font-semibold text-lg mb-4">Submissions</h2>
                    <div className="space-y-4">
                        {submissions.length === 0 ? (
                            <div className="text-sm text-muted-foreground italic">No submissions yet.</div>
                        ) : (
                            submissions.map(sub => (
                                <div key={sub.id} className="bg-card border rounded p-4 shadow-sm">
                                    <div className="font-medium">{sub.candidateName}</div>
                                    <div className="text-xs text-muted-foreground mb-2">{sub.candidateEmail}</div>
                                    <div className="flex justify-between items-center text-sm mb-3">
                                        <span className={`px-2 py-1 rounded text-xs capitalize
                                            ${sub.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                                                sub.status === 'interviewing' ? 'bg-purple-100 text-purple-800' :
                                                    'bg-gray-100'}`}>
                                            {sub.status}
                                        </span>
                                        <span>{sub.submittedRate ? `$${sub.submittedRate}` : '-'}</span>
                                    </div>
                                    <Button size="sm" variant="outline" className="w-full" onClick={() => openScheduleModal(sub.id)}>
                                        Schedule Interview
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Submit Candidate Modal */}
            {isSubmitModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-card p-6 rounded shadow-lg w-full max-w-md">
                        <h2 className="title text-xl mb-4">Submit Candidate</h2>
                        <form onSubmit={handleSubmitCandidate} className="space-y-4">
                            <div>
                                <label>Select Candidate</label>
                                <select
                                    className="w-full p-2 border rounded bg-transparent"
                                    value={selectedCandidate}
                                    onChange={(e) => setSelectedCandidate(e.target.value)}
                                    required
                                >
                                    <option value="">-- Choose Candidate --</option>
                                    {candidates.map(c => (
                                        <option key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.email})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label>Submitted Rate</label>
                                <input
                                    className="w-full p-2 border rounded bg-transparent"
                                    value={submittedRate}
                                    onChange={(e) => setSubmittedRate(e.target.value)}
                                    placeholder="$75/hr"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsSubmitModalOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={submitting}>Submit</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Schedule Interview Modal */}
            {selectedSubmissionId && (
                <ScheduleInterviewModal
                    submissionId={selectedSubmissionId}
                    isOpen={isScheduleModalOpen}
                    onClose={() => setIsScheduleModalOpen(false)}
                    onSuccess={() => {
                        fetchSubmissions(); // Refresh submissions status
                        setIsScheduleModalOpen(false);
                    }}
                />
            )}
        </div>
    );
}
