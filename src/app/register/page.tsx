"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, User, Mail, Lock, Smartphone, CreditCard, ArrowRight, ShieldAlert, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        password: "",
        confirm_password: "",
        national_id_number: "",
        phone_number: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (formData.password !== formData.confirm_password) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("http://localhost:3001/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    full_name: formData.full_name,
                    email: formData.email,
                    password: formData.password,
                    national_id_number: formData.national_id_number,
                    phone_number: formData.phone_number,
                    role: "owner" // Defaulting to owner for this flow
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                setTimeout(() => {
                    router.push("/login");
                }, 3000);
            } else {
                setError(data.message || "Registration failed. Please try again.");
            }
        } catch (err) {
            setError("Failed to connect to the identity server.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                <div className="w-full max-w-md bg-white rounded-[40px] shadow-2xl p-12 text-center border border-slate-100 animate-in zoom-in-95 duration-500">
                    <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter">Identity Established</h2>
                    <p className="text-slate-500 font-medium leading-relaxed mb-8">Your account has been successfully registered on the National Land Registry server. Redirecting you to secure login...</p>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 animate-[progress_3s_linear]"></div>
                    </div>
                    <style jsx>{`
                        @keyframes progress {
                            from { width: 0%; }
                            to { width: 100%; }
                        }
                    `}</style>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] relative py-20">
            {/* Back Trigger */}
            <Link
                href="/login"
                className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold text-xs uppercase tracking-widest transition-all group"
            >
                <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center group-hover:border-slate-900 transition-colors">
                    <ArrowRight className="w-4 h-4 rotate-180" />
                </div>
                Return to Login
            </Link>

            {/* Header Content */}
            <div className="text-center mb-10 w-full max-w-xl">
                <Link href="/" className="inline-flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
                    <div className="bg-teal-600 p-2 rounded-xl text-white shadow-lg shadow-teal-600/20">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <span className="text-2xl font-black text-slate-900 tracking-tight">LandRegistry<span className="text-teal-600">.gov</span></span>
                </Link>
                <div className="h-1 w-12 bg-teal-600 mx-auto rounded-full mb-6"></div>
                <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Create Your Official Portal</h2>
                <p className="text-slate-500 text-sm font-medium">Join the digital transformation of Cameroon's land administration</p>
            </div>

            <div className="w-full max-w-2xl bg-white rounded-[48px] shadow-2xl shadow-slate-200 border border-slate-200 p-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-500"></div>

                <form onSubmit={handleRegister} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Full Name */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Legal Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
                                <input
                                    required
                                    name="full_name"
                                    type="text"
                                    placeholder="John Doe"
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-14 pr-4 py-4 rounded-3xl focus:outline-none focus:border-teal-500 transition-all font-medium"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Official Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
                                <input
                                    required
                                    name="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-14 pr-4 py-4 rounded-3xl focus:outline-none focus:border-teal-500 transition-all font-medium"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Phone Number */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Contact Phone</label>
                            <div className="relative group">
                                <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
                                <input
                                    required
                                    name="phone_number"
                                    type="tel"
                                    placeholder="+237 6XX XXX XXX"
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-14 pr-4 py-4 rounded-3xl focus:outline-none focus:border-teal-500 transition-all font-medium"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* National ID */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">National ID (CNI)</label>
                            <div className="relative group">
                                <CreditCard className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
                                <input
                                    required
                                    name="national_id_number"
                                    type="text"
                                    placeholder="ID-XXXXXXXX-X"
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-14 pr-4 py-4 rounded-3xl focus:outline-none focus:border-teal-500 transition-all font-medium"
                                    value={formData.national_id_number}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Access Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
                                <input
                                    required
                                    name="password"
                                    type="password"
                                    placeholder="••••••••••••"
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-14 pr-4 py-4 rounded-3xl focus:outline-none focus:border-teal-500 transition-all font-medium"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Confirm Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-600 transition-colors" />
                                <input
                                    required
                                    name="confirm_password"
                                    type="password"
                                    placeholder="••••••••••••"
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 pl-14 pr-4 py-4 rounded-3xl focus:outline-none focus:border-teal-500 transition-all font-medium"
                                    value={formData.confirm_password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 p-5 rounded-3xl text-xs font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-2">
                            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-6 rounded-3xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-4 transition-all active:scale-[0.98] disabled:opacity-50 shadow-2xl shadow-slate-900/20 group"
                        >
                            {loading ? "Establishing Identity..." : (
                                <>
                                    Complete Institutional Onboarding
                                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>

                    <p className="text-center text-slate-400 text-xs font-medium">
                        By registering, you agree to the <Link href="#" className="underline hover:text-slate-600">Land Governance Terms of Service</Link> and the <Link href="#" className="underline hover:text-slate-600">Data Integrity Policy</Link>.
                    </p>
                </form>
            </div>

            <footer className="mt-12 text-center">
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
                    REPUBLIC OF CAMEROON • MINISTRY OF DOMAINS, SURVEYS AND LAND TENURE (MINDAF)
                </p>
            </footer>
        </div>
    );
}
