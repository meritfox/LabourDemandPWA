'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import BottomNav from '@/components/BottomNav';
import { Calendar, CheckCircle, XCircle, Clock, Users, Loader2 } from 'lucide-react';
import { Project, AttendanceRecord } from '@/lib/types';
import { getProjectsByContractor, getAttendanceByProject, addDocument, COLLECTIONS } from '@/lib/firestore';

export default function ContractorAttendancePage() {
    const { user } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<string>('');
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        const fetchProjects = async () => {
            if (!user) return;
            try {
                const data = await getProjectsByContractor(user.uid);
                setProjects(data as Project[]);
                if (data.length > 0) {
                    setSelectedProject((data[0] as Project).id);
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, [user]);

    useEffect(() => {
        const fetchAttendance = async () => {
            if (!selectedProject) return;
            try {
                const data = await getAttendanceByProject(selectedProject, today);
                setRecords(data as AttendanceRecord[]);
            } catch (error) {
                console.error('Error:', error);
            }
        };
        fetchAttendance();
    }, [selectedProject, today]);

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">📋 Attendance</h1>
                <div className="flex items-center gap-2 text-sm text-secondary">
                    <Calendar size={14} />
                    {today}
                </div>
            </div>

            {/* Project Selector */}
            {projects.length > 0 && (
                <div className="mb-6">
                    <label className="input-label">Select Project</label>
                    <select
                        className="input-field"
                        value={selectedProject}
                        onChange={e => setSelectedProject(e.target.value)}
                    >
                        {projects.map(p => (
                            <option key={p.id} value={p.id}>{p.siteName}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Today's Attendance */}
            <div className="glass-card !p-5 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-sm">Today&apos;s Summary</h3>
                    <span className="badge badge-info">
                        <Users size={12} />
                        {records.length} marked
                    </span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="text-xl font-bold text-success">
                            {records.filter(r => r.status === 'present').length}
                        </div>
                        <p className="text-xs text-muted">Present</p>
                    </div>
                    <div className="text-center">
                        <div className="text-xl font-bold text-danger">
                            {records.filter(r => r.status === 'absent').length}
                        </div>
                        <p className="text-xs text-muted">Absent</p>
                    </div>
                    <div className="text-center">
                        <div className="text-xl font-bold text-warning">
                            {records.filter(r => r.status === 'half_day').length}
                        </div>
                        <p className="text-xs text-muted">Half Day</p>
                    </div>
                </div>
            </div>

            {/* Attendance List */}
            <div className="space-y-3">
                {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="skeleton h-16 rounded-xl" />
                    ))
                ) : records.length > 0 ? (
                    records.map(record => (
                        <div key={record.id} className="glass-card !p-4 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-sm">{record.labourName}</h3>
                                <span className="text-xs text-accent">₹{record.earnings}</span>
                            </div>
                            <div className="flex gap-2">
                                {record.status === 'present' && (
                                    <span className="badge badge-success"><CheckCircle size={12} /> Present</span>
                                )}
                                {record.status === 'absent' && (
                                    <span className="badge badge-danger"><XCircle size={12} /> Absent</span>
                                )}
                                {record.status === 'half_day' && (
                                    <span className="badge badge-warning"><Clock size={12} /> Half Day</span>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state !py-10">
                        <Calendar size={40} className="mx-auto mb-3 opacity-30" />
                        <p className="text-sm font-semibold">No attendance marked today</p>
                        <p className="text-xs text-muted mt-1">
                            {selectedProject ? 'Assign labour to mark attendance' : 'Select a project first'}
                        </p>
                    </div>
                )}
            </div>

            <BottomNav role="contractor" />
        </div>
    );
}
