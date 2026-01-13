'use client';

import React, { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { Button } from '../../../components/ui/button';
import { useRouter } from 'next/navigation';

interface Team {
    id: string;
    name: string;
    industry: string;
    description: string;
}

export default function JoinTeamPage() {
    const router = useRouter();
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [requesting, setRequesting] = useState<string | null>(null);

    useEffect(() => {
        fetchTeams();
    }, []);

    const fetchTeams = async () => {
        try {
            const response = await api.get('/teams');
            setTeams(response.data);
        } catch (error) {
            console.error('Failed to fetch teams', error);
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async (teamId: string) => {
        setRequesting(teamId);
        try {
            await api.post(`/teams/${teamId}/join`);
            alert('Access request sent! Please wait for admin approval.');
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to send request');
        } finally {
            setRequesting(null);
        }
    };

    return (
        <div className="flex min-h-screen p-6 bg-secondary/30 justify-center">
            <div className="w-full max-w-4xl">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="title text-2xl">Join a Team</h1>
                        <p className="subtitle">Select a workspace to get started</p>
                    </div>
                    <Button variant="outline" onClick={() => router.push('/login')}>
                        Back to Login
                    </Button>
                </div>

                {loading ? (
                    <div>Loading teams...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {teams.map((team) => (
                            <div key={team.id} className="bg-card border rounded shadow p-6 flex flex-col items-start hover:shadow-md transition-shadow">
                                <div className="mb-4">
                                    <h3 className="font-bold text-lg">{team.name}</h3>
                                    <span className="text-xs font-medium bg-secondary px-2 py-1 rounded mt-1 inline-block">
                                        {team.industry || 'General'}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground mb-6 flex-grow">
                                    {team.description || 'No description available.'}
                                </p>
                                <Button
                                    className="w-full"
                                    onClick={() => handleJoin(team.id)}
                                    disabled={requesting === team.id}
                                >
                                    {requesting === team.id ? 'Sending...' : 'Request Access'}
                                </Button>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && teams.length === 0 && (
                    <div className="text-center p-12 text-muted-foreground bg-card border rounded dashed">
                        No discoverable teams found. Please contact an administrator.
                    </div>
                )}
            </div>
        </div>
    );
}
