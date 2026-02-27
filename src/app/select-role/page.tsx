'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { setDocument, COLLECTIONS } from '@/lib/firestore';
import { HardHat, Building2, ChevronRight, Loader2 } from 'lucide-react';

export default function SelectRolePage() {
    const { user, refreshUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSelectRole = async (role: 'labour' | 'contractor') => {
        if (!user) return;
        setLoading(true);

        try {
            await setDocument(COLLECTIONS.USERS, user.uid, {
                uid: user.uid,
                role,
                status: 'pending',
                displayName: user.displayName || '',
                mobile: user.phoneNumber || '',
                updatedAt: Date.now(),
            });

            await refreshUser();

            if (role === 'labour') {
                router.replace('/labour/register');
            } else {
                router.replace('/contractor/register');
            }
        } catch (error) {
            console.error('Error setting role:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6">
            <div className="text-center mb-10 animate-fade-in">
                <h1 className="text-2xl font-black tracking-tight mb-2">I am a...</h1>
                <p className="text-secondary text-sm">Choose your role to continue</p>
            </div>

            <div className="w-full max-w-sm space-y-4">
                {/* Labour Card */}
                <button
                    onClick={() => handleSelectRole('labour')}
                    disabled={loading}
                    className="glass-card !p-6 w-full text-left flex items-center gap-5 animate-slide-up"
                    style={{ animationDelay: '100ms' }}
                >
                    <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <HardHat size={32} className="text-accent" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-lg font-bold mb-1">Labour</h2>
                        <p className="text-secondary text-sm leading-relaxed">
                            Find projects, earn daily, get digital ID card
                        </p>
                    </div>
                    <ChevronRight size={20} className="text-muted" />
                </button>

                {/* Contractor Card */}
                <button
                    onClick={() => handleSelectRole('contractor')}
                    disabled={loading}
                    className="glass-card !p-6 w-full text-left flex items-center gap-5 animate-slide-up"
                    style={{ animationDelay: '250ms' }}
                >
                    <div className="w-16 h-16 rounded-2xl bg-info/10 flex items-center justify-center flex-shrink-0">
                        <Building2 size={32} className="text-info" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-lg font-bold mb-1">Contractor</h2>
                        <p className="text-secondary text-sm leading-relaxed">
                            Post projects, manage labour, track attendance
                        </p>
                    </div>
                    <ChevronRight size={20} className="text-muted" />
                </button>
            </div>

            {loading && (
                <div className="mt-6 flex items-center gap-2 text-accent">
                    <Loader2 className="animate-spin" size={18} />
                    <span className="text-sm font-medium">Setting up...</span>
                </div>
            )}
        </div>
    );
}
