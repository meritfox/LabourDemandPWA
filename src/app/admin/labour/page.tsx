'use client';

import React, { useState, useEffect } from 'react';
import StatusBadge from '@/components/StatusBadge';
import { Search, Users, Star, MapPin, Ban, CheckCircle } from 'lucide-react';
import { LabourProfile } from '@/lib/types';
import { queryDocuments, updateDocument, COLLECTIONS } from '@/lib/firestore';

export default function AdminLabourPage() {
    const [labour, setLabour] = useState<LabourProfile[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLabour = async () => {
            try {
                const data = await queryDocuments<LabourProfile>(COLLECTIONS.LABOUR_PROFILES, []);
                setLabour(data);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLabour();
    }, []);

    const filtered = labour.filter(l =>
        l.displayName?.toLowerCase().includes(search.toLowerCase()) ||
        l.labourId?.toLowerCase().includes(search.toLowerCase()) ||
        l.city?.toLowerCase().includes(search.toLowerCase())
    );

    const handleToggleStatus = async (uid: string, currentStatus: string) => {
        const newStatus = currentStatus === 'suspended' ? 'approved' : 'suspended';
        try {
            await updateDocument(COLLECTIONS.LABOUR_PROFILES, uid, { status: newStatus });
            await updateDocument(COLLECTIONS.USERS, uid, { status: newStatus });
            setLabour(prev => prev.map(l => l.uid === uid ? { ...l, status: newStatus as any } : l));
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-black mb-1">Labour Management</h1>
                    <p className="text-secondary text-sm">{labour.length} total registered</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative mb-6 max-w-md">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                    type="text"
                    className="input-field !pl-11"
                    placeholder="Search by name, ID, or city..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border">
                            <th className="text-left py-3 px-4 text-xs font-bold text-muted uppercase tracking-wider">Name</th>
                            <th className="text-left py-3 px-4 text-xs font-bold text-muted uppercase tracking-wider">ID</th>
                            <th className="text-left py-3 px-4 text-xs font-bold text-muted uppercase tracking-wider">Skill</th>
                            <th className="text-left py-3 px-4 text-xs font-bold text-muted uppercase tracking-wider">Location</th>
                            <th className="text-left py-3 px-4 text-xs font-bold text-muted uppercase tracking-wider">Reliability</th>
                            <th className="text-left py-3 px-4 text-xs font-bold text-muted uppercase tracking-wider">Status</th>
                            <th className="text-right py-3 px-4 text-xs font-bold text-muted uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="border-b border-border/50">
                                    <td colSpan={7} className="py-4 px-4"><div className="skeleton h-8 rounded" /></td>
                                </tr>
                            ))
                        ) : filtered.length > 0 ? (
                            filtered.map(l => (
                                <tr key={l.uid} className="border-b border-border/50 hover:bg-card/50 transition-colors">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-sm">
                                                👷
                                            </div>
                                            <span className="font-semibold text-sm">{l.displayName}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-accent font-mono">{l.labourId || '—'}</td>
                                    <td className="py-3 px-4"><StatusBadge status={l.skillType} /></td>
                                    <td className="py-3 px-4 text-sm text-secondary">{l.city}, {l.state}</td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-1">
                                            <Star size={14} className={l.reliabilityScore >= 80 ? 'text-success' : 'text-warning'} />
                                            <span className="text-sm font-semibold">{l.reliabilityScore}%</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4"><StatusBadge status={l.status} /></td>
                                    <td className="py-3 px-4 text-right">
                                        <button
                                            onClick={() => handleToggleStatus(l.uid, l.status)}
                                            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${l.status === 'suspended'
                                                    ? 'bg-success/10 text-success hover:bg-success/20'
                                                    : 'bg-danger/10 text-danger hover:bg-danger/20'
                                                }`}
                                        >
                                            {l.status === 'suspended' ? 'Activate' : 'Suspend'}
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} className="text-center py-12 text-muted">
                                    No labour found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
