'use client';

import React, { useState, useEffect } from 'react';
import { QrCode, MapPin, Clock, CheckCircle, XCircle } from 'lucide-react';
import { QRVerificationLog } from '@/lib/types';
import { queryDocuments, COLLECTIONS } from '@/lib/firestore';
import { orderBy, limit } from 'firebase/firestore';

export default function AdminQRLogsPage() {
    const [logs, setLogs] = useState<QRVerificationLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const data = await queryDocuments<QRVerificationLog>(COLLECTIONS.QR_VERIFICATION_LOGS, [
                    orderBy('scanTime', 'desc'),
                    limit(50),
                ]);
                setLogs(data);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-black mb-1">QR Verification Logs</h1>
                <p className="text-secondary text-sm">All QR scan activities</p>
            </div>

            <div className="space-y-3">
                {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="skeleton h-20 rounded-xl" />
                    ))
                ) : logs.length > 0 ? (
                    logs.map(log => (
                        <div key={log.id} className="glass-card !p-4 flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${log.result === 'active' ? 'bg-success/10' : 'bg-danger/10'
                                }`}>
                                {log.result === 'active' ? (
                                    <CheckCircle size={20} className="text-success" />
                                ) : (
                                    <XCircle size={20} className="text-danger" />
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-sm">{log.labourId}</span>
                                    <span className={`badge ${log.result === 'active' ? 'badge-success' : 'badge-danger'
                                        }`}>
                                        {log.result}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted">
                                    <span className="flex items-center gap-1">
                                        <Clock size={10} />
                                        {new Date(log.scanTime).toLocaleString('en-IN')}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <MapPin size={10} />
                                        {log.scannedLocation?.latitude?.toFixed(2)}, {log.scannedLocation?.longitude?.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state">
                        <QrCode size={48} className="mx-auto mb-4 opacity-20" />
                        <p className="font-semibold">No QR scans yet</p>
                        <p className="text-sm text-muted mt-1">Scan logs will appear here</p>
                    </div>
                )}
            </div>
        </div>
    );
}
