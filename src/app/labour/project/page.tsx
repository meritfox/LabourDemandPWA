'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import StatusBadge from '@/components/StatusBadge';
import { MapPin, IndianRupee, Train, Users, Calendar, ArrowLeft, Heart, Send, Wrench, Building2, Shield } from 'lucide-react';
import { Project, LabourProfile } from '@/lib/types';
import { getDocument, addDocument, COLLECTIONS } from '@/lib/firestore';
import { Suspense } from 'react';

function ProjectDetailContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id') || '';
    const { user } = useAuth();
    const router = useRouter();
    const [project, setProject] = useState<Project | null>(null);
    const [profile, setProfile] = useState<LabourProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [applied, setApplied] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (!id) return;
        const fetchData = async () => {
            try {
                const [projectData, profileData] = await Promise.all([
                    getDocument<Project>(COLLECTIONS.PROJECTS, id),
                    user ? getDocument<LabourProfile>(COLLECTIONS.LABOUR_PROFILES, user.uid) : null,
                ]);
                setProject(projectData);
                setProfile(profileData);
            } catch (error) {
                console.error('Error fetching project:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, user]);

    const handleApply = async () => {
        if (!user || !project || !profile) return;
        setApplying(true);

        try {
            await addDocument(COLLECTIONS.PROJECT_APPLICATIONS, {
                projectId: project.id,
                labourId: user.uid,
                labourName: profile.displayName,
                labourSkillType: profile.skillType,
                reliabilityScore: profile.reliabilityScore,
                status: 'applied',
                appliedAt: Date.now(),
            });
            setApplied(true);
        } catch (error) {
            console.error('Error applying:', error);
        } finally {
            setApplying(false);
        }
    };

    if (loading) {
        return (
            <div className="page-container">
                <div className="skeleton h-8 w-40 mb-4" />
                <div className="skeleton skeleton-card mb-4" />
                <div className="skeleton skeleton-card" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="page-container">
                <div className="empty-state">
                    <p className="font-semibold">Project not found</p>
                    <button className="btn-primary mt-4" onClick={() => router.back()}>Go Back</button>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container !pb-32">
            <div className="flex items-center gap-3 mb-6">
                <button className="btn-icon" onClick={() => router.back()}>
                    <ArrowLeft size={20} />
                </button>
                <h1 className="page-title flex-1 truncate">{project.siteName}</h1>
                <button
                    className={`btn-icon ${saved ? '!text-danger !border-danger/30' : ''}`}
                    onClick={() => setSaved(!saved)}
                >
                    <Heart size={20} fill={saved ? '#ef4444' : 'none'} />
                </button>
            </div>

            <div className="mb-6">
                <StatusBadge status={project.status} size="md" />
            </div>

            <div className="space-y-4">
                <div className="glass-card !p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <MapPin size={18} className="text-accent" />
                        <h3 className="font-bold text-sm text-secondary">LOCATION</h3>
                    </div>
                    <p className="font-semibold">{project.address || `${project.city}, ${project.state}`}</p>
                    <p className="text-secondary text-sm mt-1">{project.city}, {project.state}</p>
                </div>

                <div className="glass-card !p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <Building2 size={18} className="text-info" />
                        <h3 className="font-bold text-sm text-secondary">CONTRACTOR</h3>
                    </div>
                    <p className="font-semibold">{project.contractorName}</p>
                </div>

                <div className="glass-card !p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <Wrench size={18} className="text-warning" />
                        <h3 className="font-bold text-sm text-secondary">JOB DETAILS</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-muted">Skill Required</span>
                            <StatusBadge status={project.skillRequired} />
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted">Labour Needed</span>
                            <span className="font-semibold">{project.assignedLabourCount}/{project.totalLabourNeeded}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted">Salary</span>
                            <span className="font-bold text-accent">₹{project.salary}/day</span>
                        </div>
                    </div>
                </div>

                {project.travelProvided && (
                    <div className="glass-card !p-5 !border-info/20">
                        <div className="flex items-center gap-3 mb-3">
                            <Train size={18} className="text-info" />
                            <h3 className="font-bold text-sm text-secondary">TRAVEL INFO</h3>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Shield size={14} className="text-success" />
                                <span className="text-sm font-medium text-success">Travel provided by company</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-danger font-medium">❌ No cash advance</span>
                            </div>
                            {project.boardingPoint && (
                                <div className="flex justify-between text-sm mt-2">
                                    <span className="text-muted">Boarding Point</span>
                                    <span className="font-semibold">{project.boardingPoint}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {project.description && (
                    <div className="glass-card !p-5">
                        <h3 className="font-bold text-sm text-secondary mb-3">DESCRIPTION</h3>
                        <p className="text-secondary text-sm leading-relaxed">{project.description}</p>
                    </div>
                )}
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-[#111827]/95 backdrop-blur-xl border-t border-border p-4">
                <div className="max-w-[480px] mx-auto flex items-center gap-4">
                    <div className="flex-1">
                        <span className="text-2xl font-black gradient-text">₹{project.salary}</span>
                        <span className="text-muted text-sm">/day</span>
                    </div>
                    {applied ? (
                        <button className="btn-primary !bg-success/20 !text-success cursor-default" disabled>
                            ✔ Applied Successfully
                        </button>
                    ) : (
                        <button className="btn-primary" onClick={handleApply} disabled={applying}>
                            {applying ? 'Applying...' : (<>Apply Now <Send size={16} /></>)}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ProjectDetailPage() {
    return (
        <Suspense fallback={<div className="page-container"><div className="skeleton h-8 w-40 mb-4" /><div className="skeleton skeleton-card" /></div>}>
            <ProjectDetailContent />
        </Suspense>
    );
}
