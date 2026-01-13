'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/firebase/AuthContext';
import { db } from '../../../lib/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '../../../components/ui/button';
import { ArrowLeft, User, Briefcase, FileText, Upload, X, Paperclip } from 'lucide-react';

export default function NewCandidatePage() {
    const router = useRouter();
    const { userData } = useAuth();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'basic' | 'professional' | 'docs'>('basic');

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        title: '',
        skills: '',
        experience: 0,
        visaStatus: '',
        status: 'new',
        location: '',
        notes: '',
        linkedIn: '',
        currentCompany: '',
        desiredSalary: '',
        resumeUrl: '',
    });

    const [attachments, setAttachments] = useState<File[]>([]);

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
            alert('Error: No team associated with this user.');
            setLoading(false);
            return;
        }

        try {
            const candidatesRef = collection(db, 'teams', userData.teamId, 'candidates');
            const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s.length > 0);

            // Mock uploading attachments - in real app, upload to Storage and get URLs
            const attachmentMetadata = attachments.map(f => ({
                name: f.name,
                size: f.size,
                type: f.type,
                uploadedAt: new Date().toISOString()
            }));

            const docRef = await addDoc(candidatesRef, {
                ...formData,
                skills: skillsArray,
                experience: Number(formData.experience),
                fullName: `${formData.firstName} ${formData.lastName}`,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                createdBy: userData.uid,
                attachments: attachmentMetadata
            });

            // If notes exist, add them to the subcollection
            if (formData.notes.trim()) {
                const notesRef = collection(db, 'teams', userData.teamId, 'candidates', docRef.id, 'notes');
                await addDoc(notesRef, {
                    content: formData.notes,
                    createdAt: serverTimestamp(),
                    createdBy: userData.uid,
                    authorName: userData.firstName + ' ' + userData.lastName,
                    type: 'initial_remark'
                });
            }

            router.push('/candidates');
        } catch (error) {
            console.error('Failed to create candidate', error);
            alert('Failed to create candidate');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Add New Candidate</h1>
                    <p className="text-gray-500 mt-1">Create a new candidate profile.</p>
                </div>
                <Button variant="outline" onClick={() => router.back()} className="text-gray-600">
                    <ArrowLeft size={16} className="mr-2" />
                    Cancel
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
                        <User size={18} />
                        Basic Info
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('professional')}
                        className={`flex-1 py-4 px-6 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors
                            ${activeTab === 'professional' ? 'border-primary text-primary bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                    >
                        <Briefcase size={18} />
                        Professional Details
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
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">First Name <span className="text-red-500">*</span></label>
                                <input
                                    required
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="Jane"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name <span className="text-red-500">*</span></label>
                                <input
                                    required
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="Doe"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address <span className="text-red-500">*</span></label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="jane@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="+1 (555) 123-4567"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">LinkedIn URL</label>
                                <input
                                    type="url"
                                    value={formData.linkedIn || ''}
                                    onChange={(e) => setFormData({ ...formData, linkedIn: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="https://www.linkedin.com/in/..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Current Location</label>
                                <input
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="e.g. New York, NY"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="button" onClick={() => setActiveTab('professional')}>
                                Next: Professional Details
                            </Button>
                        </div>
                    </div>

                    {/* Professional Details Tab */}
                    <div className={activeTab === 'professional' ? 'block space-y-6' : 'hidden'}>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Years of Experience</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    value={formData.experience}
                                    onChange={(e) => setFormData({ ...formData, experience: Number(e.target.value) })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Current Title</label>
                                <input
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="e.g. Senior Software Engineer"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Current Company</label>
                            <input
                                value={formData.currentCompany || ''}
                                onChange={(e) => setFormData({ ...formData, currentCompany: e.target.value })}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                placeholder="Company Name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Work Authorization</label>
                            <select
                                value={formData.visaStatus}
                                onChange={(e) => setFormData({ ...formData, visaStatus: e.target.value })}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            >
                                <option value="">Select an option...</option>
                                <option value="US Citizen">US Citizen</option>
                                <option value="Green Card">Green Card</option>
                                <option value="H1B">H1B</option>
                                <option value="Opt/CPT">OPT/CPT</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Skills & Experience</label>
                            <textarea
                                value={formData.skills}
                                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                placeholder="React, Node.js, Python, AWS..."
                            />
                        </div>

                        {/* Compensation Section */}
                        <div className="pt-4 border-t border-gray-100">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Compensation</h3>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Desired Salary ($)</label>
                                <input
                                    type="number"
                                    value={formData.desiredSalary || ''}
                                    onChange={(e) => setFormData({ ...formData, desiredSalary: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="150000"
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
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Status & Notes</label>
                            <div className="mb-4">
                                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                >
                                    <option value="new">New</option>
                                    <option value="screening">Screening</option>
                                    <option value="interviewing">Interviewing</option>
                                    <option value="offered">Offered</option>
                                    <option value="hired">Hired</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Resume URL (Optional)</label>
                            <input
                                value={formData.resumeUrl || ''}
                                onChange={(e) => setFormData({ ...formData, resumeUrl: e.target.value })}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                placeholder="https://..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Attachments (Resume, Cover Letter)</label>
                            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                                <input
                                    type="file"
                                    multiple
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={handleFileChange}
                                />
                                <Upload className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                                <p className="text-sm font-medium text-gray-900">Click to upload or drag and drop</p>
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
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                placeholder="Add any notes about this candidate..."
                            />
                        </div>

                        <div className="flex justify-between pt-4 border-t mt-6">
                            <Button type="button" variant="ghost" onClick={() => setActiveTab('professional')}>Back</Button>
                            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary-dark text-white px-8">
                                {loading ? 'Creating...' : 'Create Candidate'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
