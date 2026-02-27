'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import BottomNav from '@/components/BottomNav';
import StatusBadge from '@/components/StatusBadge';
import { User, MapPin, Wrench, IndianRupee, Shield, Star, LogOut, ChevronRight, Phone } from 'lucide-react';
import { LabourProfile } from '@/lib/types';
import { getDocument, COLLECTIONS } from '@/lib/firestore';

export default function LabourProfilePage() {
    const { user, appUser, logout } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<LabourProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            try {
                const data = await getDocument<LabourProfile>(COLLECTIONS.LABOUR_PROFILES, user.uid);
                setProfile(data);
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
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

            {/* Profile Card */}
            <div className="glass-card !p-6 mb-6 animate-fade-in">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
                        <span className="text-3xl">👷</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-bold truncate">{profile?.displayName || 'Loading...'}</h2>
                        <p className="text-secondary text-sm">{profile?.labourId || 'ID Pending'}</p>
                        <StatusBadge status={profile?.status || 'pending'} />
                    </div>
                </div>
            </div>

            {/* Info Sections */}
            <div className="space-y-3 mb-6">
                {[
                    { icon: <Phone size={18} />, label: 'Mobile', value: appUser?.mobile || user?.phoneNumber || 'N/A' },
                    { icon: <Wrench size={18} />, label: 'Skill Type', value: profile?.skillType || 'N/A', capitalize: true },
                    { icon: <IndianRupee size={18} />, label: 'Rate / Day', value: `₹${profile?.ratePerDay || 0}` },
                    { icon: <MapPin size={18} />, label: 'Location', value: profile ? `${profile.city}, ${profile.state}` : 'N/A' },
                    { icon: <Shield size={18} />, label: 'Aadhaar', value: profile?.aadhaarVerified ? '✔ Verified' : 'Not Verified' },
                    { icon: <Star size={18} />, label: 'Reliability', value: `${profile?.reliabilityScore || 100}%` },
                ].map((item, i) => (
                    <div key={i} className="glass-card !p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-card flex items-center justify-center text-muted">
                            {item.icon}
                        </div>
                        <div className="flex-1">
                            <p className="text-muted text-xs">{item.label}</p>
                            <p className={`font-semibold text-sm ${item.capitalize ? 'capitalize' : ''}`}>{item.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Skills */}
            {profile?.skills && profile.skills.length > 0 && (
                <div className="glass-card !p-5 mb-6">
                    <h3 className="font-bold text-sm text-secondary mb-3">SKILLS</h3>
                    <div className="flex flex-wrap gap-2">
                        {profile.skills.map(skill => (
                            <span key={skill} className="badge badge-info">{skill}</span>
                        ))}
                    </div>
                </div>
            )}

            {/* Menu Items */}
            <div className="space-y-2 mb-8">
                {[
                    { label: 'My ID Card', href: '/labour/id-card' },
                    { label: 'Work History', href: '/labour/history' },
                    { label: 'My Applications', href: '/labour/projects' },
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

            {/* Logout */}
            <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-danger/10 text-danger font-semibold border border-danger/20 hover:bg-danger/20 transition-colors"
            >
                <LogOut size={18} />
                Sign Out
            </button>

            <BottomNav role="labour" />
        </div>
    );
}
