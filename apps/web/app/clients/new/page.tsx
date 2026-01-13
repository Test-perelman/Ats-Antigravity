'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/firebase/AuthContext';
import { db } from '../../../lib/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '../../../components/ui/button';
import { ArrowLeft, Building2, MapPin, Contact, FileText, Upload, X, Paperclip } from 'lucide-react';

export default function NewClientPage() {
    const router = useRouter();
    const { userData } = useAuth();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'basic' | 'contact' | 'docs'>('basic');

    const [formData, setFormData] = useState({
        name: '',
        industry: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        notes: ''
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
            alert('Error: No team associated.');
            setLoading(false);
            return;
        }

        try {
            // Mock uploading attachments
            const attachmentMetadata = attachments.map(f => ({
                name: f.name,
                size: f.size,
                type: f.type,
                uploadedAt: new Date().toISOString()
            }));

            const docRef = await addDoc(collection(db, 'teams', userData.teamId, 'clients'), {
                ...formData,
                createdAt: serverTimestamp(),
                createdBy: userData.uid,
                attachments: attachmentMetadata
            });

            // Add initial notes if present
            if (formData.notes.trim()) {
                const notesRef = collection(db, 'teams', userData.teamId, 'clients', docRef.id, 'notes');
                await addDoc(notesRef, {
                    content: formData.notes,
                    createdAt: serverTimestamp(),
                    createdBy: userData.uid,
                    authorName: userData.firstName + ' ' + userData.lastName,
                    type: 'initial_remark'
                });
            }

            router.push('/clients');
        } catch (error) {
            console.error('Failed to create client', error);
            alert('Failed to register client');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Add New Client</h1>
                    <p className="text-gray-500 mt-1">Register a new client company.</p>
                </div>
                <Button variant="ghost" onClick={() => router.back()} className="text-gray-600">
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Clients
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
                        <Building2 size={18} />
                        Company Info
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('contact')}
                        className={`flex-1 py-4 px-6 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors
                            ${activeTab === 'contact' ? 'border-primary text-primary bg-white' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                    >
                        <Contact size={18} />
                        Points of Contact
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
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Client Name <span className="text-red-500">*</span></label>
                            <input
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                placeholder="e.g. Acme Corp"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Industry</label>
                            <input
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                placeholder="e.g. Technology, Healthcare"
                                value={formData.industry}
                                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                            <input
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="123 Corporate Blvd..."
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="button" onClick={() => setActiveTab('contact')}>
                                Next: Contacts
                            </Button>
                        </div>
                    </div>

                    {/* Contact Tab */}
                    <div className={activeTab === 'contact' ? 'block space-y-6' : 'hidden'}>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Primary Contact Person</label>
                            <input
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                value={formData.contactPerson}
                                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                                <input
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Master Service Agreements (MSA)</label>
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
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Initial Notes</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                placeholder="Add notes about billing cycles, preferred terms, etc..."
                            />
                        </div>

                        <div className="flex justify-between pt-4 border-t mt-6">
                            <Button type="button" variant="ghost" onClick={() => setActiveTab('contact')}>Back</Button>
                            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-white px-8">
                                {loading ? 'Saving...' : 'Save Client'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
