'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import BottomNav from '@/components/BottomNav';
import StatsCard from '@/components/StatsCard';
import { IndianRupee, Users, Briefcase, TrendingUp, Calendar } from 'lucide-react';
import { Project } from '@/lib/types';
import { getProjectsByContractor } from '@/lib/firestore';

export default function ContractorReportsPage() {
    const { user } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            if (!user) return;
            try {
                const data = await getProjectsByContractor(user.uid);
                setProjects(data as Project[]);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [user]);

    const activeProjects = projects.filter(p => p.status === 'active');
    const totalLabour = projects.reduce((sum, p) => sum + p.assignedLabourCount, 0);
    const totalDailyCost = projects.reduce((sum, p) => sum + (p.assignedLabourCount * p.salary), 0);

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">📊 Reports</h1>
            </div>

            {/* Overview */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <StatsCard icon={<Briefcase size={18} />} label="Active Projects" value={activeProjects.length} color="accent" />
                <StatsCard icon={<Users size={18} />} label="Total Labour" value={totalLabour} color="info" />
                <StatsCard icon={<IndianRupee size={18} />} label="Daily Cost" value={`₹${totalDailyCost}`} color="warning" />
                <StatsCard icon={<TrendingUp size={18} />} label="Monthly Est." value={`₹${totalDailyCost * 26}`} color="success" />
            </div>

            {/* Project Breakdown */}
            <div className="section-header">
                <h2 className="section-title">Project Breakdown</h2>
            </div>

            <div className="space-y-3">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="skeleton h-24 rounded-xl" />
                    ))
                ) : projects.length > 0 ? (
                    projects.map(project => (
                        <div key={project.id} className="glass-card !p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-bold text-sm">{project.siteName}</h3>
                                <span className={`badge ${project.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                                    {project.status}
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <p className="text-xs text-muted">Labour</p>
                                    <p className="font-bold text-sm">{project.assignedLabourCount}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted">Daily Cost</p>
                                    <p className="font-bold text-sm text-accent">₹{project.assignedLabourCount * project.salary}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted">Rate</p>
                                    <p className="font-bold text-sm">₹{project.salary}</p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state !py-10">
                        <Calendar size={40} className="mx-auto mb-3 opacity-20" />
                        <p className="text-sm">No projects to report</p>
                    </div>
                )}
            </div>

            <BottomNav role="contractor" />
        </div>
    );
}
