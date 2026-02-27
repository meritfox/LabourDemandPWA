'use client';

import React from 'react';
import StatsCard from '@/components/StatsCard';
import { IndianRupee, TrendingUp, Users, Calendar } from 'lucide-react';

export default function AdminReportsPage() {
    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-black mb-1">Reports & Analytics</h1>
                <p className="text-secondary text-sm">Attendance, commission, and financial reports</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatsCard icon={<IndianRupee size={20} />} label="Monthly Revenue" value="₹0" subValue="Commission earned" color="accent" />
                <StatsCard icon={<TrendingUp size={20} />} label="Project Commission" value="₹5,000" subValue="Per project" color="info" />
                <StatsCard icon={<Users size={20} />} label="Labour Commission" value="₹1,000" subValue="Per labour/month" color="success" />
                <StatsCard icon={<Calendar size={20} />} label="Attendance Rate" value="0%" subValue="This month" color="warning" />
            </div>

            {/* Commission Rates */}
            <div className="glass-card !p-6 mb-8">
                <h2 className="font-bold mb-4">💰 Commission Rates</h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left py-2 px-4 text-xs font-bold text-muted uppercase">Type</th>
                                <th className="text-left py-2 px-4 text-xs font-bold text-muted uppercase">Rate</th>
                                <th className="text-left py-2 px-4 text-xs font-bold text-muted uppercase">Frequency</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-border/50">
                                <td className="py-3 px-4 text-sm font-semibold">Project Commission</td>
                                <td className="py-3 px-4 text-sm text-accent font-bold">₹5,000</td>
                                <td className="py-3 px-4 text-sm text-secondary">Per project</td>
                            </tr>
                            <tr className="border-b border-border/50">
                                <td className="py-3 px-4 text-sm font-semibold">Labour Commission</td>
                                <td className="py-3 px-4 text-sm text-accent font-bold">₹1,000</td>
                                <td className="py-3 px-4 text-sm text-secondary">Monthly per labour</td>
                            </tr>
                            <tr className="border-b border-border/50">
                                <td className="py-3 px-4 text-sm font-semibold">Skilled Rate</td>
                                <td className="py-3 px-4 text-sm text-accent font-bold">₹800</td>
                                <td className="py-3 px-4 text-sm text-secondary">Per day</td>
                            </tr>
                            <tr>
                                <td className="py-3 px-4 text-sm font-semibold">Unskilled Rate</td>
                                <td className="py-3 px-4 text-sm text-accent font-bold">₹550</td>
                                <td className="py-3 px-4 text-sm text-secondary">Per day</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Per Day Calculation */}
            <div className="glass-card !p-6">
                <h2 className="font-bold mb-4">📊 Per Day Calculation Engine</h2>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-border/50">
                        <span className="text-secondary">When attendance marked as Present</span>
                        <span className="font-bold">Auto-calculate</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border/50">
                        <span className="text-secondary">Skilled Labour Earning</span>
                        <span className="font-bold text-accent">₹800</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border/50">
                        <span className="text-secondary">Unskilled Labour Earning</span>
                        <span className="font-bold text-accent">₹550</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border/50">
                        <span className="text-secondary">Contractor Daily Bill</span>
                        <span className="font-bold">Sum of all labour rates</span>
                    </div>
                    <div className="flex justify-between py-2">
                        <span className="text-secondary">Commission Record</span>
                        <span className="font-bold">Auto-generated</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
