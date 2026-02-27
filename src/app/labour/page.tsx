'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import BottomNav from '@/components/BottomNav';
import StatsCard from '@/components/StatsCard';
import ProjectCard from '@/components/ProjectCard';
import { IndianRupee, TrendingUp, Star, Briefcase, ChevronRight, Bell, QrCode } from 'lucide-react';
import { Project, LabourProfile } from '@/lib/types';
import { getDocument, getActiveProjects, COLLECTIONS } from '@/lib/firestore';

export default function LabourDashboard() {
    const { user, appUser } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<LabourProfile | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                const [profileData, projectsData] = await Promise.all([
                    getDocument<LabourProfile>(COLLECTIONS.LABOUR_PROFILES, user.uid),
                    getActiveProjects(10),
                ]);
                setProfile(profileData);
                setProjects(projectsData as Project[]);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    return (
        <div className="page-container">
            {/* Header */}
            <div className="page-header">
                <div>
                    <p className="text-secondary text-sm">Welcome back,</p>
                    <h1 className="text-xl font-bold">{profile?.displayName || appUser?.displayName || 'Labour'}</h1>
                </div>
                <div className="flex gap-2">
                    <button className="btn-icon" onClick={() => router.push('/labour/id-card')}>
                        <QrCode size={20} />
                    </button>
                    <button className="btn-icon">
                        <Bell size={20} />
                    </button>
                </div>
            </div>

            {/* Pending Approval Notice */}
            {appUser?.status === 'pending' && (
                <div className="glass-card !p-4 mb-6 border-warning/30 animate-fade-in">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                            <Star size={20} className="text-warning" />
                        </div>
                        <div>
                            <p className="font-bold text-sm">Profile Under Review</p>
                            <p className="text-muted text-xs">Admin will approve your profile shortly</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <StatsCard
                    icon={<IndianRupee size={18} />}
                    label="This Month"
                    value="₹0"
                    subValue="0 days worked"
                    color="accent"
                    delay={0}
                />
                <StatsCard
                    icon={<TrendingUp size={18} />}
                    label="Reliability"
                    value={`${profile?.reliabilityScore || 100}%`}
                    subValue={profile?.reliabilityScore === 100 ? 'Excellent' : 'Good'}
                    color="success"
                    delay={100}
                />
                <StatsCard
                    icon={<Briefcase size={18} />}
                    label="Projects Done"
                    value={profile?.totalProjectsCompleted || 0}
                    color="info"
                    delay={200}
                />
                <StatsCard
                    icon={<Star size={18} />}
                    label="Rate / Day"
                    value={`₹${profile?.ratePerDay || 0}`}
                    subValue={profile?.skillType === 'skilled' ? 'Skilled' : 'Unskilled'}
                    color="warning"
                    delay={300}
                />
            </div>

            {/* Nearby Projects */}
            <div className="section-header">
                <h2 className="section-title">📍 Nearby Projects</h2>
                <button className="section-link flex items-center gap-1" onClick={() => router.push('/labour/projects')}>
                    View All <ChevronRight size={14} />
                </button>
            </div>

            <div className="space-y-3 mb-6">
                {loading ? (
                    Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="skeleton skeleton-card" />
                    ))
                ) : projects.length > 0 ? (
                    projects.slice(0, 3).map(project => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            onClick={(id) => router.push(`/labour/project?id=${id}`)}
                            onApply={(id) => router.push(`/labour/project?id=${id}`)}
                            onSave={() => { }}
                        />
                    ))
                ) : (
                    <div className="empty-state !py-10">
                        <Briefcase size={40} className="mx-auto mb-3 opacity-30" />
                        <p className="text-sm">No projects available yet</p>
                        <p className="text-xs text-muted mt-1">New projects will appear here</p>
                    </div>
                )}
            </div>

            {/* Outstation Projects */}
            <div className="section-header">
                <h2 className="section-title">🌏 Outstation Projects</h2>
                <button className="section-link flex items-center gap-1" onClick={() => router.push('/labour/projects?type=outstation')}>
                    View All <ChevronRight size={14} />
                </button>
            </div>

            <div className="space-y-3 mb-6">
                {loading ? (
                    <div className="skeleton skeleton-card" />
                ) : (
                    projects.filter(p => p.travelProvided).length > 0 ? (
                        projects.filter(p => p.travelProvided).slice(0, 2).map(project => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                onClick={(id) => router.push(`/labour/project?id=${id}`)}
                                onApply={(id) => router.push(`/labour/project?id=${id}`)}
                                onSave={() => { }}
                            />
                        ))
                    ) : (
                        <div className="glass-card !p-6 text-center">
                            <p className="text-secondary text-sm">No outstation projects right now</p>
                        </div>
                    )
                )}
            </div>

            {/* Quick Actions */}
            <div className="section-header">
                <h2 className="section-title">⚡ Quick Actions</h2>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-8">
                {[
                    { label: 'Upload Photo', icon: '📸', href: '/labour/work-photo' },
                    { label: 'My History', icon: '📊', href: '/labour/history' },
                    { label: 'My ID Card', icon: '🪪', href: '/labour/id-card' },
                    { label: 'My Profile', icon: '👤', href: '/labour/profile' },
                ].map(action => (
                    <button
                        key={action.label}
                        onClick={() => router.push(action.href)}
                        className="glass-card !p-4 text-center hover:!border-accent/30"
                    >
                        <span className="text-2xl mb-2 block">{action.icon}</span>
                        <span className="text-xs font-semibold text-secondary">{action.label}</span>
                    </button>
                ))}
            </div>

            <BottomNav role="labour" />
        </div>
    );
}
