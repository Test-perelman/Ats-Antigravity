'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/firebase/AuthContext';
import { db } from '../../lib/firebase/config';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { Button } from '../../components/ui/button';
import { LayoutGrid, List, Search, Plus, Filter, FileText, User, Briefcase, Clock, CheckCircle, XCircle } from 'lucide-react';

interface Submission {
    id: string;
    candidateId: string;
    candidateName: string;
    jobId: string;
    jobTitle: string;
    status: string; // 'submitted', 'screening', 'interview', 'offered', 'hired', 'rejected'
    createdAt: any;
}

export default function SubmissionsPage() {
    const router = useRouter();
    const { userData } = useAuth();
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'pipeline' | 'table'>('pipeline');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!userData?.teamId) return;

        const q = query(
            collection(db, 'teams', userData.teamId, 'submissions'),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Submission[];
            setSubmissions(list);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userData?.teamId]);

    // Stats
    const stats = {
        total: submissions.length,
        submitted: submissions.filter(s => s.status === 'submitted').length,
        screening: submissions.filter(s => s.status === 'screening').length,
        interviews: submissions.filter(s => s.status === 'interviewing' || s.status === 'interview').length,
        offers: submissions.filter(s => s.status === 'offered').length,
    };

    const filteredSubmissions = submissions.filter(s =>
        s.candidateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stages = [
        { id: 'submitted', label: 'Submitted', color: 'bg-blue-50 border-blue-200' },
        { id: 'screening', label: 'Screening', color: 'bg-indigo-50 border-indigo-200' },
        { id: 'interviewing', label: 'Interview', color: 'bg-yellow-50 border-yellow-200' },
        { id: 'offered', label: 'Offered', color: 'bg-green-50 border-green-200' },
        { id: 'rejected', label: 'Rejected', color: 'bg-red-50 border-red-200' }
    ];

    return (
        <div className="container p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Submissions</h1>
                    <p className="text-gray-500">Track candidate submissions through the pipeline</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode('pipeline')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'pipeline' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <LayoutGrid size={16} />
                            Pipeline View
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${viewMode === 'table' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <List size={16} />
                            Table View
                        </button>
                    </div>
                    <Button onClick={() => router.push('/submissions/new')} className="bg-amber-500 hover:bg-amber-600 text-white">
                        <Plus size={18} className="mr-2" />
                        New Submission
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-5 gap-4 mb-8">
                <div className="bg-white p-4 rounded-xl border shadow-sm">
                    <div className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</div>
                    <div className="text-sm text-gray-500 font-medium">Total Submissions</div>
                </div>
                <div className="bg-white p-4 rounded-xl border shadow-sm">
                    <div className="text-3xl font-bold text-gray-900 mb-1">{stats.submitted}</div>
                    <div className="text-sm text-gray-500 font-medium">Submitted</div>
                </div>
                <div className="bg-white p-4 rounded-xl border shadow-sm">
                    <div className="text-3xl font-bold text-gray-900 mb-1">{stats.screening}</div>
                    <div className="text-sm text-gray-500 font-medium">In Screening</div>
                </div>
                <div className="bg-white p-4 rounded-xl border shadow-sm">
                    <div className="text-3xl font-bold text-gray-900 mb-1">{stats.interviews}</div>
                    <div className="text-sm text-gray-500 font-medium">Interviews</div>
                </div>
                <div className="bg-white p-4 rounded-xl border shadow-sm">
                    <div className="text-3xl font-bold text-gray-900 mb-1">{stats.offers}</div>
                    <div className="text-sm text-gray-500 font-medium">Offers</div>
                </div>
            </div>

            {/* Search */}
            <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search submissions..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>
                <select className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary">
                    <option>All Jobs</option>
                </select>
                <Button variant="outline" className="px-6">
                    Search
                </Button>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading pipeline...</div>
            ) : viewMode === 'pipeline' ? (
                /* Pipeline View */
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {stages.map(stage => {
                        const stageItems = filteredSubmissions.filter(s => (s.status || 'submitted').toLowerCase() === stage.id);
                        return (
                            <div key={stage.id} className={`flex-1 min-w-[280px] rounded-xl p-4 border ${stage.color} min-h-[500px]`}>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-semibold text-gray-700">{stage.label}</h3>
                                    <span className="bg-white/50 text-gray-600 px-2 py-0.5 rounded text-xs font-bold">{stageItems.length}</span>
                                </div>
                                <div className="space-y-3">
                                    {stageItems.length === 0 ? (
                                        <div className="text-center py-8 text-gray-400 text-sm italic">No submissions</div>
                                    ) : (
                                        stageItems.map(item => (
                                            <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100">
                                                <div className="font-semibold text-gray-900 mb-1">{item.candidateName}</div>
                                                <div className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                                                    <Briefcase size={12} />
                                                    {item.jobTitle}
                                                </div>
                                                <div className="flex justify-between items-end">
                                                    <div className="text-xs text-gray-400 flex items-center gap-1">
                                                        <Clock size={12} />
                                                        {new Date(item.createdAt?.toDate ? item.createdAt.toDate() : item.createdAt).toLocaleDateString()}
                                                    </div>
                                                    <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">View</Button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* Table View */
                <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-700">Candidate</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Job Requirement</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                                <th className="px-6 py-4 font-semibold text-gray-700">Applied Date</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredSubmissions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No submissions found.</td>
                                </tr>
                            ) : (
                                filteredSubmissions.map(item => (
                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{item.candidateName}</td>
                                        <td className="px-6 py-4 text-gray-600">{item.jobTitle}</td>
                                        <td className="px-6 py-4">
                                            <span className="capitalize bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(item.createdAt?.toDate ? item.createdAt.toDate() : item.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button variant="ghost" size="sm" className="h-8">Details</Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
