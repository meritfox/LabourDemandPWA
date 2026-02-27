'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import BottomNav from '@/components/BottomNav';
import StatusBadge from '@/components/StatusBadge';
import { User, Building2, MapPin, Phone, LogOut, ChevronRight } from 'lucide-react';
import { ContractorProfile } from '@/lib/types';
import { getDocument, COLLECTIONS } from '@/lib/firestore';

export default function ContractorProfilePage() {
    const { user, appUser, logout } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<ContractorProfile | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            try {
                const data = await getDocument<ContractorProfile>(COLLECTIONS.CONTRACTOR_PROFILES, user.uid);
                setProfile(data);
            } catch (error) {
                console.error('Error:', error);
            }
        };
        fetchProfile();
    }, [user]);

    const handleLogout = async () => {
        await logout();
        router.replace('/');
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">👤 Profile</h1>
            </div>

            <div className="glass-card !p-6 mb-6 animate-fade-in">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-info/10 flex items-center justify-center">
                        <Building2 size={28} className="text-info" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold">{profile?.displayName || 'Loading...'}</h2>
                        <p className="text-accent text-sm font-semibold">{profile?.companyName}</p>
                        <StatusBadge status={profile?.status || 'pending'} />
                    </div>
                </div>
            </div>

            <div className="space-y-3 mb-6">
                {[
                    { icon: <Phone size={18} />, label: 'Mobile', value: appUser?.mobile || user?.phoneNumber || 'N/A' },
                    { icon: <Building2 size={18} />, label: 'Company', value: profile?.companyName || 'N/A' },
                    { icon: <MapPin size={18} />, label: 'Location', value: profile ? `${profile.city}, ${profile.state}` : 'N/A' },
                ].map((item, i) => (
                    <div key={i} className="glass-card !p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-card flex items-center justify-center text-muted">
                            {item.icon}
                        </div>
                        <div className="flex-1">
                            <p className="text-muted text-xs">{item.label}</p>
                            <p className="font-semibold text-sm">{item.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="space-y-2 mb-8">
                {[
                    { label: 'My Projects', href: '/contractor' },
                    { label: 'Attendance', href: '/contractor/attendance' },
                    { label: 'Reports', href: '/contractor/reports' },
                ].map(item => (
                    <button
                        key={item.label}
                        onClick={() => router.push(item.href)}
                        className="glass-card !p-4 w-full flex items-center justify-between"
                    >
                        <span className="font-medium text-sm">{item.label}</span>
                        <ChevronRight size={16} className="text-muted" />
                    </button>
                ))}
            </div>

            <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-danger/10 text-danger font-semibold border border-danger/20 hover:bg-danger/20 transition-colors"
            >
                <LogOut size={18} />
                Sign Out
            </button>

            <BottomNav role="contractor" />
        </div>
    );
}
