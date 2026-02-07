"use client";

import { useState } from "react";
import { AuthService } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, User, ArrowRight, Building2, ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const data = await AuthService.login({ email, password });

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
        } catch (err) {
            setError("Identity server connection failed.");
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
                    <span className="text-2xl font-black text-slate-900 tracking-tight">LandRegistry<span className="text-teal-600">.gov</span></span>
                </Link>
                <div className="h-1 w-12 bg-teal-600 mx-auto rounded-full mb-6"></div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Authenticated Access</h2>
                <p className="text-slate-500 text-sm font-medium">Verify your identity to manage official land records</p>
            </div>

            <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl shadow-slate-200 border border-slate-200 p-10 relative overflow-hidden">
                {/* Subtle top decoration */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-blue-500 to-indigo-500"></div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Official Email</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
                            <input
                                required
                                type="email"
                                placeholder="name@example.com"
                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400 font-medium"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Secure Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
                            <input
                                required
                                type="password"
                                placeholder="••••••••••••"
                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-12 pr-4 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400 font-medium"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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
                        <Link href="/" className="text-slate-400 hover:text-slate-600 text-[10px] font-bold uppercase tracking-widest transition-colors">
                            Forgot your password?
                        </Link>
                    </div>
                </form>
            </div>

            {/* Verification badges */}
            <div className="mt-12 flex items-center gap-6 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-slate-900" />
                    <span className="text-[10px] font-black uppercase tracking-tighter text-slate-900">End-to-End Encrypted</span>
                </div>
                <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-900" />
                    <span className="text-[10px] font-black uppercase tracking-tighter text-slate-900">Goverment Grade Security</span>
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

