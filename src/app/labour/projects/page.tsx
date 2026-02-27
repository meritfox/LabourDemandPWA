'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import BottomNav from '@/components/BottomNav';
import ProjectCard from '@/components/ProjectCard';
import { Search, Filter, MapPin, Globe } from 'lucide-react';
import { Project } from '@/lib/types';
import { getActiveProjects } from '@/lib/firestore';

export default function LabourProjectsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'nearby' | 'outstation' | 'saved'>('all');

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await getActiveProjects(50);
                setProjects(data as Project[]);
            } catch (error) {
                console.error('Error fetching projects:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    const filteredProjects = projects.filter(p => {
        const matchesSearch = p.siteName.toLowerCase().includes(search.toLowerCase()) ||
            p.city.toLowerCase().includes(search.toLowerCase()) ||
            p.state.toLowerCase().includes(search.toLowerCase());

        if (filter === 'outstation') return matchesSearch && p.travelProvided;
        return matchesSearch;
    });

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Projects</h1>
            </div>

            {/* Search */}
            <div className="relative mb-4">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                    type="text"
                    className="input-field !pl-11"
                    placeholder="Search by name, city, or state..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {[
                    { key: 'all', label: 'All', icon: <Filter size={14} /> },
                    { key: 'nearby', label: 'Nearby', icon: <MapPin size={14} /> },
                    { key: 'outstation', label: 'Outstation', icon: <Globe size={14} /> },
                ].map(f => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key as any)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filter === f.key
                            ? 'bg-accent text-[#0a0e1a] font-bold'
                            : 'bg-card border border-border text-secondary'
                            }`}
                    >
                        {f.icon}
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Results */}
            <p className="text-muted text-sm mb-4">{filteredProjects.length} projects found</p>

            <div className="space-y-3">
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="skeleton skeleton-card" />
                    ))
                ) : filteredProjects.length > 0 ? (
                    filteredProjects.map(project => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            onClick={(id) => router.push(`/labour/project?id=${id}`)}
                            onApply={(id) => router.push(`/labour/project?id=${id}`)}
                            onSave={() => { }}
                        />
                    ))
                ) : (
                    <div className="empty-state">
                        <Search size={48} className="mx-auto mb-4 opacity-20" />
                        <p className="font-semibold">No projects found</p>
                        <p className="text-sm text-muted mt-1">Try adjusting your search or filters</p>
                    </div>
                )}
            </div>

            <BottomNav role="labour" />
        </div>
    );
}
