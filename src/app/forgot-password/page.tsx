"use client";

import { useState } from "react";
import { AuthService } from "@/services/auth.service";
import { ShieldCheck, Lock, User, ArrowLeft, ShieldAlert, CheckCircle2, KeyRound, Loader2 } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const [step, setStep] = useState(1); // 1: Request OTP, 2: Reset Password, 3: Success
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleRequestOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await AuthService.forgotPassword(email);
            setStep(2);
        } catch (err: any) {
            const detail = err.data?.details || err.message || "Failed to send reset code.";
            setError(detail);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            return setError("Passwords do not match.");
        }
        setLoading(true);
        setError("");
        try {
            await AuthService.resetPassword({ email, otp, newPassword });
            setStep(3);
        } catch (err: any) {
            setError(err.message || "Invalid or expired verification code.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] relative">
            <Link
                href="/login"
                className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-xs uppercase tracking-widest transition-all group"
            >
                <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-slate-900 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                </div>
                Back to Login
            </Link>

            <div className="text-center mb-10 w-full max-w-sm">
                <Link href="/" className="inline-flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
                    <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-600/20">
                        <KeyRound className="w-8 h-8" />
                    </div>
                    <span className="text-2xl font-black text-slate-900 tracking-tight">Digifoncier</span>
                </Link>
                <div className="h-1 w-12 bg-blue-600 mx-auto rounded-full mb-6"></div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    {step === 3 ? "Access Restored" : "Identity Recovery"}
                </h2>
                <p className="text-slate-500 text-sm font-medium">
                    {step === 1 && "Request a secure verification code to reset your access"}
                    {step === 2 && `Enter the verification code sent to ${email}`}
                    {step === 3 && "Your password has been updated. You can now sign in."}
                </p>
            </div>

            <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl shadow-slate-200 border border-slate-200 p-10 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

                {step === 1 && (
                    <form onSubmit={handleRequestOTP} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Official Email</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                <input
                                    required
                                    type="email"
                                    placeholder="name@example.com"
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 font-medium"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-sm font-semibold animate-in fade-in slide-in-from-top-2">
                                <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-slate-900/10 mt-4 group"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Verification Code"}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Verification Code (OTP)</label>
                            <input
                                required
                                type="text"
                                maxLength={6}
                                placeholder="000000"
                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 font-black text-2xl tracking-[1em] text-center"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">New Secure Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                <input
                                    required
                                    type="password"
                                    placeholder="••••••••••••"
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 font-medium"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Confirm New Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                <input
                                    required
                                    type="password"
                                    placeholder="••••••••••••"
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400 font-medium"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-sm font-semibold animate-in fade-in slide-in-from-top-2">
                                <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-blue-900/10 mt-4 group"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Update Password & Sign In"}
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <div className="text-center py-6">
                        <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-emerald-100">
                            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Password Reset Successful</h3>
                        <p className="text-slate-500 text-sm mb-10">You can now access your official portal with your new credentials.</p>
                        <Link
                            href="/login"
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl shadow-slate-900/10 inline-block"
                        >
                            Return to Sign In
                        </Link>
                    </div>
                )}
            </div>

            <footer className="mt-12 text-center">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                    REPUBLIC OF CAMEROON • Secure Identity Management
                </p>
            </footer>
        </div>
    );
}
