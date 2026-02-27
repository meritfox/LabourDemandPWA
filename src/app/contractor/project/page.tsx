'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import StatusBadge from '@/components/StatusBadge';
import BottomNav from '@/components/BottomNav';
import { ArrowLeft, Users, UserCheck, UserX, Star } from 'lucide-react';
import { Project, ProjectApplication } from '@/lib/types';
import { getDocument, getApplicationsByProject, updateDocument, COLLECTIONS } from '@/lib/firestore';
import { Suspense } from 'react';

function ContractorProjectContent() {
    const searchParams = useSearchParams();
    const id = searchParams.get('id') || '';
    const router = useRouter();
    const [project, setProject] = useState<Project | null>(null);
    const [applications, setApplications] = useState<ProjectApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'details' | 'applicants'>('details');

    useEffect(() => {
        if (!id) return;
        const fetchData = async () => {
            try {
                const [projectData, appsData] = await Promise.all([
                    getDocument<Project>(COLLECTIONS.PROJECTS, id),
                    getApplicationsByProject(id),
                ]);
                setProject(projectData);
                setApplications(appsData as ProjectApplication[]);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleShortlist = async (appId: string) => {
        try {
            await updateDocument(COLLECTIONS.PROJECT_APPLICATIONS, appId, { status: 'shortlisted' });
            setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'shortlisted' } : a));
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleReject = async (appId: string) => {
        try {
            await updateDocument(COLLECTIONS.PROJECT_APPLICATIONS, appId, { status: 'rejected' });
            setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'rejected' } : a));
        } catch (error) {
            console.error('Error:', error);
        }
    };

    if (loading) {
        return (
            <div className="page-container">
                <div className="skeleton h-8 w-40 mb-4" />
                <div className="skeleton skeleton-card" />
                <BottomNav role="contractor" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="page-container">
                <div className="empty-state">
                    <p>Project not found</p>
                    <button className="btn-primary mt-4" onClick={() => router.back()}>Go Back</button>
                </div>
                <BottomNav role="contractor" />
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="flex items-center gap-3 mb-6">
                <button className="btn-icon" onClick={() => router.back()}>
                    <ArrowLeft size={20} />
                </button>
                <div className="flex-1 min-w-0">
                    <h1 className="page-title truncate">{project.siteName}</h1>
                    <StatusBadge status={project.status} />
                </div>
            </div>

            <div className="flex rounded-xl bg-card border border-border overflow-hidden mb-6">
                {(['details', 'applicants'] as const).map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`flex-1 py-3 text-sm font-semibold capitalize transition-all ${tab === t ? 'bg-accent text-[#0a0e1a]' : 'text-secondary'
                            }`}
                    >
                        {t === 'applicants' ? `Applicants (${applications.length})` : t}
                    </button>
                ))}
            </div>

            {tab === 'details' ? (
                <div className="space-y-4 animate-fade-in">
                    <div className="glass-card !p-5">
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-muted text-sm">Location</span>
                                <span className="font-semibold text-sm">{project.city}, {project.state}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted text-sm">Skill Required</span>
                                <StatusBadge status={project.skillRequired} />
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted text-sm">Labour</span>
                                <span className="font-semibold text-sm">{project.assignedLabourCount}/{project.totalLabourNeeded}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted text-sm">Salary</span>
                                <span className="font-bold text-accent">₹{project.salary}/day</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted text-sm">Travel</span>
                                <span className="font-semibold text-sm">
                                    {project.travelProvided ? `✔ ${project.boardingPoint || 'Yes'}` : '❌ No'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {project.description && (
                        <div className="glass-card !p-5">
                            <h3 className="font-bold text-sm text-secondary mb-2">Description</h3>
                            <p className="text-sm text-secondary leading-relaxed">{project.description}</p>
                        </div>
                    )}

                    <button
                        onClick={() => router.push(`/contractor/attendance?project=${project.id}`)}
                        className="btn-primary w-full py-4"
                    >
                        Mark Attendance
                    </button>
                </div>
            ) : (
                <div className="space-y-3 animate-fade-in">
                    {applications.length > 0 ? (
                        applications.map(app => (
                            <div key={app.id} className="glass-card !p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <h3 className="font-bold text-sm">{app.labourName}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <StatusBadge status={app.labourSkillType} />
                                            <span className="flex items-center gap-1 text-xs text-success">
                                                <Star size={12} /> {app.reliabilityScore}%
                                            </span>
                                        </div>
                                    </div>
                                    <StatusBadge status={app.status} />
                                </div>
                                {app.status === 'applied' && (
                                    <div className="flex gap-2 mt-3">
                                        <button onClick={() => handleShortlist(app.id)} className="btn-primary flex-1 !py-2 !text-xs">
                                            <UserCheck size={14} /> Shortlist
                                        </button>
                                        <button onClick={() => handleReject(app.id)} className="btn-secondary flex-1 !py-2 !text-xs !text-danger !border-danger/30">
                                            <UserX size={14} /> Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="empty-state !py-10">
                            <Users size={40} className="mx-auto mb-3 opacity-30" />
                            <p className="text-sm font-semibold">No applicants yet</p>
                            <p className="text-xs text-muted mt-1">Labour will apply once they find your project</p>
                        </div>
                    )}
                </div>
            )}

            <BottomNav role="contractor" />
        </div>
    );
}

export default function ContractorProjectDetailPage() {
    return (
        <Suspense fallback={<div className="page-container"><div className="skeleton h-8 w-40 mb-4" /><div className="skeleton skeleton-card" /></div>}>
            <ContractorProjectContent />
        </Suspense>
    );
}
