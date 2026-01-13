'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/firebase/AuthContext';
import { db } from '../lib/firebase/config';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Button } from './ui/button';
import { MessageSquare, Send } from 'lucide-react';

interface Note {
    id: string;
    text: string;
    createAt: any;
    userName: string;
}

interface NotesListProps {
    parentId: string;
    parentType: 'candidates' | 'projects' | 'clients' | 'invoices' | 'jobs';
}

export default function NotesList({ parentId, parentType }: NotesListProps) {
    const { userData } = useAuth();
    const [notes, setNotes] = useState<Note[]>([]);
    const [newNote, setNewNote] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!userData?.teamId || !parentId) return;

        // Notes are stored in a subcollection under the parent document
        // e.g., teams/{teamId}/{parentType}/{parentId}/notes
        const q = query(
            collection(db, 'teams', userData.teamId, parentType, parentId, 'notes'),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Note[];
            setNotes(list);
        });

        return () => unsubscribe();
    }, [userData?.teamId, parentId, parentType]);

    const handleAddNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNote.trim() || !userData?.teamId) return;

        setLoading(true);
        try {
            await addDoc(collection(db, 'teams', userData.teamId, parentType, parentId, 'notes'), {
                text: newNote,
                createdAt: serverTimestamp(),
                createdBy: userData.uid,
                userName: `${userData.firstName} ${userData.lastName}` || 'User'
            });
            setNewNote('');
        } catch (err) {
            console.error("Failed to add note", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 p-4 rounded-lg border">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <MessageSquare size={16} />
                Notes & Activity
            </h3>

            <div className="space-y-4 mb-4 max-h-60 overflow-y-auto pr-2">
                {notes.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No notes yet.</p>
                ) : (
                    notes.map(note => (
                        <div key={note.id} className="bg-white p-3 rounded shadow-sm text-sm">
                            <p className="text-gray-800 mb-1">{note.text}</p>
                            <div className="text-xs text-gray-400 flex justify-between">
                                <span>{note.userName}</span>
                                {/* Ideally format timestamp */}
                                <span>Recent</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <form onSubmit={handleAddNote} className="flex gap-2">
                <input
                    className="flex-1 text-sm p-2 border rounded focus:ring-2 focus:ring-primary focus:outline-none"
                    placeholder="Add a note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                />
                <Button size="sm" type="submit" disabled={loading || !newNote.trim()}>
                    <Send size={14} />
                </Button>
            </form>
        </div>
    );
}
