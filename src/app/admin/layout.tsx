'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, UserCheck, Users, Building2, BarChart3, QrCode, LogOut, HardHat, Menu, X } from 'lucide-react';

const sidebarLinks = [
    { href: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { href: '/admin/approvals', label: 'Approvals', icon: <UserCheck size={18} /> },
    { href: '/admin/labour', label: 'Labour', icon: <Users size={18} /> },
    { href: '/admin/contractors', label: 'Contractors', icon: <Building2 size={18} /> },
    { href: '/admin/reports', label: 'Reports', icon: <BarChart3 size={18} /> },
    { href: '/admin/qr-logs', label: 'QR Logs', icon: <QrCode size={18} /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        router.replace('/');
    };

    return (
        <div className="admin-layout">
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#111827]/95 backdrop-blur-xl border-b border-border px-4 py-3">
                <div className="flex items-center justify-between">
                    <button onClick={() => setMobileOpen(!mobileOpen)} className="btn-icon !w-10 !h-10">
                        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                    <h1 className="font-bold gradient-text">LabourNet Admin</h1>
                    <div className="w-10" />
                </div>
            </div>

            {/* Sidebar */}
            <aside className={`admin-sidebar ${mobileOpen ? '!fixed !z-40 !w-full md:!w-[260px]' : 'hidden md:block'}`}>
                <div className="px-6 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                            <HardHat size={20} className="text-accent" />
                        </div>
                        <div>
                            <h2 className="font-bold text-sm">LabourNet</h2>
                            <p className="text-[10px] text-muted uppercase tracking-wider">Admin Panel</p>
                        </div>
                    </div>
                </div>

                <nav className="space-y-1 px-3">
                    {sidebarLinks.map(link => {
                        const isActive = pathname === link.href;
                        return (
                            <button
                                key={link.href}
                                onClick={() => { router.push(link.href); setMobileOpen(false); }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                                        ? 'bg-accent/10 text-accent border border-accent/20'
                                        : 'text-secondary hover:text-foreground hover:bg-card'
                                    }`}
                            >
                                {link.icon}
                                {link.label}
                            </button>
                        );
                    })}
                </nav>

                <div className="mt-auto px-3 pt-8">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-danger hover:bg-danger/10 transition-all"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Content */}
            <main className="admin-content pt-16 md:pt-0">
                {children}
            </main>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}
        </div>
    );
}
