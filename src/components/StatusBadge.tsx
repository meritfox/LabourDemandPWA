'use client';

import React from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle, Ban } from 'lucide-react';

type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'pending' | 'default';

interface StatusBadgeProps {
    status: string;
    variant?: BadgeVariant;
    size?: 'sm' | 'md';
}

const variantConfig: Record<BadgeVariant, { className: string; icon: React.ReactNode }> = {
    success: { className: 'badge-success', icon: <CheckCircle size={12} /> },
    danger: { className: 'badge-danger', icon: <XCircle size={12} /> },
    warning: { className: 'badge-warning', icon: <AlertTriangle size={12} /> },
    info: { className: 'badge-info', icon: <Clock size={12} /> },
    pending: { className: 'badge-warning', icon: <Clock size={12} /> },
    default: { className: 'badge-info', icon: null },
};

const statusToVariant: Record<string, BadgeVariant> = {
    active: 'success',
    approved: 'success',
    completed: 'success',
    present: 'success',
    pending: 'pending',
    applied: 'info',
    shortlisted: 'info',
    booked: 'info',
    travel_started: 'info',
    video_verified: 'info',
    offer_sent: 'info',
    ticket_issued: 'info',
    boarding_confirmed: 'info',
    accepted: 'success',
    suspended: 'warning',
    revoked: 'danger',
    rejected: 'danger',
    no_show: 'danger',
    cancelled: 'danger',
    absent: 'danger',
    half_day: 'warning',
    draft: 'default',
};

export default function StatusBadge({ status, variant, size = 'sm' }: StatusBadgeProps) {
    const v = variant || statusToVariant[status] || 'default';
    const config = variantConfig[v];

    return (
        <span className={`badge ${config.className} ${size === 'md' ? '!text-sm !px-4 !py-1.5' : ''}`}>
            {config.icon}
            {status.replace(/_/g, ' ')}
        </span>
    );
}
