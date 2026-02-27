'use client';

import React from 'react';
import { MapPin, Wrench, IndianRupee, Heart, Train, Users } from 'lucide-react';
import { Project } from '@/lib/types';

interface ProjectCardProps {
    project: Project;
    onSave?: (id: string) => void;
    onApply?: (id: string) => void;
    onClick?: (id: string) => void;
    isSaved?: boolean;
    showApply?: boolean;
}

export default function ProjectCard({ project, onSave, onApply, onClick, isSaved, showApply = true }: ProjectCardProps) {
    return (
        <div
            className="project-card animate-fade-in"
            onClick={() => onClick?.(project.id)}
        >
            {onSave && (
                <button
                    className={`save-btn ${isSaved ? 'saved' : ''}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        onSave(project.id);
                    }}
                >
                    <Heart size={20} fill={isSaved ? '#ef4444' : 'none'} />
                </button>
            )}

            <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Wrench size={18} className="text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[0.95rem] text-foreground truncate pr-8">
                        {project.siteName}
                    </h3>
                    <p className="text-secondary text-sm mt-0.5">{project.contractorName}</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-3 text-sm">
                <div className="flex items-center gap-1.5 text-secondary">
                    <MapPin size={14} className="text-muted" />
                    <span>{project.city}, {project.state}</span>
                </div>
                <div className="flex items-center gap-1.5 text-secondary">
                    <Users size={14} className="text-muted" />
                    <span>{project.assignedLabourCount}/{project.totalLabourNeeded}</span>
                </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        <IndianRupee size={14} className="text-accent" />
                        <span className="font-bold text-accent">₹{project.salary}/day</span>
                    </div>
                    {project.travelProvided && (
                        <div className="flex items-center gap-1">
                            <Train size={14} className="text-info" />
                            <span className="text-xs text-info font-semibold">Travel Provided</span>
                        </div>
                    )}
                </div>

                {showApply && (
                    <button
                        className="btn-primary !py-2 !px-4 !text-xs"
                        onClick={(e) => {
                            e.stopPropagation();
                            onApply?.(project.id);
                        }}
                    >
                        Apply
                    </button>
                )}
            </div>

            <div className="flex gap-2 mt-3">
                <span className={`badge ${project.skillRequired === 'skilled' ? 'badge-info' : 'badge-warning'}`}>
                    {project.skillRequired}
                </span>
                <span className="badge badge-success">{project.status}</span>
            </div>
        </div>
    );
}
