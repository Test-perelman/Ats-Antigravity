'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/firebase/AuthContext';
import { db } from '../../lib/firebase/config';
import { collection, query, orderBy, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { Button } from '../../components/ui/button';
import { Briefcase, Plus, Calendar, Building, Loader2 } from 'lucide-react';

interface Project {
    id: string;
    name: string;
    status: string;
    startDate: any; // Timestamp
    endDate?: any; // Timestamp
    clientId: string;
    clientName?: string; // Resolved from clientId
}

export default function ProjectsPage() {
    const router = useRouter();
    const { userData } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        if (!userData?.teamId) return;

        // Reference to the team's projects collection
        const q = query(
            collection(db, 'teams', userData.teamId, 'projects'),
            orderBy('startDate', 'desc')
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Project[];
            setProjects(list);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching projects:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userData?.teamId]);

    // Helper to format date safely
    const formatDate = (date: any) => {
        if (!date) return '';
        if (date.toDate) return date.toDate().toLocaleDateString(); // Firestore Timestamp
        return new Date(date).toLocaleDateString(); // String or Date object
    };

    const filteredProjects = projects.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.clientName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || (p.status || 'active') === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="container p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="title">Projects</h1>
                    <p className="subtitle">Manage active placements</p>
                </div>
                <Button onClick={() => router.push('/projects/new')} className="bg-amber-500 hover:bg-amber-600 text-white">
                    <Plus size={16} className="mr-2" />
                    New Project
                </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder="Search projects..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-w-[150px]"
                >
                    <option value="all">Select an option...</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On Hold</option>
                </select>
                <Button variant="outline" className="px-6">
                    Search
                </Button>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div className="p-12 text-center border rounded dashed bg-secondary/30">
                        {searchTerm ? (
                            <>
                                <h3 className="text-lg font-medium">No projects found matching your search</h3>
                                <p className="text-muted-foreground mb-4">Try adjusting your filters.</p>
                            </>
                        ) : (
                            <>
                                <h3 className="text-lg font-medium">No projects found. Create your first project!</h3>
                                <p className="text-muted-foreground mb-4">Projects track billable work for clients.</p>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredProjects.map(proj => (
                            <div key={proj.id} onClick={() => router.push(`/projects/${proj.id}`)} className="bg-card border rounded p-6 shadow-sm flex flex-col md:flex-row justify-between items-center hover:shadow-md transition-shadow cursor-pointer bg-white">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{proj.name}</h3>
                                    <div className="flex items-center gap-6 text-sm text-gray-500">
                                        <span className="flex items-center gap-1 font-medium text-gray-700">
                                            <Building size={14} /> {proj.clientName || 'Unknown Client'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            {formatDate(proj.startDate)}
                                            {proj.endDate ? ` - ${formatDate(proj.endDate)}` : ' - Ongoing'}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded text-xs uppercase font-bold tracking-wide ${(proj.status || 'active') === 'active' ? 'bg-green-100 text-green-800' :
                                                (proj.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800')
                                            }`}>
                                            {proj.status || 'Active'}
                                        </span>
                                    </div>
                                </div>
                                <div className="mt-4 md:mt-0 flex gap-2">
                                    <Button variant="ghost" size="sm">Edit</Button>
                                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); router.push('/timesheets'); }}>View Timesheets</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
