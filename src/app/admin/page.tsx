'use client';

import React, { useState, useEffect } from 'react';
import StatsCard from '@/components/StatsCard';
import { Users, Building2, Briefcase, IndianRupee, UserCheck, TrendingUp, AlertTriangle } from 'lucide-react';
import { queryDocuments, COLLECTIONS } from '@/lib/firestore';
import { where } from 'firebase/firestore';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalLabour: 0,
        totalContractors: 0,
        activeProjects: 0,
        pendingApprovals: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [labour, contractors, projects, pendingLabour, pendingContractors] = await Promise.all([
                    queryDocuments(COLLECTIONS.LABOUR_PROFILES, []),
                    queryDocuments(COLLECTIONS.CONTRACTOR_PROFILES, []),
                    queryDocuments(COLLECTIONS.PROJECTS, [where('status', '==', 'active')]),
                    queryDocuments(COLLECTIONS.LABOUR_PROFILES, [where('status', '==', 'pending')]),
                    queryDocuments(COLLECTIONS.CONTRACTOR_PROFILES, [where('status', '==', 'pending')]),
                ]);
                setStats({
                    totalLabour: labour.length,
                    totalContractors: contractors.length,
                    activeProjects: projects.length,
                    pendingApprovals: pendingLabour.length + pendingContractors.length,
                });
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-black mb-1">Dashboard</h1>
                <p className="text-secondary text-sm">Overview of your labour supply platform</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatsCard
                    icon={<Users size={20} />}
                    label="Total Labour"
                    value={loading ? '...' : stats.totalLabour}
                    color="accent"
                    delay={0}
                />
                <StatsCard
                    icon={<Building2 size={20} />}
                    label="Contractors"
                    value={loading ? '...' : stats.totalContractors}
                    color="info"
                    delay={100}
                />
                <StatsCard
                    icon={<Briefcase size={20} />}
                    label="Active Projects"
                    value={loading ? '...' : stats.activeProjects}
                    color="success"
                    delay={200}
                />
                <StatsCard
                    icon={<UserCheck size={20} />}
                    label="Pending Approvals"
                    value={loading ? '...' : stats.pendingApprovals}
                    subValue={stats.pendingApprovals > 0 ? 'Needs attention' : 'All clear'}
                    color={stats.pendingApprovals > 0 ? 'warning' : 'success'}
                    delay={300}
                />
            </div>

            {/* Alerts */}
            {stats.pendingApprovals > 0 && (
                <div className="glass-card !p-5 mb-8 !border-warning/30 animate-fade-in">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                            <AlertTriangle size={20} className="text-warning" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">Pending Approvals</h3>
                            <p className="text-muted text-xs">
                                {stats.pendingApprovals} profile{stats.pendingApprovals !== 1 ? 's' : ''} waiting for review
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { title: 'Review Approvals', desc: 'Approve or reject pending profiles', icon: <UserCheck size={24} />, color: 'accent', href: '/admin/approvals' },
                    { title: 'Labour Management', desc: 'View and manage all labour', icon: <Users size={24} />, color: 'info', href: '/admin/labour' },
                    { title: 'View Reports', desc: 'Attendance and commission reports', icon: <TrendingUp size={24} />, color: 'success', href: '/admin/reports' },
                ].map((action, i) => (
                    <a
                        key={i}
                        href={action.href}
                        className="glass-card !p-6 block"
                    >
                        <div className={`w-12 h-12 rounded-xl bg-${action.color}/10 flex items-center justify-center mb-4`}>
                            <span className={`text-${action.color}`}>{action.icon}</span>
                        </div>
                        <h3 className="font-bold mb-1">{action.title}</h3>
                        <p className="text-secondary text-sm">{action.desc}</p>
                    </a>
                ))}
            </div>
        </div>
    );
}
