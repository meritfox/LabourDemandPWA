'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import BottomNav from '@/components/BottomNav';
import { ArrowLeft, MapPin, Users, IndianRupee, Train, Wrench, ArrowRight, Loader2 } from 'lucide-react';
import { addDocument, COLLECTIONS } from '@/lib/firestore';
import { SkillType } from '@/lib/types';

export default function NewProjectPage() {
    const { user, appUser } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        siteName: '',
        description: '',
        state: '',
        city: '',
        address: '',
        skillRequired: '' as SkillType | '',
        skillsNeeded: [] as string[],
        totalLabourNeeded: 1,
        salary: 0,
        travelProvided: false,
        boardingPoint: '',
        advancePolicy: 'No Cash Advance',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);

        try {
            const salary = form.salary || (form.skillRequired === 'skilled' ? 800 : 550);
            await addDocument(COLLECTIONS.PROJECTS, {
                contractorId: user.uid,
                contractorName: appUser?.displayName || 'Contractor',
                siteName: form.siteName,
                description: form.description,
                location: { latitude: 0, longitude: 0 },
                state: form.state,
                city: form.city,
                address: form.address,
                skillRequired: form.skillRequired,
                skillsNeeded: form.skillsNeeded,
                totalLabourNeeded: form.totalLabourNeeded,
                assignedLabourCount: 0,
                salary,
                travelProvided: form.travelProvided,
                boardingPoint: form.boardingPoint,
                advancePolicy: form.advancePolicy,
                status: 'active',
                startDate: Date.now(),
            });

            router.replace('/contractor');
        } catch (error) {
            console.error('Error creating project:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="flex items-center gap-3 mb-6">
                <button className="btn-icon" onClick={() => router.back()}>
                    <ArrowLeft size={20} />
                </button>
                <h1 className="page-title">Create Project</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
                {/* Site Info */}
                <div className="glass-card !p-5">
                    <h3 className="font-bold text-sm text-secondary mb-4 flex items-center gap-2">
                        <Wrench size={16} className="text-accent" /> PROJECT DETAILS
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="input-label">Site Name</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="e.g., Metro Station Phase 2"
                                value={form.siteName}
                                onChange={e => setForm(p => ({ ...p, siteName: e.target.value }))}
                                required
                            />
                        </div>
                        <div>
                            <label className="input-label">Description</label>
                            <textarea
                                className="input-field !min-h-[80px] resize-none"
                                placeholder="Brief description of the project..."
                                value={form.description}
                                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                            />
                        </div>
                    </div>
                </div>

                {/* Location */}
                <div className="glass-card !p-5">
                    <h3 className="font-bold text-sm text-secondary mb-4 flex items-center gap-2">
                        <MapPin size={16} className="text-info" /> LOCATION
                    </h3>
                    <div className="space-y-4">
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
                        <div>
                            <label className="input-label">Full Address</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Site address"
                                value={form.address}
                                onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                            />
                        </div>
                    </div>
                </div>

                {/* Requirements */}
                <div className="glass-card !p-5">
                    <h3 className="font-bold text-sm text-secondary mb-4 flex items-center gap-2">
                        <Users size={16} className="text-success" /> REQUIREMENTS
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="input-label">Skill Type Required</label>
                            <div className="flex gap-3">
                                {(['skilled', 'unskilled'] as SkillType[]).map(type => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setForm(p => ({ ...p, skillRequired: type, salary: type === 'skilled' ? 800 : 550 }))}
                                        className={`flex-1 py-3 rounded-xl text-sm font-bold capitalize transition-all ${form.skillRequired === type
                                                ? 'bg-accent text-[#0a0e1a]'
                                                : 'bg-card border border-border text-secondary'
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="input-label">Labour Needed</label>
                            <input
                                type="number"
                                className="input-field"
                                placeholder="Number of labourers"
                                min={1}
                                value={form.totalLabourNeeded}
                                onChange={e => setForm(p => ({ ...p, totalLabourNeeded: parseInt(e.target.value) || 1 }))}
                                required
                            />
                        </div>
                        <div>
                            <label className="input-label">Salary Per Day (₹)</label>
                            <div className="relative">
                                <IndianRupee size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                                <input
                                    type="number"
                                    className="input-field !pl-10"
                                    placeholder="e.g., 800"
                                    value={form.salary || ''}
                                    onChange={e => setForm(p => ({ ...p, salary: parseInt(e.target.value) || 0 }))}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Travel */}
                <div className="glass-card !p-5">
                    <h3 className="font-bold text-sm text-secondary mb-4 flex items-center gap-2">
                        <Train size={16} className="text-warning" /> TRAVEL
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-sm">Travel Provided?</p>
                                <p className="text-muted text-xs">Company will arrange travel</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setForm(p => ({ ...p, travelProvided: !p.travelProvided }))}
                                className={`w-12 h-7 rounded-full transition-all relative ${form.travelProvided ? 'bg-accent' : 'bg-card border border-border'
                                    }`}
                            >
                                <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-all ${form.travelProvided ? 'right-1' : 'left-1'
                                    }`} />
                            </button>
                        </div>
                        {form.travelProvided && (
                            <div className="animate-fade-in">
                                <label className="input-label">Boarding Point</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="e.g., Howrah Station"
                                    value={form.boardingPoint}
                                    onChange={e => setForm(p => ({ ...p, boardingPoint: e.target.value }))}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <button
                    type="submit"
                    className="btn-primary w-full py-4"
                    disabled={loading || !form.siteName || !form.skillRequired}
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : (
                        <>Create Project <ArrowRight size={18} /></>
                    )}
                </button>
            </form>

            <BottomNav role="contractor" />
        </div>
    );
}
