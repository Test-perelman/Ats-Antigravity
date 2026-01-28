'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../../lib/api';
import { Button } from '../../../../components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function CreateTeamPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        industry: '',
        description: '',
        isDiscoverable: true
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/teams', formData);
            alert('Team created successfully!');
            router.back();
        } catch (error: any) {
            console.error('Failed to create team', error);
            alert(error.response?.data?.message || 'Failed to create team');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container p-6 max-w-2xl">
            <Button variant="ghost" onClick={() => router.back()} className="mb-6 pl-0">
                <ArrowLeft size={16} className="mr-2" />
                Back
            </Button>

            <div className="bg-card border rounded shadow p-6">
                <h1 className="title mb-6">Create New Team</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name">Team Name</label>
                        <input
                            id="name"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Acme Corp"
                        />
                    </div>

                    <div>
                        <label htmlFor="industry">Industry</label>
                        <input
                            id="industry"
                            value={formData.industry}
                            onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                            placeholder="Technology"
                        />
                    </div>

                    <div>
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            className="w-full p-2 border rounded bg-transparent"
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Brief description of the company..."
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            id="isDiscoverable"
                            type="checkbox"
                            className="w-4 h-4"
                            checked={formData.isDiscoverable}
                            onChange={(e) => setFormData({ ...formData, isDiscoverable: e.target.checked })}
                        />
                        <label htmlFor="isDiscoverable" className="mb-0">
                            Make this team discoverable to new users
                        </label>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Team'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
