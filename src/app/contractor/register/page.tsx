'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { setDocument, COLLECTIONS } from '@/lib/firestore';
import { Building2, ArrowRight, Loader2 } from 'lucide-react';

export default function ContractorRegisterPage() {
    const { user, refreshUser } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        displayName: '',
        companyName: '',
        gstNumber: '',
        state: '',
        city: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);

        try {
            await setDocument(COLLECTIONS.CONTRACTOR_PROFILES, user.uid, {
                uid: user.uid,
                userId: user.uid,
                displayName: form.displayName,
                companyName: form.companyName,
                gstNumber: form.gstNumber,
                location: { latitude: 0, longitude: 0 },
                state: form.state,
                city: form.city,
                status: 'pending',
                createdAt: Date.now(),
            });

            await setDocument(COLLECTIONS.USERS, user.uid, {
                displayName: form.displayName,
                status: 'pending',
            });

            await refreshUser();
            router.replace('/contractor');
        } catch (error) {
            console.error('Error creating profile:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen px-6 py-8 max-w-md mx-auto">
            <div className="text-center mb-8 animate-fade-in">
                <div className="w-16 h-16 rounded-2xl bg-info/10 flex items-center justify-center mx-auto mb-4">
                    <Building2 size={32} className="text-info" />
                </div>
                <h1 className="text-2xl font-black">Contractor Profile</h1>
                <p className="text-secondary text-sm mt-1">Set up your company profile</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 animate-slide-up">
                <div>
                    <label className="input-label">Your Name</label>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Full name"
                        value={form.displayName}
                        onChange={e => setForm(p => ({ ...p, displayName: e.target.value }))}
                        required
                    />
                </div>
                <div>
                    <label className="input-label">Company Name</label>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Company / Business name"
                        value={form.companyName}
                        onChange={e => setForm(p => ({ ...p, companyName: e.target.value }))}
                        required
                    />
                </div>
                <div>
                    <label className="input-label">GST Number (Optional)</label>
                    <input
                        type="text"
                        className="input-field"
                        placeholder="GST Number"
                        value={form.gstNumber}
                        onChange={e => setForm(p => ({ ...p, gstNumber: e.target.value }))}
                    />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="input-label">State</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="State"
                            value={form.state}
                            onChange={e => setForm(p => ({ ...p, state: e.target.value }))}
                            required
                        />
                    </div>
                    <div>
                        <label className="input-label">City</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="City"
                            value={form.city}
                            onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="btn-primary w-full py-4 mt-6"
                    disabled={loading || !form.displayName || !form.companyName}
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : (
                        <>Create Profile <ArrowRight size={18} /></>
                    )}
                </button>

                <p className="text-muted text-xs text-center">
                    Profile will be reviewed by admin
                </p>
            </form>
        </div>
    );
}
