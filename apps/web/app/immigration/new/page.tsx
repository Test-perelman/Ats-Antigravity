'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/firebase/AuthContext';
import { db } from '../../../lib/firebase/config';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { Button } from '../../../components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface Candidate {
    id: string;
    fullName: string;
}

export default function NewImmigrationCasePage() {
    const router = useRouter();
    const { userData } = useAuth();
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        candidateId: '',
        visaType: 'H1B',
        status: 'filed',
        startDate: '',
        expiryDate: '',
        notes: ''
    });

    useEffect(() => {
        if (!userData?.teamId) return;
        const fetchCandidates = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'teams', userData.teamId, 'candidates'));
                setCandidates(querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    fullName: `${doc.data().firstName} ${doc.data().lastName}`
                })));
            } catch (err) {
                console.error("Failed to fetch candidates", err);
            }
        };
        fetchCandidates();
    }, [userData?.teamId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!userData?.teamId) {
            alert('Error: No team associated.');
            setLoading(false);
            return;
        }

        try {
            const selectedCandidate = candidates.find(c => c.id === formData.candidateId);

            await addDoc(collection(db, 'teams', userData.teamId, 'immigration'), {
                ...formData,
                candidateName: selectedCandidate?.fullName || 'Unknown',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                createdBy: userData.uid
            });

            router.push('/immigration');
        } catch (error) {
            console.error('Failed to create case', error);
            alert('Failed to save case');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container p-6 max-w-2xl">
            <Button variant="ghost" onClick={() => router.back()} className="mb-6 pl-0 hover:bg-transparent hover:text-primary">
                <ArrowLeft size={16} className="mr-2" />
                Back to Immigration
            </Button>

            <div className="bg-white border rounded-xl shadow-md p-6">
                <h1 className="text-2xl font-bold mb-6 text-gray-900">Track New Visa Case</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Candidate</label>
                        <select
                            required
                            value={formData.candidateId}
                            onChange={(e) => setFormData({ ...formData, candidateId: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                        >
                            <option value="">-- Select Candidate --</option>
                            {candidates.map(c => (
                                <option key={c.id} value={c.id}>{c.fullName}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Visa Type</label>
                            <input
                                required
                                value={formData.visaType}
                                onChange={(e) => setFormData({ ...formData, visaType: e.target.value })}
                                placeholder="H1B, Green Card, OPT..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary bg-white"
                            >
                                <option value="filed">Filed</option>
                                <option value="approved">Approved</option>
                                <option value="rfe">RFE (Request for Evidence)</option>
                                <option value="denied">Denied</option>
                                <option value="expired">Expired</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                            <input
                                type="date"
                                required
                                value={formData.expiryDate}
                                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea
                            rows={3}
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
                        <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90">
                            {loading ? 'Save Case' : 'Track Case'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
