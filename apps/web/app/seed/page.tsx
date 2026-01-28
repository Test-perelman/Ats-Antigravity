'use client';

import React, { useState } from 'react';
import { useAuth } from '../../lib/firebase/AuthContext';
import { db } from '../../lib/firebase/config';
import { collection, addDoc, writeBatch, doc } from 'firebase/firestore';
import { Button } from '../../components/ui/button';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

export default function SeedPage() {
    const { userData } = useAuth();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<string | null>(null);
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

    const generateRandomId = () => Math.random().toString(36).substr(2, 9);

    const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

        // Data Generators
        const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth'];
        const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
        const jobTitles = ['Software Engineer', 'Product Manager', 'Data Scientist', 'UX Designer', 'DevOps Engineer', 'Sales Representative', 'Marketing Manager', 'HR Specialist', 'Accountant', 'Project Manager'];
        const skillsList = ['React', 'Node.js', 'Python', 'AWS', 'Java', 'SQL', 'Figma', 'Kubernetes', 'TypeScript', 'Go', 'Salesforce', 'Excel'];
        const industries = ['Technology', 'Finance', 'Healthcare', 'Retail', 'Manufacturing', 'Education', 'Consulting'];
        const companies = ['Acme Corp', 'Globex', 'Soylent Corp', 'Initech', 'Umbrella Corp', 'Stark Ind', 'Wayne Ent', 'Cyberdyne', 'Massive Dynamic', 'Hooli'];
        const cities = ['New York', 'San Francisco', 'London', 'Berlin', 'Tokyo', 'Austin', 'Seattle', 'Boston', 'Chicago', 'Denver'];

    const handleSeed = async () => {
        if (!userData?.teamId) {
            setStatus('error');
        addLog('Error: No Team ID found. Please login.');
        return;
        }

        setLoading(true);
        setStatus(null);
        setLogs([]);
        addLog('Starting seed process...');

        try {
            const batch = writeBatch(db);
        const teamRef = collection(db, 'teams', userData.teamId, 'dummy_placeholder'); // Just to get path

        // Store created IDs to link entities
        const clientIds: {id: string, name: string}[] = [];
        const jobIds: {id: string, title: string}[] = [];
        const candidateIds: {id: string, name: string}[] = [];
        const projectIds: {id: string, name: string}[] = [];

        // 1. Clients (10)
        addLog('Creating 10 Clients...');
        for (let i = 0; i < 10; i++) {
                const name = `${randomItem(companies)} ${generateRandomId().substring(0, 3).toUpperCase()}`;
        const newDocRef = doc(collection(db, 'teams', userData.teamId, 'clients'));
        batch.set(newDocRef, {
            name: name,
        contactPerson: `${randomItem(firstNames)} ${randomItem(lastNames)}`,
        email: `contact@${name.replace(/\s/g, '').toLowerCase()}.com`,
        industry: randomItem(industries),
        createdAt: new Date()
                });
        clientIds.push({id: newDocRef.id, name });
            }

        // 2. Candidates (10)
        addLog('Creating 10 Candidates...');
        for (let i = 0; i < 10; i++) {
                const fname = randomItem(firstNames);
        const lname = randomItem(lastNames);
        const newDocRef = doc(collection(db, 'teams', userData.teamId, 'candidates'));
        batch.set(newDocRef, {
            firstName: fname,
        lastName: lname,
        email: `${fname.toLowerCase()}.${lname.toLowerCase()}${Math.floor(Math.random() * 100)}@example.com`,
        title: randomItem(jobTitles),
        status: randomItem(['new', 'interviewing', 'offer', 'hired', 'rejected']),
        skills: [randomItem(skillsList), randomItem(skillsList), randomItem(skillsList)],
        experience: Math.floor(Math.random() * 15) + 1,
        visaStatus: randomItem(['Citizen', 'Green Card', 'H1B', 'OPT']),
        createdAt: new Date()
                });
        candidateIds.push({id: newDocRef.id, name: `${fname} ${lname}` });
            }

        // 3. Jobs (10) - Linked to Clients
        addLog('Creating 10 Jobs...');
        for (let i = 0; i < 10; i++) {
                const client = randomItem(clientIds);
        const title = randomItem(jobTitles);
        const newDocRef = doc(collection(db, 'teams', userData.teamId, 'jobs'));
        batch.set(newDocRef, {
            title: title,
        location: randomItem(cities),
        maxRate: `$${Math.floor(Math.random() * 100) + 50}/hr`,
        status: 'open',
        clientName: client.name,
        clientId: client.id,
        createdAt: new Date(),
        description: 'This is a dummy job description generated for testing purposes.'
                });
        jobIds.push({id: newDocRef.id, title });
            }

        // 4. Projects (10) - Linked to Clients
        addLog('Creating 10 Projects...');
        for (let i = 0; i < 10; i++) {
                const client = randomItem(clientIds);
        const newDocRef = doc(collection(db, 'teams', userData.teamId, 'projects'));
        const name = `Project ${randomItem(['Alpha', 'Beta', 'Gamma', 'Delta', 'Omega'])} - ${client.name}`;
        batch.set(newDocRef, {
            name: name,
        status: randomItem(['active', 'completed', 'active', 'active']), // mostly active
        startDate: new Date(),
        clientId: client.id,
        clientName: client.name,
        createdAt: new Date()
                });
        projectIds.push({id: newDocRef.id, name });
            }

        // 5. Submissions (10) - Linked to Candidates and Jobs
        addLog('Creating 10 Submissions...');
        for (let i = 0; i < 10; i++) {
                const candidate = randomItem(candidateIds);
        const job = randomItem(jobIds);
        const newDocRef = doc(collection(db, 'teams', userData.teamId, 'submissions'));
        batch.set(newDocRef, {
            candidateId: candidate.id,
        candidateName: candidate.name,
        jobId: job.id,
        jobTitle: job.title,
        status: randomItem(['submitted', 'screening', 'interviewing', 'offered', 'rejected']),
        createdAt: new Date()
                });
            }

        // 6. Interviews (10) - Linked to Candidates/Jobs (loosely)
        addLog('Creating 10 Interviews...');
        for (let i = 0; i < 10; i++) {
                const candidate = randomItem(candidateIds);
        const job = randomItem(jobIds);
        const newDocRef = doc(collection(db, 'teams', userData.teamId, 'interviews'));
        const scheduledDate = new Date();
        scheduledDate.setDate(scheduledDate.getDate() + Math.floor(Math.random() * 7)); // Next 7 days

        batch.set(newDocRef, {
            candidateName: candidate.name,
        jobTitle: job.title,
        interviewerName: `${randomItem(firstNames)} ${randomItem(lastNames)}`,
        scheduledAt: scheduledDate,
        status: 'scheduled',
        mode: randomItem(['video', 'phone', 'onsite']),
        round: randomItem(['Screening', 'Technical', 'Manager', 'Final']),
        createdAt: new Date()
                });
            }

        // 7. Timesheets (10) - Linked to Projects/Candidates
        addLog('Creating 10 Timesheets...');
        for (let i = 0; i < 10; i++) {
                const project = randomItem(projectIds);
        const candidate = randomItem(candidateIds);
        const newDocRef = doc(collection(db, 'teams', userData.teamId, 'timesheets'));
        const weekEnd = new Date();
        weekEnd.setDate(weekEnd.getDate() - (weekEnd.getDay() + 1)); // Last Saturday

        batch.set(newDocRef, {
            candidateName: candidate.name,
        // candidateId: candidate.id, // optional 
        projectName: project.name,
        projectId: project.id,
        weekEnding: weekEnd,
        totalHours: 40,
        status: randomItem(['submitted', 'approved', 'rejected']),
        createdAt: new Date()
                });
            }

        // 8. Vendors (10)
        addLog('Creating 10 Vendors...');
        for (let i = 0; i < 10; i++) {
                const name = `${randomItem(companies)} Staffing`;
        const newDocRef = doc(collection(db, 'teams', userData.teamId, 'vendors'));
        batch.set(newDocRef, {
            name: name,
        email: `support@${name.replace(/\s/g, '').toLowerCase()}.com`,
        phone: `555-01${Math.floor(Math.random() * 99)}`,
        serviceType: randomItem(['Recruiting', 'Payroll', 'Background Checks', 'Training']),
        status: randomItem(['active', 'active', 'inactive']),
        createdAt: new Date()
                });
            }

        // 9. Immigration (10)
        addLog('Creating 10 Immigration Cases...');
        for (let i = 0; i < 10; i++) {
            const candidate = randomItem(candidateIds);
        const newDocRef = doc(collection(db, 'teams', userData.teamId, 'immigration'));
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + Math.floor(Math.random() * 3) + 1); // 1-4 years out

        batch.set(newDocRef, {
            candidateName: candidate.name,
        visaType: randomItem(['H1B', 'GC-EAD', 'OPT', 'TN', 'L1']),
        status: randomItem(['filed', 'approved', 'rfe', 'denied', 'expired']),
        expiryDate: expiryDate.toISOString().split('T')[0],
        createdAt: new Date()
            });
        }

        // 10. Invoices (10) - Linked to Clients
        addLog('Creating 10 Invoices...');
        for (let i = 0; i < 10; i++) {
                 const client = randomItem(clientIds);
        const newDocRef = doc(collection(db, 'teams', userData.teamId, 'invoices'));
        const issueDate = new Date();
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);

        batch.set(newDocRef, {
            invoiceNumber: `INV-${202400 + i}`,
        clientName: client.name,
        clientId: client.id,
        amount: Math.floor(Math.random() * 10000) + 1000,
        issueDate: issueDate.toISOString().split('T')[0],
        dueDate: dueDate.toISOString().split('T')[0],
        status: randomItem(['draft', 'sent', 'paid', 'overdue']),
        createdAt: new Date()
                 });
             }

        addLog('Committing batch write...');
        await batch.commit();
        addLog('Success! All records created.');
        setStatus('success');

        } catch (error) {
            console.error(error);
        setStatus('error');
        addLog(`Error: ${error}`);
        } finally {
            setLoading(false);
        }
    };

        return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
                <h1 className="text-2xl font-bold mb-2 text-center text-gray-900">Database Seeder</h1>
                <p className="text-gray-500 mb-6 text-center text-sm">
                    Generate 10 dummy records for all main entities.
                </p>

                {!userData?.teamId && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg mb-6 flex items-start gap-3 text-sm">
                        <AlertTriangle className="shrink-0 mt-0.5" size={16} />
                        <div>
                            You are not logged in or do not have a Team ID. Please login to the main app first, then return here.
                        </div>
                    </div>
                )}

                <Button
                    onClick={handleSeed}
                    disabled={loading || !userData?.teamId}
                    className="w-full h-12 text-lg bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Seeding...
                        </>
                    ) : (
                        'Generate Data'
                    )}
                </Button>

                {status === 'success' && (
                    <div className="mt-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
                        <CheckCircle size={20} />
                        <span className="font-medium">Data seeded successfully!</span>
                    </div>
                )}

                <div className="mt-6 max-h-60 overflow-y-auto bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs">
                    {logs.length === 0 ? (
                        <span className="text-gray-600">// Logs will appear here...</span>
                    ) : (
                        logs.map((log, i) => <div key={i}>{log}</div>)
                    )}
                </div>
            </div>
        </div>
        );
}
