'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import BottomNav from '@/components/BottomNav';
import StatusBadge from '@/components/StatusBadge';
import { Calendar, IndianRupee, TrendingUp, Clock } from 'lucide-react';
import { AttendanceRecord } from '@/lib/types';
import { getAttendanceByLabour } from '@/lib/firestore';

export default function LabourHistoryPage() {
    const { user } = useAuth();
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'stats'>('list');

    useEffect(() => {
        const fetchHistory = async () => {
            if (!user) return;
            try {
                const data = await getAttendanceByLabour(user.uid, 60);
                setRecords(data as AttendanceRecord[]);
            } catch (error) {
                console.error('Error fetching history:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [user]);

    const totalEarnings = records.reduce((sum, r) => sum + (r.earnings || 0), 0);
    const presentDays = records.filter(r => r.status === 'present').length;
    const absentDays = records.filter(r => r.status === 'absent').length;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">📊 Work History</h1>
                <div className="flex rounded-xl bg-card border border-border overflow-hidden">
                    <button
                        onClick={() => setView('list')}
                        className={`px-3 py-1.5 text-xs font-semibold transition-all ${view === 'list' ? 'bg-accent text-[#0a0e1a]' : 'text-secondary'
                            }`}
                    >
                        List
                    </button>
                    <button
                        onClick={() => setView('stats')}
                        className={`px-3 py-1.5 text-xs font-semibold transition-all ${view === 'stats' ? 'bg-accent text-[#0a0e1a]' : 'text-secondary'
                            }`}
                    >
                        Stats
                    </button>
                </div>
            </div>

            {view === 'stats' ? (
                <div className="space-y-4 animate-fade-in">
                    <div className="glass-card !p-6">
                        <div className="text-center mb-6">
                            <p className="text-secondary text-sm mb-1">Total Earnings</p>
                            <p className="text-4xl font-black gradient-text">₹{totalEarnings.toLocaleString()}</p>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-success">{presentDays}</p>
                                <p className="text-xs text-muted mt-1">Present</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-danger">{absentDays}</p>
                                <p className="text-xs text-muted mt-1">Absent</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-info">{records.length}</p>
                                <p className="text-xs text-muted mt-1">Total</p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-3 animate-fade-in">
                    {loading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="skeleton h-20 rounded-xl" />
                        ))
                    ) : records.length > 0 ? (
                        records.map(record => (
                            <div key={record.id} className="glass-card !p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} className="text-muted" />
                                        <span className="text-sm font-semibold">{record.date}</span>
                                    </div>
                                    <StatusBadge status={record.status} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-secondary">{record.projectName}</span>
                                    <span className="font-bold text-accent flex items-center gap-1">
                                        <IndianRupee size={14} />
                                        ₹{record.earnings}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">
                            <Clock size={48} className="mx-auto mb-4 opacity-20" />
                            <p className="font-semibold">No attendance records yet</p>
                            <p className="text-sm text-muted mt-1">Your work history will appear here</p>
                        </div>
                    )}
                </div>
            )}

            <BottomNav role="labour" />
        </div>
    );
}
