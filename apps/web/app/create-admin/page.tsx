'use client';

import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase/config';
import { Button } from '../../components/ui/button';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CreateAdminPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    // Hardcoded credentials as requested
    const email = 'test.swagath@gmail.com';
    const password = 'Test@2026';

    const handleCreate = async () => {
        setLoading(true);
        setStatus('idle');
        setMessage('');

        try {
            // 1. Create Auth User
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Generate Team ID
            const teamId = `team_${user.uid.slice(0, 8)}`;

            // 3. Create Team Document
            await setDoc(doc(db, 'teams', teamId), {
                name: "Master Admin's Org",
                industry: 'Technology',
                createdAt: serverTimestamp(),
                ownerId: user.uid
            });

            // 4. Create User Document
            await setDoc(doc(db, 'users', user.uid), {
                email: user.email,
                firstName: 'Master',
                lastName: 'Admin',
                role: 'admin',
                teamId: teamId,
                createdAt: serverTimestamp()
            });

            setStatus('success');
            setMessage('Admin account created successfully! You are now logged in.');

            // Optional: Redirect after delay
            setTimeout(() => {
                router.push('/dashboard');
            }, 3000);

        } catch (error: any) {
            console.error('Error creating admin:', error);
            setStatus('error');
            if (error.code === 'auth/email-already-in-use') {
                setMessage('Error: This email is already in use. You might already have an account.');
            } else {
                setMessage(`Error: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
                <h1 className="text-2xl font-bold mb-4 text-center text-gray-900">Create Master Admin</h1>

                <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100">
                    <h3 className="text-sm font-semibold text-blue-900 mb-2">Credentials to be created:</h3>
                    <div className="text-sm text-blue-800">
                        <p><span className="font-medium">Email:</span> {email}</p>
                        <p><span className="font-medium">Password:</span> {password}</p>
                    </div>
                </div>

                <Button
                    onClick={handleCreate}
                    disabled={loading || status === 'success'}
                    className="w-full h-12 text-lg"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Creating...
                        </>
                    ) : status === 'success' ? (
                        'Created!'
                    ) : (
                        'Create Account'
                    )}
                </Button>

                {status === 'success' && (
                    <div className="mt-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
                        <CheckCircle size={20} />
                        <div>
                            <p className="font-medium">Success!</p>
                            <p className="text-sm mt-1">Redirecting to dashboard...</p>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-start gap-2">
                        <AlertTriangle className="shrink-0 mt-0.5" size={16} />
                        <p className="text-sm">{message}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
