'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult, signInAnonymously } from 'firebase/auth';
import { auth as getAuth } from '@/lib/firebase';
import { getDocument, setDocument, COLLECTIONS } from '@/lib/firestore';
import { HardHat, Phone, KeyRound, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import { AppUser } from '@/lib/types';

declare global {
    interface Window {
        recaptchaVerifier: RecaptchaVerifier;
        confirmationResult: ConfirmationResult;
    }
}

export default function LoginPage() {
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const setupRecaptcha = () => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(getAuth(), 'recaptcha-container', {
                size: 'invisible',
                callback: () => { },
            });
        }
    };

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // BYPASS OTP: We mock the OTP send for demo purposes
            // setupRecaptcha();
            // const phoneNumber = phone.startsWith('+91') ? phone : `+91${phone}`;
            // const confirmation = await signInWithPhoneNumber(getAuth(), phoneNumber, window.recaptchaVerifier);
            // window.confirmationResult = confirmation;

            // Simulating network request
            await new Promise(resolve => setTimeout(resolve, 800));
            setStep('otp');
        } catch (err: any) {
            setError(err.message || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // BYPASS OTP: Use Anonymous Sign-In to get a valid Firebase session
            // const result = await window.confirmationResult.confirm(otp);
            // const user = result.user;

            const result = await signInAnonymously(getAuth());
            const user = result.user;

            // Check if user exists in Firestore
            const existingUser = await getDocument<AppUser>(COLLECTIONS.USERS, user.uid);

            if (existingUser && existingUser.role) {
                // Also ensure phone number is updated if it was an anonymous account
                if (!existingUser.mobile) {
                    await setDocument(COLLECTIONS.USERS, user.uid, { mobile: '+91' + phone });
                }
                router.replace(`/${existingUser.role}`);
            } else {
                // New user — save basic info and go to role selection
                await setDocument(COLLECTIONS.USERS, user.uid, {
                    uid: user.uid,
                    mobile: '+91' + phone, // Use the provided phone instead of pulling from user object
                    status: 'pending',
                    createdAt: Date.now(),
                });
                router.replace('/select-role');
            }
        } catch (err: any) {
            console.error(err);
            setError('Error signing in. Please ensure Anonymous Auth is enabled in Firebase Authentication settings.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-6">
            <div id="recaptcha-container"></div>

            {/* Logo */}
            <div className="text-center mb-10 animate-fade-in">
                <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                    <HardHat size={32} className="text-accent" />
                </div>
                <h1 className="text-2xl font-black tracking-tight">
                    <span className="gradient-text">LabourNet</span>
                </h1>
                <p className="text-secondary text-sm mt-1">Sign in with your mobile number</p>
            </div>

            <div className="w-full max-w-sm animate-slide-up">
                {step === 'phone' ? (
                    <form onSubmit={handleSendOTP} className="space-y-5">
                        <div>
                            <label className="input-label">Mobile Number</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted text-sm font-semibold">+91</span>
                                <input
                                    type="tel"
                                    className="input-field !pl-14"
                                    placeholder="Enter 10-digit number"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    maxLength={10}
                                    required
                                />
                                <Phone size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted" />
                            </div>
                        </div>

                        {error && (
                            <div className="text-danger text-sm bg-danger/10 rounded-lg px-4 py-3 border border-danger/20">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn-primary w-full py-4"
                            disabled={loading || phone.length !== 10}
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                <>
                                    Send OTP
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOTP} className="space-y-5">
                        <button
                            type="button"
                            onClick={() => { setStep('phone'); setOtp(''); setError(''); }}
                            className="flex items-center gap-2 text-secondary text-sm mb-4 hover:text-accent transition-colors"
                        >
                            <ArrowLeft size={16} />
                            Change number
                        </button>

                        <div>
                            <label className="input-label">Enter OTP</label>
                            <p className="text-muted text-xs mb-3">Sent to +91{phone}</p>
                            <div className="relative">
                                <input
                                    type="text"
                                    className="input-field text-center text-lg tracking-[0.5em] font-bold"
                                    placeholder="• • • • • •"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    maxLength={6}
                                    required
                                    autoFocus
                                />
                                <KeyRound size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted" />
                            </div>
                        </div>

                        {error && (
                            <div className="text-danger text-sm bg-danger/10 rounded-lg px-4 py-3 border border-danger/20">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn-primary w-full py-4"
                            disabled={loading || otp.length !== 6}
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                <>
                                    Verify & Login
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>

            <p className="text-muted text-xs mt-8 text-center max-w-xs">
                By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
        </div>
    );
}
