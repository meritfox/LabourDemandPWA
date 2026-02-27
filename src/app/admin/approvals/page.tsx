'use client';

import React, { useState, useEffect } from 'react';
import StatusBadge from '@/components/StatusBadge';
import { UserCheck, UserX, Users, Building2, Loader2 } from 'lucide-react';
import { LabourProfile, ContractorProfile } from '@/lib/types';
import { getPendingApprovals, updateDocument, COLLECTIONS } from '@/lib/firestore';

export default function AdminApprovalsPage() {
    const [labourPending, setLabourPending] = useState<LabourProfile[]>([]);
    const [contractorPending, setContractorPending] = useState<ContractorProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'labour' | 'contractor'>('labour');
    const [processing, setProcessing] = useState<string | null>(null);

    useEffect(() => {
        const fetchPending = async () => {
            try {
                const [labour, contractor] = await Promise.all([
                    getPendingApprovals('labour'),
                    getPendingApprovals('contractor'),
                ]);
                setLabourPending(labour as LabourProfile[]);
                setContractorPending(contractor as ContractorProfile[]);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPending();
    }, []);

    const handleApprove = async (id: string, type: 'labour' | 'contractor') => {
        setProcessing(id);
        try {
            const col = type === 'labour' ? COLLECTIONS.LABOUR_PROFILES : COLLECTIONS.CONTRACTOR_PROFILES;
            await updateDocument(col, id, { status: 'approved' });
            // Also update user status
            await updateDocument(COLLECTIONS.USERS, id, { status: 'approved' });

            // Generate Labour ID if labour
            if (type === 'labour') {
                const year = new Date().getFullYear();
                const labourId = `LAB-${year}-${String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0')}`;
                await updateDocument(col, id, { labourId });
            }

            if (type === 'labour') {
                setLabourPending(prev => prev.filter(l => l.uid !== id));
            } else {
                setContractorPending(prev => prev.filter(c => c.uid !== id));
            }
        } catch (error) {
            console.error('Error approving:', error);
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (id: string, type: 'labour' | 'contractor') => {
        setProcessing(id);
        try {
            const col = type === 'labour' ? COLLECTIONS.LABOUR_PROFILES : COLLECTIONS.CONTRACTOR_PROFILES;
            await updateDocument(col, id, { status: 'revoked' });
            await updateDocument(COLLECTIONS.USERS, id, { status: 'revoked' });

            if (type === 'labour') {
                setLabourPending(prev => prev.filter(l => l.uid !== id));
            } else {
                setContractorPending(prev => prev.filter(c => c.uid !== id));
            }
        } catch (error) {
            console.error('Error rejecting:', error);
        } finally {
            setProcessing(null);
        }
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-black mb-1">Pending Approvals</h1>
                <p className="text-secondary text-sm">Review and approve new registrations</p>
            </div>

            {/* Tabs */}
            <div className="flex rounded-xl bg-card border border-border overflow-hidden mb-6 max-w-md">
                <button
                    onClick={() => setTab('labour')}
                    className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all ${tab === 'labour' ? 'bg-accent text-[#0a0e1a]' : 'text-secondary'
                        }`}
                >
                    <Users size={16} />
                    Labour ({labourPending.length})
                </button>
                <button
                    onClick={() => setTab('contractor')}
                    className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all ${tab === 'contractor' ? 'bg-accent text-[#0a0e1a]' : 'text-secondary'
                        }`}
                >
                    <Building2 size={16} />
                    Contractor ({contractorPending.length})
                </button>
            </div>

            {/* Labour List */}
            {tab === 'labour' && (
                <div className="space-y-3 animate-fade-in">
                    {loading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="skeleton h-32 rounded-xl" />
                        ))
                    ) : labourPending.length > 0 ? (
                        labourPending.map(labour => (
                            <div key={labour.uid} className="glass-card !p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="font-bold">{labour.displayName}</h3>
                                        <p className="text-secondary text-sm">{labour.city}, {labour.state}</p>
                                    </div>
                                    <StatusBadge status="pending" />
                                </div>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    <span className={`badge ${labour.skillType === 'skilled' ? 'badge-info' : 'badge-warning'}`}>
                                        {labour.skillType}
                                    </span>
                                    <span className="badge badge-success">₹{labour.ratePerDay}/day</span>
                                    {labour.aadhaarVerified && <span className="badge badge-success">Aadhaar ✔</span>}
                                </div>
                                {labour.skills && labour.skills.length > 0 && (
                                    <p className="text-xs text-muted mb-3">Skills: {labour.skills.join(', ')}</p>
                                )}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleApprove(labour.uid, 'labour')}
                                        disabled={processing === labour.uid}
                                        className="btn-primary flex-1 !py-2.5"
                                    >
                                        {processing === labour.uid ? <Loader2 className="animate-spin" size={16} /> : (
                                            <><UserCheck size={16} /> Approve</>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleReject(labour.uid, 'labour')}
                                        disabled={processing === labour.uid}
                                        className="btn-secondary flex-1 !py-2.5 !text-danger !border-danger/30"
                                    >
                                        <UserX size={16} /> Reject
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">
                            <UserCheck size={48} className="mx-auto mb-4 opacity-20" />
                            <p className="font-semibold">No pending labour approvals</p>
                        </div>
                    )}
                </div>
            )}

            {/* Contractor List */}
            {tab === 'contractor' && (
                <div className="space-y-3 animate-fade-in">
                    {loading ? (
                        Array.from({ length: 2 }).map((_, i) => (
                            <div key={i} className="skeleton h-32 rounded-xl" />
                        ))
                    ) : contractorPending.length > 0 ? (
                        contractorPending.map(contractor => (
                            <div key={contractor.uid} className="glass-card !p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="font-bold">{contractor.displayName}</h3>
                                        <p className="text-accent text-sm font-semibold">{contractor.companyName}</p>
                                        <p className="text-secondary text-sm">{contractor.city}, {contractor.state}</p>
                                    </div>
                                    <StatusBadge status="pending" />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleApprove(contractor.uid, 'contractor')}
                                        disabled={processing === contractor.uid}
                                        className="btn-primary flex-1 !py-2.5"
                                    >
                                        {processing === contractor.uid ? <Loader2 className="animate-spin" size={16} /> : (
                                            <><UserCheck size={16} /> Approve</>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleReject(contractor.uid, 'contractor')}
                                        disabled={processing === contractor.uid}
                                        className="btn-secondary flex-1 !py-2.5 !text-danger !border-danger/30"
                                    >
                                        <UserX size={16} /> Reject
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">
                            <UserCheck size={48} className="mx-auto mb-4 opacity-20" />
                            <p className="font-semibold">No pending contractor approvals</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
