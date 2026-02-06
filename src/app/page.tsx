"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
    ShieldCheck,
    Building2,
    LockKeyhole,
    Search,
    AlertCircle,
    Lock,
    MapPin,
    FileCheck,
    Loader2
} from "lucide-react";

export default function Home() {
    const searchParams = useSearchParams();
    const [query, setQuery] = useState("");
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPayment, setShowPayment] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
    const [unlocked, setUnlocked] = useState(false);

    useEffect(() => {
        const num = searchParams.get("num");
        if (num) {
            setQuery(num);
            autoVerify(num);
        }
    }, [searchParams]);

    const autoVerify = async (num: string) => {
        setLoading(true);
        setError("");
        setResult(null);
        setUnlocked(false);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/registry/search?query=${num}`);
            const data = await res.json();

            if (res.ok) {
                setResult(data);
            } else {
                setError(data.message || "Record not found");
            }
        } catch (err) {
            setError("Failed to connect to registry. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        autoVerify(query);
    };

    const handlePayment = () => {
        if (!selectedPayment) {
            alert("Please select a payment method");
            return;
        }
        setLoading(true);
        // Simulate Payment
        setTimeout(() => {
            setLoading(false);
            setShowPayment(false);
            setUnlocked(true);
        }, 2000);
    };

    return (
        <main className="flex min-h-screen flex-col items-center bg-background p-8 selection:bg-primary/10">
            {/* Ministry Header */}
            <div className="z-10 max-w-5xl w-full flex items-center justify-center font-mono text-[10px] tracking-widest uppercase mb-20">
                <p className="border border-slate-200 bg-white px-6 py-3 rounded-full shadow-sm text-slate-500 font-bold">
                    Republic of Cameroon - Ministry of State Property and Land Tenure
                </p>
            </div>

            {/* Hero Section */}
            <div className="text-center mb-16 max-w-4xl mx-auto">
                <h1 className="text-5xl font-black tracking-tighter text-slate-900 sm:text-7xl mb-6">
                    National Land Verification System
                </h1>
                <p className="text-lg leading-relaxed text-slate-600 font-medium">
                    Secure, transparent, and instant verification of land titles.
                    Ending fraud through digitized trust.
                </p>
            </div>

            {/* Search Engine Integration (Core In-Place Verification) */}
            <div className="w-full max-w-3xl mb-24">
                <form onSubmit={handleSearch} className="relative group mb-8">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-[36px] blur opacity-20 group-focus-within:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Enter Deed Number (e.g., DEED-2024-001)"
                            className="w-full p-7 pl-16 rounded-[32px] shadow-2xl border-0 ring-1 ring-slate-200 focus:ring-4 focus:ring-primary/20 text-lg transition-all font-medium"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6 group-focus-within:text-primary transition-colors" />
                        <button
                            type="submit"
                            disabled={loading}
                            className="absolute right-3 top-3 bottom-3 bg-primary hover:bg-sky-700 text-white px-10 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Verify"}
                        </button>
                    </div>
                </form>

                {/* Error Banner */}
                {error && (
                    <div className="bg-rose-50 border border-rose-100 p-6 rounded-[32px] flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="bg-rose-500 text-white p-2 rounded-xl shadow-lg shadow-rose-500/20">
                            <AlertCircle size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-rose-500 tracking-widest mb-0.5">Access Rejected</p>
                            <span className="font-bold text-rose-900">{error}</span>
                        </div>
                    </div>
                )}

                {/* Search Results */}
                {result && (
                    <div className="bg-white rounded-[48px] shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-500 shadow-primary/5">
                        <div className={`p-4 text-center font-black text-white tracking-[0.4em] uppercase text-[10px] shadow-inner ${result.status === 'VALID' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                            {result.status} LAND TITLE • GOVERNMENT REGISTERED
                        </div>

                        <div className="p-12 grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Legal Proprietor</p>
                                <div className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                                        <Lock size={18} />
                                    </div>
                                    {unlocked ? "JEAN K. FOKAM" : result.owner_initials}
                                    {!unlocked && <span className="text-[9px] bg-slate-50 text-slate-400 px-3 py-1.5 rounded-full font-black tracking-widest border border-slate-100">MASKED</span>}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Locality Context</p>
                                <div className="text-2xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
                                    <MapPin className="text-primary" size={24} />
                                    {result.locality}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Physical Surface</p>
                                <div className="text-2xl font-black text-slate-800 underline decoration-primary/30 decoration-8 underline-offset-8">{result.area_approx} m²</div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Identifier Hash</p>
                                <div className="text-xl font-mono font-black text-primary bg-primary/5 px-5 py-2 rounded-2xl border border-primary/10 inline-block">{result.deed_number}</div>
                            </div>
                        </div>

                        {!unlocked ? (
                            <div className="bg-slate-50 p-12 border-t border-slate-100 flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-6 ring-1 ring-slate-200">
                                    <Lock className="text-slate-400" />
                                </div>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Unlock Detailed Dossier</h3>
                                <p className="text-slate-500 font-medium mb-10 max-w-sm">Access the full civil identity, cadastral boundaries, and lineage history.</p>
                                <button
                                    onClick={() => setShowPayment(true)}
                                    className="bg-primary text-white py-5 px-14 rounded-[32px] font-black text-xs uppercase tracking-widest hover:bg-sky-700 transition-all shadow-2xl shadow-primary/30 active:scale-95 flex items-center gap-3"
                                >
                                    Purchase Authorization (500 FCFA)
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="bg-sky-50 p-12 border-t border-sky-100 animate-in fade-in slide-in-from-bottom-8 duration-700">
                                <h3 className="font-black text-2xl text-slate-900 mb-10 flex items-center gap-4 uppercase tracking-tighter">
                                    <div className="bg-primary p-2.5 rounded-2xl text-white shadow-lg shadow-primary/20">
                                        <FileCheck size={24} />
                                    </div>
                                    Official Cadastral Record Unlocked
                                </h3>
                                {/* Extended info... */}
                                <div className="grid grid-cols-2 gap-6 mb-10">
                                    <div className="bg-white p-6 rounded-3xl border border-sky-100 shadow-sm">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Full Proprietor Identity</p>
                                        <p className="text-xl font-black text-slate-900 tracking-tight">JEAN K. FOKAM</p>
                                    </div>
                                    <div className="bg-white p-6 rounded-3xl border border-sky-100 shadow-sm">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date of Settlement</p>
                                        <p className="text-xl font-black text-slate-900 tracking-tight">{new Date(result.last_update).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="bg-white p-2 rounded-[40px] border border-sky-100 shadow-inner">
                                    <div className="bg-slate-900 rounded-[38px] h-80 flex flex-col items-center justify-center relative overflow-hidden">
                                        <div className="absolute inset-0 opacity-20 pointer-events-none">
                                            <div className="grid grid-cols-12 h-full">
                                                {Array.from({ length: 144 }).map((_, i) => (
                                                    <div key={i} className="border-[0.5px] border-blue-500/20"></div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="z-10 text-center">
                                            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20 animate-pulse">
                                                <MapPin className="text-blue-500" size={32} />
                                            </div>
                                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Spatial Correlation Active</p>
                                            <p className="text-[9px] font-bold text-slate-500 mt-2 uppercase">Neural Grid: 3.8480° N | 11.5021° E</p>
                                        </div>
                                        <div className="absolute w-40 h-40 border-2 border-emerald-500/40 bg-emerald-500/5 rounded-[32px] rotate-12 flex items-center justify-center font-black text-emerald-500 text-[8px] uppercase tracking-widest">
                                            Parcel Boundary Linked
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Sub-Portals Integration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-7xl">
                {/* Dashboard: Notices (Public) */}
                <Link href="/notices" className="group relative block p-10 bg-white border border-slate-100 rounded-[40px] shadow-sm hover:shadow-2xl hover:border-orange-500 transition-all duration-500 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-orange-500/10 transition-colors"></div>
                    <div className="flex items-center justify-center w-14 h-14 mb-8 rounded-2xl bg-orange-50 text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300 shadow-sm group-hover:rotate-6">
                        <ShieldCheck className="w-7 h-7" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Notice Board</h2>
                    <p className="text-slate-600 font-medium leading-relaxed mb-6">
                        Monitor active disputes, formal registration notices, and tribunal outcomes. Total transparency for all citizens.
                    </p>
                    <span className="text-orange-500 font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                        Open Portal
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                </Link>

                {/* Dashboard: Owner Portal */}
                <Link href="/portal/owner" className="group relative block p-10 bg-white border border-slate-100 rounded-[40px] shadow-sm hover:shadow-2xl hover:border-teal-500 transition-all duration-500 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-teal-500/10 transition-colors"></div>
                    <div className="flex items-center justify-center w-14 h-14 mb-8 rounded-2xl bg-teal-50 text-teal-500 group-hover:bg-teal-500 group-hover:text-white transition-all duration-300 shadow-sm group-hover:rotate-6">
                        <Building2 className="w-7 h-7" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Land Owner Portal</h2>
                    <p className="text-slate-600 font-medium leading-relaxed mb-6">
                        Securely list your assets, initiate legal transfers, and track the progress of your mutation files in real-time.
                    </p>
                    <span className="text-teal-500 font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                        Access Account
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                </Link>

                {/* Dashboard: Authority Console */}
                <Link href="/portal/authority" className="group relative block p-10 bg-white border border-slate-100 rounded-[40px] shadow-sm hover:shadow-2xl hover:border-blue-500 transition-all duration-500 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>
                    <div className="flex items-center justify-center w-14 h-14 mb-8 rounded-2xl bg-blue-50 text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm group-hover:rotate-6">
                        <LockKeyhole className="w-7 h-7" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">Authority Console</h2>
                    <p className="text-slate-600 font-medium leading-relaxed mb-6">
                        Dedicated workspace for Conservators and Surveyors to audit, validate, and sign official land certificates.
                    </p>
                    <span className="text-blue-500 font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                        Secure Login
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                </Link>
            </div>

            {/* Payment Modal Overlay */}
            {showPayment && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center z-50 p-6 animate-in fade-in duration-500">
                    <div className="bg-white rounded-[48px] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] max-w-md w-full overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-500">
                        <div className="p-12 pb-6">
                            <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">Finalize Access</h3>
                            <p className="text-slate-500 font-bold text-sm">Secure Payment Gateway • Ministry of Finance</p>
                        </div>
                        <div className="p-12 pt-4 space-y-6">
                            <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 flex justify-between items-center mb-8">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Stamp Duty</span>
                                <span className="text-3xl font-black text-slate-900 tracking-tighter">500 FCFA</span>
                            </div>

                            <button
                                onClick={() => setSelectedPayment("mtn")}
                                className={`w-full flex items-center justify-between p-7 rounded-[32px] border-2 transition-all group ${selectedPayment === 'mtn' ? 'border-yellow-400 bg-yellow-50/50 shadow-xl shadow-yellow-400/10' : 'border-slate-50 bg-slate-50/50 hover:border-slate-200'}`}
                            >
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center font-black text-slate-900 text-sm shadow-md">MTN</div>
                                    <span className="font-black text-slate-900 uppercase text-xs tracking-[0.2em]">Mobile Money</span>
                                </div>
                                <div className={`w-7 h-7 rounded-full border-2 p-1.5 transition-all ${selectedPayment === 'mtn' ? 'border-yellow-500' : 'border-slate-200'}`}>
                                    {selectedPayment === 'mtn' && <div className="w-full h-full bg-yellow-500 rounded-full" />}
                                </div>
                            </button>

                            <button
                                onClick={() => setSelectedPayment("orange")}
                                className={`w-full flex items-center justify-between p-7 rounded-[32px] border-2 transition-all group ${selectedPayment === 'orange' ? 'border-orange-500 bg-orange-50/50 shadow-xl shadow-orange-500/10' : 'border-slate-50 bg-slate-50/50 hover:border-slate-200'}`}
                            >
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center font-black text-white text-sm shadow-md">O</div>
                                    <span className="font-black text-slate-900 uppercase text-xs tracking-[0.2em]">Orange Money</span>
                                </div>
                                <div className={`w-7 h-7 rounded-full border-2 p-1.5 transition-all ${selectedPayment === 'orange' ? 'border-orange-500' : 'border-slate-200'}`}>
                                    {selectedPayment === 'orange' && <div className="w-full h-full bg-orange-500 rounded-full" />}
                                </div>
                            </button>
                        </div>
                        <div className="p-10 bg-slate-50/80 mt-4 flex gap-6">
                            <button
                                onClick={() => setShowPayment(false)}
                                className="flex-1 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 transition-all"
                            >
                                Abort
                            </button>
                            <button
                                onClick={handlePayment}
                                disabled={!selectedPayment || loading}
                                className="flex-[2] py-6 font-black text-[10px] uppercase tracking-[0.3em] bg-primary text-white rounded-[28px] hover:bg-sky-700 shadow-[0_20px_40px_-10px_rgba(var(--primary-rgb),0.4)] active:scale-95 transition-all disabled:opacity-50"
                            >
                                {loading ? "Authorizing..." : "Submit Payment"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <footer className="mt-24 text-center">
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">
                    Digital Transformation of State Property • v1.0 • © 2026 MINDAF
                </p>
            </footer>
        </main>
    );
}

const ArrowRight = ({ size, className }: { size?: number, className?: string }) => (
    <svg
        width={size || 24}
        height={size || 24}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
    </svg>
);
