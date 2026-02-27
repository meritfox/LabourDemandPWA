'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import BottomNav from '@/components/BottomNav';
import StatsCard from '@/components/StatsCard';
import { Briefcase, Users, IndianRupee, TrendingUp, PlusCircle, ChevronRight, Bell, User } from 'lucide-react';
import { Project, ContractorProfile } from '@/lib/types';
import { getDocument, getProjectsByContractor, COLLECTIONS } from '@/lib/firestore';

export default function ContractorDashboard() {
    const { user, appUser } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<ContractorProfile | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                const [profileData, projectsData] = await Promise.all([
                    getDocument<ContractorProfile>(COLLECTIONS.CONTRACTOR_PROFILES, user.uid),
                    getProjectsByContractor(user.uid),
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

    const activeProjects = projects.filter(p => p.status === 'active');
    const totalLabour = projects.reduce((sum, p) => sum + p.assignedLabourCount, 0);

    return (
        <div className="page-container">
            {/* Header */}
            <div className="page-header">
                <div>
                    <p className="text-secondary text-sm">Welcome back,</p>
                    <h1 className="text-xl font-bold">{profile?.displayName || appUser?.displayName || 'Contractor'}</h1>
                    {profile?.companyName && (
                        <p className="text-accent text-xs font-semibold">{profile.companyName}</p>
                    )}
                </div>
                <div className="flex gap-2">
                    <button className="btn-icon" onClick={() => router.push('/contractor/profile')}>
                        <User size={20} />
                    </button>
                    <button className="btn-icon">
                        <Bell size={20} />
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <StatsCard
                    icon={<Briefcase size={18} />}
                    label="Active Projects"
                    value={activeProjects.length}
                    color="accent"
                    delay={0}
                />
                <StatsCard
                    icon={<Users size={18} />}
                    label="Total Labour"
                    value={totalLabour}
                    color="info"
                    delay={100}
                />
                <StatsCard
                    icon={<IndianRupee size={18} />}
                    label="Monthly Spend"
                    value="₹0"
                    color="warning"
                    delay={200}
                />
                <StatsCard
                    icon={<TrendingUp size={18} />}
                    label="Pending Apps"
                    value={0}
                    subValue="New applicants"
                    color="success"
                    delay={300}
                />
            </div>

            {/* Quick Actions */}
            <button
                onClick={() => router.push('/contractor/projects/new')}
                className="btn-primary w-full py-4 mb-6"
            >
                <PlusCircle size={20} />
                Create New Project
            </button>

            {/* My Projects */}
            <div className="section-header">
                <h2 className="section-title">🏗 My Projects</h2>
            </div>

            <div className="space-y-3 mb-6">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="skeleton skeleton-card" />
                    ))
                ) : projects.length > 0 ? (
                    projects.map(project => (
                        <button
                            key={project.id}
                            onClick={() => router.push(`/contractor/project?id=${project.id}`)}
                            className="glass-card !p-4 w-full text-left"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold text-sm">{project.siteName}</h3>
                                <span className={`badge ${project.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                                    {project.status}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-secondary">
                                <span className="flex items-center gap-1">
                                    <Users size={14} className="text-muted" />
                                    {project.assignedLabourCount}/{project.totalLabourNeeded}
                                </span>
                                <span className="flex items-center gap-1">
                                    <IndianRupee size={14} className="text-muted" />
                                    ₹{project.salary}/day
                                </span>
                            </div>
                            <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted" />
                        </button>
                    ))
                ) : (
                    <div className="empty-state !py-10">
                        <Briefcase size={40} className="mx-auto mb-3 opacity-30" />
                        <p className="text-sm font-semibold">No projects yet</p>
                        <p className="text-xs text-muted mt-1">Create your first project to get started</p>
                    </div>
                )}
            </div>

            <BottomNav role="contractor" />
        </div>
    );
}
