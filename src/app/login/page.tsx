"use client";

import { useState } from "react";
import { AuthService } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, User, ArrowRight, Building2, ShieldAlert, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
    const [step, setStep] = useState("login"); // "login" | "change-password"
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [userId, setUserId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const data = await AuthService.login({ email, password });

            if (data.requirePasswordChange) {
                setStep("change-password");
                setUserId(data.userId);
                setMessage(data.message);
                setLoading(false);
                return;
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            // Backend roles are lowercase in UserRole enum
            const role = data.user.role.toLowerCase();

            if (role === "owner") {
                router.push("/portal/owner");
            } else if (role === "admin") {
                router.push("/portal/admin");
            } else if (role === "clerk") {
                router.push("/portal/clerk");
            } else if (["conservator", "cadastre", "surveyor", "notary"].includes(role)) {
                router.push("/portal/authority");
            } else {
                console.log("Unknown role, redirecting to home:", role);
                router.push("/");
            }
        } catch (err: any) {
            setError("Identity server connection failed.");
        } finally {
            if (step === "login") setLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await AuthService.changePassword({ userId, newPassword });
            setStep("login");
            setPassword("");
            setNewPassword("");
            setMessage("Password updated successfully. Please log in with your new password.");
        } catch (err: any) {
            setError(err.message || "Failed to update password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] relative">
            {/* Back to Home Trigger */}
            <Link
                href="/"
                className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-xs uppercase tracking-widest transition-all group"
            >
                <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-slate-900 transition-colors">
                    <ArrowRight className="w-4 h-4 rotate-180" />
                </div>
                Back to Home
            </Link>

            {/* Logo area matches Landing Page */}
            <div className="text-center mb-10 w-full max-w-sm">
                <Link href="/" className="inline-flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
                    <div className="bg-teal-600 p-2 rounded-xl text-white shadow-lg shadow-teal-600/20">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <span className="text-2xl font-black text-slate-900 tracking-tight">Digifoncier</span>
                </Link>
                <div className="h-1 w-12 bg-teal-600 mx-auto rounded-full mb-6"></div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    {step === "login" ? "Authenticated Access" : "Security Update"}
                </h2>
                <p className="text-slate-500 text-sm font-medium">
                    {step === "login" ? "Verify your identity to manage official land records" : "You must update your password to continue"}
                </p>
            </div>

            <div className="w-full max-w-md bg-white rounded-[24px] md:rounded-[32px] shadow-2xl shadow-slate-200 border border-slate-200 p-6 md:p-10 relative overflow-hidden">
                {/* Subtle top decoration */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${step === "login" ? "from-teal-500 via-blue-500 to-indigo-500" : "from-amber-500 via-orange-500 to-red-500"}`}></div>

                {message && (
                    <div className="mb-6 flex items-center gap-3 bg-blue-50 border border-blue-100 text-blue-600 p-4 rounded-2xl text-xs md:text-sm font-semibold animate-in fade-in slide-in-from-top-2">
                        <ShieldAlert className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                        {message}
                    </div>
                )}

                {step === "login" ? (
                    <form onSubmit={handleLogin} className="space-y-4 md:space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Official Email</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
                                <input
                                    required
                                    type="email"
                                    placeholder="name@example.com"
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-12 pr-4 py-3 md:py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400 font-medium text-sm md:text-base"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Secure Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
                                <input
                                    required
                                    type="password"
                                    placeholder="••••••••••••"
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-12 pr-4 py-3 md:py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400 font-medium text-sm md:text-base"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-xs md:text-sm font-semibold animate-in fade-in slide-in-from-top-2">
                                <ShieldAlert className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 md:py-5 rounded-2xl font-black text-xs md:text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-slate-900/10 mt-4 group"
                        >
                            {loading ? "Verifying..." : (
                                <>
                                    Sign In to Portal
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>

                        <div className="pt-4 text-center flex flex-col gap-4">
                            <Link href="/register" className="text-teal-600 hover:text-teal-700 text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                                Don't have an account? Create one
                                <ArrowRight size={14} />
                            </Link>
                            <Link href="/forgot-password" className="text-slate-400 hover:text-slate-600 text-[10px] font-bold uppercase tracking-widest transition-colors">
                                Forgot your password?
                            </Link>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleChangePassword} className="space-y-4 md:space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">New Secure Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-amber-600 transition-colors" />
                                <input
                                    required
                                    type="password"
                                    placeholder="••••••••••••"
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-12 pr-4 py-3 md:py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-400 font-medium text-sm md:text-base"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-xs md:text-sm font-semibold animate-in fade-in slide-in-from-top-2">
                                <ShieldAlert className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-amber-600 hover:bg-amber-700 text-white py-4 md:py-5 rounded-2xl font-black text-xs md:text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-amber-900/10 mt-4 group"
                        >
                            {loading ? "Updating..." : (
                                <>
                                    Update Password
                                    <CheckCircle2 className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>

            {/* Verification badges */}
            <div className="mt-8 md:mt-12 flex items-center gap-6 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-slate-900" />
                    <span className="text-[8px] md:text-[10px] font-black uppercase tracking-tighter text-slate-900">End-to-End Encrypted</span>
                </div>
                <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-900" />
                    <span className="text-[8px] md:text-[10px] font-black uppercase tracking-tighter text-slate-900">Goverment Grade Security</span>
                </div>
            </div>

            <footer className="mt-12 text-center">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                    REPUBLIC OF CAMEROON • MINDAF
                </p>
            </footer>
        </div>
    );
}

