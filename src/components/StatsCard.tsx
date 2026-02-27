'use client';

import React, { ReactNode } from 'react';

interface StatsCardProps {
    icon: ReactNode;
    label: string;
    value: string | number;
    subValue?: string;
    color?: 'accent' | 'success' | 'danger' | 'info' | 'warning';
    delay?: number;
}

const colorMap = {
    accent: { bg: 'bg-accent/10', text: 'text-accent', border: 'border-accent/20' },
    success: { bg: 'bg-success/10', text: 'text-success', border: 'border-success/20' },
    danger: { bg: 'bg-danger/10', text: 'text-danger', border: 'border-danger/20' },
    info: { bg: 'bg-info/10', text: 'text-info', border: 'border-info/20' },
    warning: { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/20' },
};

export default function StatsCard({ icon, label, value, subValue, color = 'accent', delay = 0 }: StatsCardProps) {
    const c = colorMap[color];

    return (
        <div
            className="stat-card animate-fade-in"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}>
                    <span className={c.text}>{icon}</span>
                </div>
            </div>
            <div className="text-2xl font-bold tracking-tight">
                {value}
            </div>
            <div className="text-sm text-secondary mt-1">{label}</div>
            {subValue && (
                <div className={`text-xs ${c.text} font-semibold mt-2`}>{subValue}</div>
            )}
        </div>
    );
}
