'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth as getAuth } from '@/lib/firebase';
import { getDocument, setDocument, COLLECTIONS } from '@/lib/firestore';
import { AppUser, UserRole } from '@/lib/types';

interface AuthContextType {
    user: User | null;
    appUser: AppUser | null;
    role: UserRole | null;
    loading: boolean;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    appUser: null,
    role: null,
    loading: true,
    logout: async () => { },
    refreshUser: async () => { },
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [appUser, setAppUser] = useState<AppUser | null>(null);
    const [role, setRole] = useState<UserRole | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchAppUser = async (firebaseUser: User) => {
        try {
            const userData = await getDocument<AppUser>(COLLECTIONS.USERS, firebaseUser.uid);
            if (userData) {
                setAppUser(userData);
                setRole(userData.role);
            } else {
                setAppUser(null);
                setRole(null);
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            setAppUser(null);
            setRole(null);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(getAuth(), async (firebaseUser) => {
            setUser(firebaseUser);
            if (firebaseUser) {
                await fetchAppUser(firebaseUser);
            } else {
                setAppUser(null);
                setRole(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        await signOut(getAuth());
        setUser(null);
        setAppUser(null);
        setRole(null);
    };

    const refreshUser = async () => {
        if (user) {
            await fetchAppUser(user);
        }
    };

    return (
        <AuthContext.Provider value={{ user, appUser, role, loading, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
