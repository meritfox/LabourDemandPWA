'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { setDocument, COLLECTIONS } from '@/lib/firestore';
import { MapPin, Wrench, IndianRupee, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { SkillType } from '@/lib/types';

const SKILL_OPTIONS = [
    'Mason', 'Carpenter', 'Electrician', 'Plumber', 'Painter',
    'Welder', 'Tile Fitter', 'Rod Binder', 'Shuttering', 'Helper',
    'Cleaner', 'Security Guard', 'Driver', 'Cook',
];

export default function LabourRegisterPage() {
    const { user, refreshUser } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);

    const [form, setForm] = useState({
        displayName: '',
        skillType: '' as SkillType | '',
        skills: [] as string[],
        ratePerDay: 0,
        state: '',
        city: '',
    });

    const toggleSkill = (skill: string) => {
        setForm(prev => ({
            ...prev,
            skills: prev.skills.includes(skill)
                ? prev.skills.filter(s => s !== skill)
                : [...prev.skills, skill],
        }));
    };

    const handleSubmit = async () => {
        if (!user) return;
        setLoading(true);

        try {
            const rate = form.skillType === 'skilled' ? 800 : 550;

            await setDocument(COLLECTIONS.LABOUR_PROFILES, user.uid, {
                uid: user.uid,
                userId: user.uid,
                displayName: form.displayName,
                skillType: form.skillType,
                skills: form.skills,
                ratePerDay: form.ratePerDay || rate,
                aadhaarVerified: true,
                location: { latitude: 0, longitude: 0 },
                state: form.state,
                city: form.city,
                reliabilityScore: 100,
                totalProjectsCompleted: 0,
                totalNoShows: 0,
                status: 'pending',
                createdAt: Date.now(),
            });

            await setDocument(COLLECTIONS.USERS, user.uid, {
                displayName: form.displayName,
                status: 'pending',
            });

            await refreshUser();
            router.replace('/labour');
        } catch (error) {
            console.error('Error creating profile:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen px-6 py-8 max-w-md mx-auto">
            {/* Progress */}
            <div className="flex gap-2 mb-8">
                {[1, 2, 3].map(s => (
                    <div
                        key={s}
                        className={`h-1 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-accent' : 'bg-card'
                            }`}
                    />
                ))}
            </div>

            {step === 1 && (
                <div className="animate-fade-in">
                    <h1 className="text-2xl font-black mb-2">Personal Details</h1>
                    <p className="text-secondary text-sm mb-8">Tell us about yourself</p>

                    <div className="space-y-5">
                        <div>
                            <label className="input-label">Full Name</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Enter your full name"
                                value={form.displayName}
                                onChange={e => setForm(p => ({ ...p, displayName: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="input-label">State</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Your state"
                                value={form.state}
                                onChange={e => setForm(p => ({ ...p, state: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="input-label">City / District</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="Your city or district"
                                value={form.city}
                                onChange={e => setForm(p => ({ ...p, city: e.target.value }))}
                            />
                        </div>
                    </div>

                    <button
                        className="btn-primary w-full mt-8 py-4"
                        onClick={() => setStep(2)}
                        disabled={!form.displayName || !form.state || !form.city}
                    >
                        Next <ArrowRight size={18} />
                    </button>
                </div>
            )}

            {step === 2 && (
                <div className="animate-fade-in">
                    <h1 className="text-2xl font-black mb-2">Skill Type</h1>
                    <p className="text-secondary text-sm mb-8">Select your work category</p>

                    <div className="space-y-4 mb-6">
                        {(['skilled', 'unskilled'] as SkillType[]).map(type => (
                            <button
                                key={type}
                                onClick={() => setForm(p => ({ ...p, skillType: type }))}
                                className={`glass-card !p-5 w-full text-left flex items-center gap-4 ${form.skillType === type ? '!border-accent' : ''
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${type === 'skilled' ? 'bg-info/10' : 'bg-warning/10'
                                    }`}>
                                    <Wrench size={22} className={type === 'skilled' ? 'text-info' : 'text-warning'} />
                                </div>
                                <div>
                                    <h3 className="font-bold capitalize">{type}</h3>
                                    <p className="text-secondary text-sm">
                                        {type === 'skilled' ? '₹800/day • Specialized work' : '₹550/day • General work'}
                                    </p>
                                </div>
                                {form.skillType === type && (
                                    <CheckCircle size={20} className="text-accent ml-auto" />
                                )}
                            </button>
                        ))}
                    </div>

                    {form.skillType === 'skilled' && (
                        <div className="animate-fade-in">
                            <label className="input-label mb-3">Select Your Skills</label>
                            <div className="flex flex-wrap gap-2">
                                {SKILL_OPTIONS.map(skill => (
                                    <button
                                        key={skill}
                                        onClick={() => toggleSkill(skill)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${form.skills.includes(skill)
                                                ? 'bg-accent text-[#0a0e1a] font-bold'
                                                : 'bg-card border border-border text-secondary hover:border-accent/30'
                                            }`}
                                    >
                                        {skill}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 mt-8">
                        <button className="btn-secondary flex-1 py-4" onClick={() => setStep(1)}>
                            Back
                        </button>
                        <button
                            className="btn-primary flex-1 py-4"
                            onClick={() => setStep(3)}
                            disabled={!form.skillType}
                        >
                            Next <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="animate-fade-in">
                    <h1 className="text-2xl font-black mb-2">Expected Rate</h1>
                    <p className="text-secondary text-sm mb-8">Set your minimum per day rate</p>

                    <div className="glass-card !p-6 mb-6">
                        <div className="flex items-center gap-3 mb-4">
                            <IndianRupee size={24} className="text-accent" />
                            <span className="text-3xl font-black gradient-text">
                                ₹{form.ratePerDay || (form.skillType === 'skilled' ? 800 : 550)}
                            </span>
                            <span className="text-secondary">/day</span>
                        </div>
                        <input
                            type="range"
                            min={form.skillType === 'skilled' ? 600 : 400}
                            max={form.skillType === 'skilled' ? 2000 : 1200}
                            step={50}
                            value={form.ratePerDay || (form.skillType === 'skilled' ? 800 : 550)}
                            onChange={e => setForm(p => ({ ...p, ratePerDay: parseInt(e.target.value) }))}
                            className="w-full accent-amber-500"
                        />
                        <div className="flex justify-between text-xs text-muted mt-2">
                            <span>₹{form.skillType === 'skilled' ? 600 : 400}</span>
                            <span>₹{form.skillType === 'skilled' ? 2000 : 1200}</span>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="glass-card !p-5 mb-8">
                        <h3 className="font-bold text-sm text-secondary mb-3">PROFILE SUMMARY</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted">Name</span>
                                <span className="font-medium">{form.displayName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted">Location</span>
                                <span className="font-medium">{form.city}, {form.state}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted">Type</span>
                                <span className="font-medium capitalize">{form.skillType}</span>
                            </div>
                            {form.skills.length > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-muted">Skills</span>
                                    <span className="font-medium text-right">{form.skills.join(', ')}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button className="btn-secondary flex-1 py-4" onClick={() => setStep(2)}>
                            Back
                        </button>
                        <button
                            className="btn-primary flex-1 py-4"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                <>Submit</>
                            )}
                        </button>
                    </div>

                    <p className="text-muted text-xs text-center mt-4">
                        Your profile will be reviewed by admin before activation
                    </p>
                </div>
            )}
        </div>
    );
}
