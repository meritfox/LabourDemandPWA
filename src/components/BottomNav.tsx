'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Briefcase, Camera, History, User, PlusCircle, Users, ClipboardList, BarChart3 } from 'lucide-react';
import { UserRole } from '@/lib/types';

interface NavItem {
    href: string;
    label: string;
    icon: React.ReactNode;
}

const labourNav: NavItem[] = [
    { href: '/labour', label: 'Home', icon: <Home size={20} /> },
    { href: '/labour/projects', label: 'Projects', icon: <Briefcase size={20} /> },
    { href: '/labour/work-photo', label: 'Photo', icon: <Camera size={20} /> },
    { href: '/labour/history', label: 'History', icon: <History size={20} /> },
    { href: '/labour/profile', label: 'Profile', icon: <User size={20} /> },
];

const contractorNav: NavItem[] = [
    { href: '/contractor', label: 'Home', icon: <Home size={20} /> },
    { href: '/contractor/projects/new', label: 'New Site', icon: <PlusCircle size={20} /> },
    { href: '/contractor/attendance', label: 'Attendance', icon: <ClipboardList size={20} /> },
    { href: '/contractor/reports', label: 'Reports', icon: <BarChart3 size={20} /> },
    { href: '/contractor/profile', label: 'Profile', icon: <User size={20} /> },
];

export default function BottomNav({ role }: { role: UserRole }) {
    const pathname = usePathname();
    const navItems = role === 'labour' ? labourNav : contractorNav;

    return (
        <nav className="bottom-nav">
            <div className="flex justify-around items-center max-w-[480px] mx-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== `/${role}` && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
