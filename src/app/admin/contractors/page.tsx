'use client';

import React, { useState, useEffect } from 'react';
import StatusBadge from '@/components/StatusBadge';
import { Search, Building2, MapPin } from 'lucide-react';
import { ContractorProfile } from '@/lib/types';
import { queryDocuments, updateDocument, COLLECTIONS } from '@/lib/firestore';

export default function AdminContractorsPage() {
    const [contractors, setContractors] = useState<ContractorProfile[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await queryDocuments<ContractorProfile>(COLLECTIONS.CONTRACTOR_PROFILES, []);
                setContractors(data);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const filtered = contractors.filter(c =>
        c.displayName?.toLowerCase().includes(search.toLowerCase()) ||
        c.companyName?.toLowerCase().includes(search.toLowerCase())
    );

    const handleToggleStatus = async (uid: string, currentStatus: string) => {
        const newStatus = currentStatus === 'suspended' ? 'approved' : 'suspended';
        try {
            await updateDocument(COLLECTIONS.CONTRACTOR_PROFILES, uid, { status: newStatus });
            await updateDocument(COLLECTIONS.USERS, uid, { status: newStatus });
            setContractors(prev => prev.map(c => c.uid === uid ? { ...c, status: newStatus as any } : c));
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-black mb-1">Contractor Management</h1>
                <p className="text-secondary text-sm">{contractors.length} total registered</p>
            </div>

            <div className="relative mb-6 max-w-md">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                    type="text"
                    className="input-field !pl-11"
                    placeholder="Search by name or company..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="skeleton h-40 rounded-xl" />
                    ))
                ) : filtered.length > 0 ? (
                    filtered.map(c => (
                        <div key={c.uid} className="glass-card !p-5">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
                                        <Building2 size={20} className="text-info" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm">{c.displayName}</h3>
                                        <p className="text-accent text-xs font-semibold">{c.companyName}</p>
                                    </div>
                                </div>
                                <StatusBadge status={c.status} />
                            </div>
                            <div className="flex items-center gap-1 text-sm text-secondary mb-4">
                                <MapPin size={14} className="text-muted" />
                                {c.city}, {c.state}
                            </div>
                            <button
                                onClick={() => handleToggleStatus(c.uid, c.status)}
                                className={`w-full text-xs font-semibold py-2 rounded-lg transition-all ${c.status === 'suspended'
                                        ? 'bg-success/10 text-success hover:bg-success/20'
                                        : 'bg-danger/10 text-danger hover:bg-danger/20'
                                    }`}
                            >
                                {c.status === 'suspended' ? 'Activate' : 'Suspend'}
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full empty-state">
                        <Building2 size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No contractors found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
