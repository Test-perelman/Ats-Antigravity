'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/firebase/AuthContext';
import { db } from '../../../lib/firebase/config';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '../../../components/ui/button';
import { ArrowLeft, FolderKanban, Calendar, FileText } from 'lucide-react';

interface Client {
    id: string;
    name: string;
}

export default function NewProjectPage() {
    const router = useRouter();
    const { userData } = useAuth();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'docs'>('basic');

    const [formData, setFormData] = useState({
        name: '',
        clientId: '',
        startDate: '',
        endDate: '',
        status: 'active',
        budget: 0,
        notes: ''
    });

    useEffect(() => {
        if (!userData?.teamId) return;

        // Fetch clients for dropdown from Firestore
        const fetchClients = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'teams', userData.teamId, 'clients'));
                const list = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    name: doc.data().name
                }));
                setClients(list);
            } catch (error) {
                console.error('Failed to fetch clients', error);
            }
        };
        fetchClients();
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
            const selectedClient = clients.find(c => c.id === formData.clientId);

            const docRef = await addDoc(collection(db, 'teams', userData.teamId, 'projects'), {
                name: formData.name,
                clientId: formData.clientId,
                clientName: selectedClient?.name || 'Unknown',
                startDate: new Date(formData.startDate),
                endDate: formData.endDate ? new Date(formData.endDate) : null,
                status: formData.status,
                budget: Number(formData.budget),
                value: Number(formData.budget),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                createdBy: userData.uid
            });

            // Add initial notes if present
            if (formData.notes.trim()) {
                const notesRef = collection(db, 'teams', userData.teamId, 'projects', docRef.id, 'notes');
                await addDoc(notesRef, {
                    content: formData.notes,
                    createdAt: serverTimestamp(),
                    createdBy: userData.uid,
                    authorName: userData.firstName + ' ' + userData.lastName,
                    type: 'initial_remark'
                });
            }

            router.push('/projects');
        } catch (error) {
            console.error('Failed to create project', error);
            alert('Failed to create project');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create New Project</h1>
                    <p className="text-gray-500 mt-1">Kickoff a new engagement.</p>
                </div>
                <Button variant="ghost" onClick={() => router.back()} className="text-gray-600">
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Projects
                </Button>
            </div>

            <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b bg-gray-50/50">
                    <button
                        type="button"
                        onClick={() => setActiveTab('basic')}
                        className={`flex-1 py-4 px-6 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors
                            ${activeTab === 'basic' ? 'border-primary text-primary bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                    >
                        <FolderKanban size={18} />
                        Basic Info
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('details')}
                        className={`flex-1 py-4 px-6 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors
                            ${activeTab === 'details' ? 'border-primary text-primary bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                    >
                        <Calendar size={18} />
                        Timeline & Budget
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('docs')}
                        className={`flex-1 py-4 px-6 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors
                            ${activeTab === 'docs' ? 'border-primary text-primary bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                    >
                        <FileText size={18} />
                        Docs & Notes
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8">
                    {/* Basic Info Tab */}
                    <div className={activeTab === 'basic' ? 'block space-y-6' : 'hidden'}>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Project Name <span className="text-red-500">*</span></label>
                            <input
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                placeholder="e.g. Q1 Development"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Client <span className="text-red-500">*</span></label>
                            <select
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                required
                                value={formData.clientId}
                                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                            >
                                <option value="">-- Select Client --</option>
                                {clients.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                            <select
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="active">Active</option>
                                <option value="completed">Completed</option>
                                <option value="on-hold">On Hold</option>
                            </select>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="button" onClick={() => setActiveTab('details')}>
                                Next: Timeline
                            </Button>
                        </div>
                    </div>

                    {/* Timeline & Budget Tab */}
                    <div className={activeTab === 'details' ? 'block space-y-6' : 'hidden'}>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date <span className="text-red-500">*</span></label>
                                <input
                                    type="date"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    required
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">End Date (Optional)</label>
                                <input
                                    type="date"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Budget ($)</label>
                            <input
                                type="number"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                value={formData.budget}
                                onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                                placeholder="0.00"
                            />
                        </div>

                        <div className="flex justify-between pt-4">
                            <Button type="button" variant="ghost" onClick={() => setActiveTab('basic')}>Back</Button>
                            <Button type="button" onClick={() => setActiveTab('docs')}>Next: Docs & Notes</Button>
                        </div>
                    </div>

                    {/* Docs & Notes Tab */}
                    <div className={activeTab === 'docs' ? 'block space-y-6' : 'hidden'}>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Project Documents (Contracts, SOW)</label>
                            <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center bg-gray-50">
                                <FileText className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                                <p className="text-sm font-medium text-gray-900">Document storage is not configured</p>
                                <p className="text-xs text-gray-500 mt-1">Track contract references in notes until storage is enabled.</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Initial Notes / Remarks</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                placeholder="Add any initial project definition notes here..."
                            />
                        </div>

                        <div className="flex justify-between pt-4 border-t mt-6">
                            <Button type="button" variant="ghost" onClick={() => setActiveTab('details')}>Back</Button>
                            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-white px-8">
                                {loading ? 'Creating...' : 'Create Project'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
