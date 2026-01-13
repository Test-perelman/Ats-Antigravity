'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/firebase/AuthContext';
import { db } from '../../../lib/firebase/config';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { Button } from '../../../components/ui/button';
import { ArrowLeft, Briefcase, MapPin, DollarSign, FileText, Upload, X, Paperclip } from 'lucide-react';

interface Client {
    id: string;
    name: string;
}

export default function NewJobPage() {
    const router = useRouter();
    const { userData } = useAuth();
    const [clients, setClients] = useState<Client[]>([]);
    const [vendors, setVendors] = useState<Client[]>([]); // Using Client interface for simplicity {id, name}
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'docs'>('basic');

    const [formData, setFormData] = useState({
        title: '',
        clientId: '',
        vendorId: '',
        priority: 'Medium',
        status: 'Open',
        location: '',
        workMode: '',
        employmentType: '',
        duration: '',
        billRateMin: '',
        billRateMax: '',
        minExperience: 0,
        description: '',
        visaRequirements: '',
        notes: ''
    });

    const [attachments, setAttachments] = useState<File[]>([]);

    useEffect(() => {
        if (!userData?.teamId) return;

        const fetchData = async () => {
            try {
                // Fetch Clients
                const clientsSnapshot = await getDocs(collection(db, 'teams', userData.teamId, 'clients'));
                setClients(clientsSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name })));

                // Fetch Vendors
                const vendorsSnapshot = await getDocs(collection(db, 'teams', userData.teamId, 'vendors'));
                setVendors(vendorsSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name })));
            } catch (err) {
                console.error("Failed to fetch dropdown data", err);
            }
        };
        fetchData();
    }, [userData?.teamId]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setAttachments([...attachments, ...Array.from(e.target.files)]);
        }
    };

    const removeAttachment = (index: number) => {
        setAttachments(attachments.filter((_, i) => i !== index));
    };


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
            const selectedVendor = vendors.find(v => v.id === formData.vendorId);

            // Mock uploading attachments
            const attachmentMetadata = attachments.map(f => ({
                name: f.name,
                size: f.size,
                type: f.type,
                uploadedAt: new Date().toISOString()
            }));

            // Write to Firestore under the team's jobs subcollection
            const jobsRef = collection(db, 'teams', userData.teamId, 'jobs');
            const docRef = await addDoc(jobsRef, {
                ...formData,
                clientName: selectedClient?.name || 'Unknown',
                vendorName: selectedVendor?.name || '',
                minExperience: Number(formData.minExperience),
                billRateMin: formData.billRateMin ? Number(formData.billRateMin) : 0,
                billRateMax: formData.billRateMax ? Number(formData.billRateMax) : 0,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                createdBy: userData.uid,
                attachments: attachmentMetadata
            });

            // Add initial notes if present
            if (formData.notes.trim()) {
                const notesRef = collection(db, 'teams', userData.teamId, 'jobs', docRef.id, 'notes');
                await addDoc(notesRef, {
                    content: formData.notes,
                    createdAt: serverTimestamp(),
                    createdBy: userData.uid,
                    authorName: userData.firstName + ' ' + userData.lastName,
                    type: 'initial_remark'
                });
            }

            router.push('/jobs');
        } catch (error) {
            console.error('Failed to create job', error);
            alert('Failed to post job');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Add New Job Requirement</h1>
                    <p className="text-gray-500 mt-1">Enter job requirement information</p>
                </div>
                <Button variant="ghost" onClick={() => router.back()} className="text-gray-600">
                    <ArrowLeft size={16} className="mr-2" />
                    Back
                </Button>
            </div>

            <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
                {/* Tabs */}
                {/* Note: In a real app we might stick to the tab navigation, but for the "Requirement" screenshot design 
                    it looks like a long scrolling form or sectioned form.
                     However, preserving the tabbed structure as implemented in previous steps is cleaner for data density.
                     I will update the content of the tabs to match the fields.
                */}
                <div className="flex border-b bg-gray-50/50">
                    <button
                        type="button"
                        onClick={() => setActiveTab('basic')}
                        className={`flex-1 py-4 px-6 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors
                            ${activeTab === 'basic' ? 'border-primary text-primary bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                    >
                        <Briefcase size={18} />
                        Basic Information
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('details')}
                        className={`flex-1 py-4 px-6 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors
                            ${activeTab === 'details' ? 'border-primary text-primary bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                    >
                        <MapPin size={18} />
                        Job Details
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
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Job Title <span className="text-red-500">*</span></label>
                            <input
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g. Senior Software Engineer"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Client <span className="text-red-500">*</span></label>
                                <select
                                    required
                                    value={formData.clientId}
                                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                >
                                    <option value="">Select an option...</option>
                                    {clients.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Vendor</label>
                                <select
                                    value={formData.vendorId}
                                    onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                >
                                    <option value="">Select an option...</option>
                                    {vendors.map(v => (
                                        <option key={v.id} value={v.id}>{v.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Priority <span className="text-red-500">*</span></label>
                                <select
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                >
                                    <option value="High">High</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Low">Low</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Status <span className="text-red-500">*</span></label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                >
                                    <option value="Open">Open</option>
                                    <option value="On Hold">On Hold</option>
                                    <option value="Closed">Closed</option>
                                    <option value="Filled">Filled</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="button" onClick={() => setActiveTab('details')}>
                                Next: Job Details
                            </Button>
                        </div>
                    </div>

                    {/* Job Details Tab */}
                    <div className={activeTab === 'details' ? 'block space-y-6' : 'hidden'}>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                                <input
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="e.g. San Francisco, CA"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Work Mode</label>
                                <select
                                    value={formData.workMode}
                                    onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                >
                                    <option value="">Select an option...</option>
                                    <option value="Remote">Remote</option>
                                    <option value="Hybrid">Hybrid</option>
                                    <option value="Onsite">Onsite</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Employment Type</label>
                                <select
                                    value={formData.employmentType}
                                    onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                >
                                    <option value="">Select an option...</option>
                                    <option value="Full-time">Full-time</option>
                                    <option value="Contract">Contract</option>
                                    <option value="C2H">Contract to Hire</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Duration</label>
                                <input
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                    placeholder="e.g. 6 months"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Bill Rate Min ($/hr)</label>
                                <input
                                    type="number"
                                    value={formData.billRateMin}
                                    onChange={(e) => setFormData({ ...formData, billRateMin: e.target.value })}
                                    placeholder="80"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Bill Rate Max ($/hr)</label>
                                <input
                                    type="number"
                                    value={formData.billRateMax}
                                    onChange={(e) => setFormData({ ...formData, billRateMax: e.target.value })}
                                    placeholder="100"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mt-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Min Experience (Years)</label>
                                <input
                                    type="number"
                                    value={formData.minExperience}
                                    onChange={(e) => setFormData({ ...formData, minExperience: Number(e.target.value) })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Visa Requirements</label>
                                <input
                                    value={formData.visaRequirements}
                                    onChange={(e) => setFormData({ ...formData, visaRequirements: e.target.value })}
                                    placeholder="USC, GC, H1B"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex justify-between pt-4">
                            <Button type="button" variant="ghost" onClick={() => setActiveTab('basic')}>Back</Button>
                            <Button type="button" onClick={() => setActiveTab('docs')}>Next: Docs & Notes</Button>
                        </div>
                    </div>

                    {/* Docs & Notes Tab */}
                    <div className={activeTab === 'docs' ? 'block space-y-6' : 'hidden'}>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Job Description</label>
                            <textarea
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                rows={6}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Enter detailed job description..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Job Assets</label>
                            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                                <input
                                    type="file"
                                    multiple
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={handleFileChange}
                                />
                                <Upload className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                                <p className="text-sm font-medium text-gray-900">Click to upload or drag and drop</p>
                                <p className="text-xs text-gray-500 mt-1">PDF, DOCX up to 10MB</p>
                            </div>

                            {/* File List */}
                            {attachments.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    {attachments.map((file, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <Paperclip size={16} className="text-primary" />
                                                <span className="text-sm font-medium text-gray-700">{file.name}</span>
                                                <span className="text-xs text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeAttachment(idx)}
                                                className="text-gray-400 hover:text-red-500"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Internal Notes</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                placeholder="Add any internal notes about this requirement..."
                            />
                        </div>

                        <div className="flex justify-between pt-4 border-t mt-6">
                            <Button type="button" variant="ghost" onClick={() => setActiveTab('details')}>Back</Button>
                            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-white px-8">
                                {loading ? 'Saving...' : 'Save Job'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
