'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/firebase/AuthContext';
import { db } from '../../../lib/firebase/config';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '../../../components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface Project {
    id: string;
    name: string;
    code?: string;
}

interface Candidate {
    id: string;
    firstName: string;
    lastName: string;
}

export default function NewTimesheetPage() {
    const router = useRouter();
    const { userData } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [candidates, setCandidates] = useState<Candidate[]>([]);

    const [formData, setFormData] = useState({
        candidateId: '',
        projectId: '',
        weekEnding: '',
        totalHours: 0,
        notes: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!userData?.teamId) return;

        const fetchData = async () => {
            try {
                // Fetch Projects
                const projSnapshot = await getDocs(collection(db, 'teams', userData.teamId, 'projects'));
                const projList = projSnapshot.docs.map(doc => ({
                    id: doc.id,
                    name: doc.data().name,
                    code: doc.data().code
                }));
                setProjects(projList);

                // Fetch Candidates
                const candSnapshot = await getDocs(collection(db, 'teams', userData.teamId, 'candidates'));
                const candList = candSnapshot.docs.map(doc => ({
                    id: doc.id,
                    firstName: doc.data().firstName,
                    lastName: doc.data().lastName
                })) as Candidate[];
                setCandidates(candList);

            } catch (error) {
                console.error('Failed to fetch options', error);
            }
        };
        fetchData();
    }, [userData?.teamId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userData?.teamId) return;
        setLoading(true);

        try {
            // Denormalize names
            const selectedCandidate = candidates.find(c => c.id === formData.candidateId);
            const selectedProject = projects.find(p => p.id === formData.projectId);

            await addDoc(collection(db, 'teams', userData.teamId, 'timesheets'), {
                candidateId: formData.candidateId,
                candidateName: selectedCandidate ? `${selectedCandidate.firstName} ${selectedCandidate.lastName}` : 'Unknown',
                projectId: formData.projectId,
                projectName: selectedProject?.name || 'Unknown',
                weekEnding: new Date(formData.weekEnding), // Store as Date/Timestamp
                totalHours: Number(formData.totalHours),
                notes: formData.notes,
                status: 'submitted',
                createdAt: serverTimestamp(),
                createdBy: userData.uid
            });

            router.push('/timesheets');
        } catch (error) {
            console.error('Failed to create timesheet', error);
            alert('Failed to submit timesheet');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container p-6 max-w-2xl">
            <Button variant="ghost" onClick={() => router.back()} className="mb-6 pl-0">
                <ArrowLeft size={16} className="mr-2" />
                Back to Timesheets
            </Button>

            <div className="bg-card border rounded shadow p-6">
                <h1 className="title mb-6">Log Time</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label>Candidate</label>
                            <select
                                className="w-full p-2 border rounded bg-transparent"
                                value={formData.candidateId}
                                onChange={(e) => setFormData({ ...formData, candidateId: e.target.value })}
                                required
                            >
                                <option value="">-- Select Candidate --</option>
                                {candidates.map(c => (
                                    <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label>Project</label>
                            <select
                                className="w-full p-2 border rounded bg-transparent"
                                value={formData.projectId}
                                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                                required
                            >
                                <option value="">-- Select Project --</option>
                                {projects.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} {p.code ? `(${p.code})` : ''}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label>Week Ending</label>
                            <input
                                type="date"
                                className="w-full p-2 border rounded"
                                value={formData.weekEnding}
                                onChange={(e) => setFormData({ ...formData, weekEnding: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label>Total Hours</label>
                            <input
                                type="number"
                                className="w-full p-2 border rounded"
                                value={formData.totalHours}
                                onChange={(e) => setFormData({ ...formData, totalHours: Number(e.target.value) })}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label>Notes</label>
                        <textarea
                            className="w-full p-2 border rounded bg-transparent"
                            rows={3}
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Timesheet'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
