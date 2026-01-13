'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../../lib/api';
import { Button } from '../../../../components/ui/button';
import { Check, X, ArrowLeft } from 'lucide-react';

interface AccessRequest {
    id: string;
    user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    status: string;
    createdAt: string;
}

// Next.js 15+ Params type handling
// params is a Promise in newer Next.js versions for async server components, 
// but in 'use client' we might need to handle it carefully or it comes as props.
// Standard App Router: params is prop.
export default function TeamDashboardPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    // Unwrap params using React.use() if strictly following React 19 / Next 15 patterns
    // or await it if it's a server component. Since this is 'use client', params comes as promise in Next 15.
    // Let's safe-guard:
    const resolvedParams = use(params);
    const teamId = resolvedParams.id;

    const [requests, setRequests] = useState<AccessRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, [teamId]);

    const fetchRequests = async () => {
        try {
            const response = await api.get(`/teams/${teamId}/requests`);
            setRequests(response.data);
        } catch (error) {
            console.error('Failed to fetch requests', error);
            // If 403, maybe redirect or show msg
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (requestId: string) => {
        try {
            await api.post(`/teams/${teamId}/requests/${requestId}/approve`);
            // Remove from list
            setRequests(current => current.filter(r => r.id !== requestId));
        } catch (error) {
            alert('Failed to approve request');
        }
    };

    const handleReject = async (requestId: string) => {
        if (!confirm('Are you sure you want to reject this user?')) return;
        try {
            await api.post(`/teams/${teamId}/requests/${requestId}/reject`);
            // Remove from list
            setRequests(current => current.filter(r => r.id !== requestId));
        } catch (error) {
            alert('Failed to reject request');
        }
    };

    return (
        <div className="container p-6">
            <Button variant="ghost" onClick={() => router.push('/candidates')} className="mb-6 pl-0">
                <ArrowLeft size={16} className="mr-2" />
                Back to Candidates
            </Button>

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="title text-2xl">Team Dashboard</h1>
                    <p className="subtitle">Manage memberships and settings</p>
                </div>
            </div>

            <div className="bg-card border rounded shadow p-6">
                <h2 className="font-semibold text-lg mb-4">Pending Access Requests</h2>

                {loading ? (
                    <div className="text-muted-foreground">Loading request...</div>
                ) : requests.length === 0 ? (
                    <div className="text-muted-foreground p-4 bg-secondary/50 rounded text-center">
                        No pending access requests.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {requests.map((req) => (
                            <div key={req.id} className="flex items-center justify-between p-4 border rounded bg-white">
                                <div>
                                    <div className="font-medium">{req.user.firstName} {req.user.lastName}</div>
                                    <div className="text-sm text-muted-foreground">{req.user.email}</div>
                                    <div className="text-xs text-muted-foreground mt-1">Requested: {new Date(req.createdAt).toLocaleDateString()}</div>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="destructive" onClick={() => handleReject(req.id)}>
                                        <X size={16} className="mr-2" /> Reject
                                    </Button>
                                    <Button size="sm" onClick={() => handleApprove(req.id)}>
                                        <Check size={16} className="mr-2" /> Approve
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
