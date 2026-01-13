'use client';

import React from 'react';
import { useAuth } from '../../lib/firebase/AuthContext';
import { Button } from '../../components/ui/button';
import { Settings as SettingsIcon, Shield, Users, CreditCard } from 'lucide-react';

export default function SettingsPage() {
    const { userData } = useAuth();

    return (
        <div className="container p-6 max-w-4xl">
            <h1 className="title mb-8">Team Settings</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-1 border rounded-lg p-4 bg-white h-fit">
                    <nav className="space-y-2">
                        <Button variant="ghost" className="w-full justify-start bg-blue-50 text-blue-700">
                            <SettingsIcon size={16} className="mr-2" />
                            General
                        </Button>
                        <Button variant="ghost" className="w-full justify-start">
                            <Users size={16} className="mr-2" />
                            Team Members
                        </Button>
                        <Button variant="ghost" className="w-full justify-start">
                            <Shield size={16} className="mr-2" />
                            Roles & Permissions
                        </Button>
                        <Button variant="ghost" className="w-full justify-start">
                            <CreditCard size={16} className="mr-2" />
                            Billing
                        </Button>
                    </nav>
                </div>

                <div className="col-span-2 bg-white border rounded-lg p-6 shadow-sm">
                    <h2 className="text-xl font-bold mb-4">General Settings</h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
                            <input
                                type="text"
                                disabled
                                value={userData?.teamId || 'Loading...'}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">Contact support to change team name.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Primary Contact Email</label>
                            <input
                                type="email"
                                defaultValue={userData?.email || ''}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div className="pt-4 border-t">
                            <Button disabled>Save Changes (Demo)</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
