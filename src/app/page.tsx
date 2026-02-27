'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, HardHat, Wrench, Shield, ChevronRight } from 'lucide-react';

export default function HomePage() {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user && role) {
        router.replace(`/${role}`);
      } else if (user && !role) {
        router.replace('/select-role');
      }
    }
  }, [user, role, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
            <HardHat size={32} className="text-accent" />
          </div>
          <Loader2 className="animate-spin text-accent mx-auto" size={24} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      {/* Hero */}
      <div className="text-center mb-12 animate-fade-in">
        <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
          <HardHat size={40} className="text-accent" />
        </div>
        <h1 className="text-4xl font-black tracking-tight mb-3">
          <span className="gradient-text">LabourNet</span>
        </h1>
        <p className="text-secondary text-sm max-w-xs mx-auto leading-relaxed">
          India&apos;s smart labour supply platform. Connect, work, earn — with zero fraud.
        </p>
      </div>

      {/* Features */}
      <div className="w-full max-w-sm space-y-3 mb-10 animate-slide-up" style={{ animationDelay: '200ms' }}>
        {[
          { icon: <Wrench size={18} />, text: 'Find projects near you' },
          { icon: <Shield size={18} />, text: 'Aadhaar verified identity' },
          { icon: <HardHat size={18} />, text: 'Company-controlled travel' },
        ].map((feat, i) => (
          <div key={i} className="glass-card !p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center text-accent flex-shrink-0">
              {feat.icon}
            </div>
            <span className="text-sm font-medium text-secondary">{feat.text}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="w-full max-w-sm animate-slide-up" style={{ animationDelay: '400ms' }}>
        <button
          onClick={() => router.push('/login')}
          className="btn-primary w-full text-base py-4"
        >
          Get Started
          <ChevronRight size={18} />
        </button>
        <p className="text-center text-muted text-xs mt-4">
          Free for all labourers • No hidden charges
        </p>
      </div>
    </div>
  );
}
