'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/firebase/AuthContext';
import { db } from '@/lib/firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import {
    Settings as SettingsIcon,
    Shield,
    Users,
    CreditCard,
    Activity,
    Lock,
    MoreHorizontal
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DynamicTable, { Column } from '@/components/ui/DynamicTable';

interface UserProfile {
    uid: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    status?: 'active' | 'suspended' | 'pending';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    lastLogin?: any;
}

interface AuditLog {
    id: string;
    action: string;
    actor: string;
    target: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    timestamp: any;
}

export default function SettingsPage() {
    const { userData } = useAuth();
    const [activeTab, setActiveTab] = useState('general');
    const [teamUsers, setTeamUsers] = useState<UserProfile[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);

    // Fetch Team Users
    useEffect(() => {
        if (!userData?.teamId || activeTab !== 'users') return;
        setLoadingUsers(true);
        const q = query(
            collection(db, 'users'),
            where('teamId', '==', userData.teamId)
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const users = snapshot.docs.map(doc => ({
                uid: doc.id,
                ...doc.data()
            })) as UserProfile[];
            setTeamUsers(users);
            setLoadingUsers(false);
        });
        return () => unsubscribe();
    }, [userData?.teamId, activeTab]);

    const renderGeneral = () => (
        <div className="space-y-6">
            <h2 className="text-xl font-bold mb-4">General Settings</h2>
            <div className="max-w-xl">
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
                    <input
                        type="text"
                        disabled
                        value={userData?.teamId || 'Loading...'} // In real app, fetch team name
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Ref: {userData?.teamId}</p>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Primary Contact Email</label>
                    <input
                        type="email"
                        disabled
                        defaultValue={userData?.email || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                </div>
            </div>
        </div>
    );

    const renderUsers = () => {
        const columns: Column<UserProfile>[] = [
            {
                id: 'name',
                label: 'User',
                render: (row) => (
                    <div>
                        <div className="font-medium">{row.firstName} {row.lastName}</div>
                        <div className="text-xs text-muted-foreground">{row.email}</div>
                    </div>
                )
            },
            {
                id: 'role',
                label: 'Role',
                render: (row) => (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground uppercase">
                        {row.role}
                    </span>
                )
            },
            {
                id: 'status',
                label: 'Status',
                render: (row) => (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium 
                        ${row.status === 'suspended' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {row.status || 'Active'}
                    </span>
                )
            },
            {
                id: 'actions',
                label: 'Actions',
                render: (row) => (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal size={16} />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem disabled={row.uid === userData?.uid}>Edit Role</DropdownMenuItem>
                            <DropdownMenuItem disabled={row.uid === userData?.uid} className="text-red-600">Suspend User</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            }
        ];

        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">User Management</h2>
                    <Button size="sm">Invite User</Button>
                </div>
                <DynamicTable<UserProfile>
                    id="users-table"
                    data={teamUsers}
                    columns={columns}
                    isLoading={loadingUsers}
                    emptyMessage="No users found."
                />
            </div>
        );
    };

    const renderPermissions = () => (
        <div className="space-y-6">
            <h2 className="text-xl font-bold mb-4">Roles & Permissions Matrix</h2>
            <div className="overflow-x-auto border rounded-xl">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-700 uppercase bg-secondary">
                        <tr>
                            <th className="px-6 py-3">Module</th>
                            <th className="px-6 py-3">Master Admin</th>
                            <th className="px-6 py-3">Team Admin</th>
                            <th className="px-6 py-3">Recruiter</th>
                            <th className="px-6 py-3">Viewer</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {['Candidates', 'Jobs', 'Submissions', 'Placements', 'Settings'].map((module) => (
                            <tr key={module} className="bg-white hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium">{module}</td>
                                <td className="px-6 py-4 text-green-600">Full Access</td>
                                <td className="px-6 py-4 text-green-600">Full Access</td>
                                <td className="px-6 py-4">
                                    {module === 'Settings' ? <span className="text-red-500">No Access</span> : 'Edit / View'}
                                </td>
                                <td className="px-6 py-4 text-gray-500">Read Only</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
                * Note: This is a read-only view of the current system permissions. To change these definitions, contact system support.
            </p>
        </div>
    );

    const renderAudit = () => {
        // Mock audit logs
        const mockLogs: AuditLog[] = [
            { id: '1', action: 'Login', actor: 'John Doe', target: 'System', timestamp: new Date() },
            { id: '2', action: 'Update Candidate', actor: 'Alice Smith', target: 'Jane Roe', timestamp: new Date(Date.now() - 3600000) },
            { id: '3', action: 'Create Job', actor: 'John Doe', target: 'Frontend Dev', timestamp: new Date(Date.now() - 86400000) },
        ];

        return (
            <div className="space-y-4">
                <h2 className="text-xl font-bold">Audit Logs</h2>
                <div className="space-y-2">
                    {mockLogs.map(log => (
                        <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg text-sm">
                            <div className="flex items-center gap-3">
                                <Activity size={16} className="text-muted-foreground" />
                                <span>
                                    <span className="font-semibold">{log.actor}</span> performed <span className="font-semibold">{log.action}</span> on {log.target}
                                </span>
                            </div>
                            <span className="text-gray-500 text-xs">
                                {log.timestamp.toLocaleString()}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container p-6 max-w-6xl">
            <h1 className="title mb-8">Settings</h1>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Sidebar Navigation */}
                <div className="md:col-span-3">
                    <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
                        <nav className="flex flex-col">
                            <button
                                onClick={() => setActiveTab('general')}
                                className={`flex items-center px-4 py-3 text-sm font-medium transition-colors border-l-4
                                ${activeTab === 'general' ? 'border-primary bg-primary/5 text-primary' : 'border-transparent hover:bg-gray-50'}`}
                            >
                                <SettingsIcon size={16} className="mr-3" />
                                General
                            </button>
                            <button
                                onClick={() => setActiveTab('users')}
                                className={`flex items-center px-4 py-3 text-sm font-medium transition-colors border-l-4
                                ${activeTab === 'users' ? 'border-primary bg-primary/5 text-primary' : 'border-transparent hover:bg-gray-50'}`}
                            >
                                <Users size={16} className="mr-3" />
                                User Management
                            </button>
                            <button
                                onClick={() => setActiveTab('permissions')}
                                className={`flex items-center px-4 py-3 text-sm font-medium transition-colors border-l-4
                                ${activeTab === 'permissions' ? 'border-primary bg-primary/5 text-primary' : 'border-transparent hover:bg-gray-50'}`}
                            >
                                <Shield size={16} className="mr-3" />
                                Roles & Permissions
                            </button>
                            <button
                                onClick={() => setActiveTab('billing')}
                                className={`flex items-center px-4 py-3 text-sm font-medium transition-colors border-l-4
                                ${activeTab === 'billing' ? 'border-primary bg-primary/5 text-primary' : 'border-transparent hover:bg-gray-50'}`}
                            >
                                <CreditCard size={16} className="mr-3" />
                                Billing
                            </button>
                            <button
                                onClick={() => setActiveTab('audit')}
                                className={`flex items-center px-4 py-3 text-sm font-medium transition-colors border-l-4
                                ${activeTab === 'audit' ? 'border-primary bg-primary/5 text-primary' : 'border-transparent hover:bg-gray-50'}`}
                            >
                                <Activity size={16} className="mr-3" />
                                Audit Logs
                            </button>
                        </nav>

                        {userData?.role === 'master_admin' && (
                            <div className="p-4 border-t bg-gray-50">
                                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Admin Zone</p>
                                <Button variant="destructive" size="sm" className="w-full justify-start">
                                    <Lock size={14} className="mr-2" />
                                    Suspended Mode
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="md:col-span-9">
                    <div className="bg-white border rounded-xl p-6 shadow-sm min-h-[500px]">
                        {activeTab === 'general' && renderGeneral()}
                        {activeTab === 'users' && renderUsers()}
                        {activeTab === 'permissions' && renderPermissions()}
                        {activeTab === 'audit' && renderAudit()}
                        {activeTab === 'billing' && (
                            <div className="text-center py-20">
                                <CreditCard size={48} className="mx-auto text-gray-300 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">Billing Portal</h3>
                                <p className="text-gray-500">Manage your subscription and invoices.</p>
                                <Button className="mt-4" disabled>Coming Soon</Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
