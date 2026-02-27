'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import BottomNav from '@/components/BottomNav';
import { QrCode, Download, Share2, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { LabourProfile } from '@/lib/types';
import { getDocument, COLLECTIONS } from '@/lib/firestore';

export default function IDCardPage() {
    const { user } = useAuth();
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

    if (loading) {
        return (
            <div className="page-container">
                <div className="skeleton h-[400px] rounded-2xl" />
                <BottomNav role="labour" />
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">🪪 My ID Card</h1>
            </div>

            {/* ID Card */}
            <div className="relative overflow-hidden rounded-2xl animate-fade-in" style={{
                background: 'linear-gradient(135deg, #1a2236 0%, #0f172a 50%, #1a2236 100%)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
            }}>
                {/* Header strip */}
                <div className="h-2" style={{ background: 'linear-gradient(90deg, #f59e0b, #f97316, #ef4444)' }} />

                <div className="p-6">
                    {/* Company Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="font-black text-lg gradient-text">LabourNet</h2>
                            <p className="text-muted text-xs">Digital Identity Card</p>
                        </div>
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${profile?.status === 'approved'
                                ? 'bg-success/10 text-success border border-success/30'
                                : 'bg-warning/10 text-warning border border-warning/30'
                            }`}>
                            {profile?.status === 'approved' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                            {profile?.status?.toUpperCase() || 'PENDING'}
                        </div>
                    </div>

                    {/* Photo + Info */}
                    <div className="flex gap-5 mb-6">
                        <div className="w-24 h-28 rounded-xl bg-card/50 border border-border flex items-center justify-center flex-shrink-0">
                            <span className="text-4xl">👷</span>
                        </div>
                        <div className="flex-1 space-y-2">
                            <div>
                                <p className="text-muted text-[10px] uppercase tracking-wider">Name</p>
                                <p className="font-bold text-sm">{profile?.displayName || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-muted text-[10px] uppercase tracking-wider">ID</p>
                                <p className="font-bold text-sm text-accent">{profile?.labourId || 'LAB-2026-XXXX'}</p>
                            </div>
                            <div>
                                <p className="text-muted text-[10px] uppercase tracking-wider">Skill</p>
                                <p className="font-bold text-sm capitalize">{profile?.skillType || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-card/30 rounded-xl p-3">
                            <p className="text-muted text-[10px] uppercase tracking-wider mb-1">Location</p>
                            <p className="text-xs font-semibold">{profile?.city}, {profile?.state}</p>
                        </div>
                        <div className="bg-card/30 rounded-xl p-3">
                            <p className="text-muted text-[10px] uppercase tracking-wider mb-1">Rate</p>
                            <p className="text-xs font-semibold text-accent">₹{profile?.ratePerDay}/day</p>
                        </div>
                        <div className="bg-card/30 rounded-xl p-3">
                            <p className="text-muted text-[10px] uppercase tracking-wider mb-1">Reliability</p>
                            <p className="text-xs font-semibold text-success">{profile?.reliabilityScore || 100}%</p>
                        </div>
                        <div className="bg-card/30 rounded-xl p-3">
                            <p className="text-muted text-[10px] uppercase tracking-wider mb-1">Aadhaar</p>
                            <p className="text-xs font-semibold text-success">✔ Verified</p>
                        </div>
                    </div>

                    {/* QR Code Placeholder */}
                    <div className="flex items-center justify-center">
                        <div className="w-32 h-32 bg-white rounded-xl flex items-center justify-center">
                            <QrCode size={80} className="text-[#0a0e1a]" />
                        </div>
                    </div>

                    <p className="text-center text-muted text-[10px] mt-3">
                        Scan to verify • labournet.app/verify/{profile?.labourId || 'XXXX'}
                    </p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
                <button className="btn-secondary flex-1">
                    <Download size={16} />
                    Download PDF
                </button>
                <button className="btn-secondary flex-1">
                    <Share2 size={16} />
                    Share
                </button>
            </div>

            <BottomNav role="labour" />
        </div>
    );
}
