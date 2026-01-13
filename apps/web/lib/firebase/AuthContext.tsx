'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    User,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection } from 'firebase/firestore';
import { auth, db } from './config';

interface UserData {
    uid: string;
    email: string;
    firstName: string;
    lastName: string;
    role: 'master_admin' | 'admin' | 'manager' | 'recruiter';
    teamId: string;
    createdAt: Date;
}

interface AuthContextType {
    user: User | null;
    userData: UserData | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                // Fetch user data from Firestore
                try {
                    const userDocRef = doc(db, 'users', firebaseUser.uid);
                    const userDoc = await getDoc(userDocRef);
                    if (userDoc.exists()) {
                        setUserData(userDoc.data() as UserData);
                    } else {
                        // RECOVERY: User exists in Auth but not in Firestore (legacy/error case)
                        console.warn('User missing in Firestore, attempting recovery...');

                        // Create a new Team
                        const teamRef = doc(collection(db, 'teams'));
                        await setDoc(teamRef, {
                            name: `${firebaseUser.displayName || 'User'}'s Team`,
                            createdAt: new Date(),
                            createdBy: firebaseUser.uid,
                            members: [firebaseUser.uid]
                        });

                        // Create user document
                        const newUserData: UserData = {
                            uid: firebaseUser.uid,
                            email: firebaseUser.email!,
                            firstName: firebaseUser.displayName?.split(' ')[0] || 'User',
                            lastName: firebaseUser.displayName?.split(' ')[1] || '',
                            role: 'admin',
                            teamId: teamRef.id,
                            createdAt: new Date()
                        };

                        await setDoc(userDocRef, newUserData);
                        setUserData(newUserData);
                        console.log('Recovery successful: User and Team created.');
                    }
                } catch (error) {
                    console.error('Error fetching/recovering user data:', error);
                }
            } else {
                setUserData(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
    };

    const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Create a new Team for this user
        const teamRef = doc(collection(db, 'teams'));
        await setDoc(teamRef, {
            name: `${firstName}'s Team`,
            createdAt: new Date(),
            createdBy: user.uid,
            members: [user.uid]
        });

        // Create user document in Firestore with Team ID
        const newUserData: UserData = {
            uid: user.uid,
            email: user.email!,
            firstName,
            lastName,
            role: 'admin', // First user is Admin
            teamId: teamRef.id,
            createdAt: new Date()
        };

        await setDoc(doc(db, 'users', user.uid), newUserData);
        setUserData(newUserData);
    };

    const signOut = async () => {
        await firebaseSignOut(auth);
        setUserData(null);
    };

    const resetPassword = async (email: string) => {
        await sendPasswordResetEmail(auth, email);
    };

    const value = {
        user,
        userData,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
