'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import { X } from 'lucide-react';
import { useAuth } from '../lib/firebase/AuthContext';
import { db } from '../lib/firebase/config';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

interface Props {
    submissionId: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ScheduleInterviewModal({ submissionId, isOpen, onClose, onSuccess }: Props) {
    const { userData } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        round: 'Round 1',
        scheduledAt: '',
        mode: 'video',
        interviewerName: ''
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userData?.teamId) return;

        setLoading(true);
        try {
            // 1. Create Interview Document
            await addDoc(collection(db, 'teams', userData.teamId, 'interviews'), {
                submissionId,
                ...formData,
                scheduledAt: new Date(formData.scheduledAt).toISOString(), // Keep as string or use Timestamp
                status: 'scheduled',
                createdBy: userData.uid,
                createdAt: serverTimestamp()
            });

            // 2. Update Submission Status
            const submissionRef = doc(db, 'teams', userData.teamId, 'submissions', submissionId);
            await updateDoc(submissionRef, {
                status: 'interviewing',
                updatedAt: serverTimestamp()
            });

            alert('Interview scheduled successfully!');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Failed to schedule interview', error);
            alert('Failed to schedule interview');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card p-6 rounded shadow-lg w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                    <X size={20} />
                </button>

                <h2 className="title text-xl mb-4">Schedule Interview</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label>Round</label>
                        <select
                            className="w-full p-2 border rounded bg-transparent"
                            value={formData.round}
                            onChange={(e) => setFormData({ ...formData, round: e.target.value })}
                        >
                            <option value="Round 1">Round 1 (Prescreen)</option>
                            <option value="Round 2">Round 2 (Technical)</option>
                            <option value="Round 3">Round 3 (Manager)</option>
                            <option value="Final">Final Round</option>
                        </select>
                    </div>

                    <div>
                        <label>Date & Time</label>
                        <input
                            type="datetime-local"
                            className="w-full p-2 border rounded bg-transparent"
                            required
                            value={formData.scheduledAt}
                            onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                        />
                    </div>

                    <div>
                        <label>Mode</label>
                        <select
                            className="w-full p-2 border rounded bg-transparent"
                            value={formData.mode}
                            onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                        >
                            <option value="video">Video Call</option>
                            <option value="phone">Phone Call</option>
                            <option value="onsite">On-site</option>
                        </select>
                    </div>

                    <div>
                        <label>Interviewer Name</label>
                        <input
                            className="w-full p-2 border rounded bg-transparent"
                            placeholder="e.g. John Doe"
                            value={formData.interviewerName}
                            onChange={(e) => setFormData({ ...formData, interviewerName: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Scheduling...' : 'Schedule'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
