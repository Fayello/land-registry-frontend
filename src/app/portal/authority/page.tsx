"use client";

import { useEffect, useState, useCallback } from "react";
import { CaseService } from "@/services/case.service";
import { ShieldAlert, CheckCircle, Clock, Search, Filter, Loader2, ArrowRight, Shield, FileText, TrendingUp, Users, Calendar, MapPin, Landmark, LayoutDashboard, Database, Scroll } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AuthorityDashboard() {
    const router = useRouter();
    const [cases, setCases] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const [userPermissions, setUserPermissions] = useState<string[]>([]);
    const [userRoleName, setUserRoleName] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState("");
    const [showHistory, setShowHistory] = useState(false);

    const fetchPendingCases = useCallback(async (historyMode: boolean = false) => {
        setLoading(true);
        try {
            const data = await CaseService.getAuthorityQueue(historyMode);
            setCases(data);
        } catch (error) {
            console.error("Fetch cases error:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const userStr = localStorage.getItem("user");

        if (!token) {
            router.replace("/login");
            setIsAuthorized(false);
            return;
        }

        if (userStr) {
            const user = JSON.parse(userStr);
            const permissions = user.permissions || [];
            setUserPermissions(permissions);
            setUserRoleName(user.roleName || user.role);

            // Authorization check based on view_all permission or specific authority roles
            const isAuthorityRole = ["admin", "conservator", "cadastre", "surveyor", "notary"].includes(user.role?.toLowerCase());

            if (!permissions.includes("cases.view_all") && !isAuthorityRole) {
                router.replace(user.role === "owner" ? "/portal/owner" : "/");
                setIsAuthorized(false);
                return;
            }
        } else {
            router.replace("/login");
            setIsAuthorized(false);
            return;
        }

        setIsAuthorized(true);
        fetchPendingCases(showHistory);
    }, [router, fetchPendingCases, showHistory]);

    const getRoleContext = () => {
        // Dynamic context based on permissions instead of fixed roles where possible
        if (userPermissions.includes("cases.seal")) {
            return { title: "Authority Console", subtitle: "Ministry of State Property • Land Registry Division", icon: Shield, theme: "teal" };
        }
        if (userPermissions.includes("cases.validate_technical")) {
            return { title: "Technical Desk", subtitle: "Service du Cadastre • Physical Validation", icon: MapPin, theme: "purple" };
        }
        if (userPermissions.includes("cases.upload_report")) {
            return { title: "Surveys Portal", subtitle: "National Geometer Dashboard • Field Operations", icon: FileText, theme: "orange" };
        }
        if (userRoleName === "Notary") {
            return { title: "Notary Chamber", subtitle: "Legal Authentication & Deed Submission", icon: Landmark, theme: "blue" };
        }
        if (userRoleName === "Super Admin") {
            return { title: "Global Registry", subtitle: "System Administrator Control Panel", icon: Database, theme: "indigo" };
        }

        return { title: "Authority Console", subtitle: "Land Verification System", icon: Shield, theme: "slate" };
    };

    const context = getRoleContext();

    const filteredCases = cases.filter(c =>
        c.initiator?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.data?.parcel_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.toString().includes(searchQuery)
    );

    if (isAuthorized === null || isAuthorized === false) return null;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-teal-500/20">
            {/* Context Header */}
            <header className="mb-12 flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-teal-600 p-2 rounded-lg shadow-lg shadow-teal-600/10">
                            <context.icon className="text-white w-5 h-5" />
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">{context.title}</h1>
                    </div>
                    <p className="text-slate-500 font-medium">{context.subtitle}</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-white p-4 rounded-3xl border border-slate-200 text-right group hover:border-teal-500/30 transition-all shadow-sm">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">Official Digital Seal</span>
                        <div className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-teal-600 font-mono text-xs font-bold uppercase tracking-widest">Active • {(userRoleName || "OFFL").toUpperCase().substring(0, 4)}--24-99</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Quick Stats Ribbon */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {[
                    { label: "Pending Examination", value: showHistory ? "---" : cases.length, icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
                    { label: "Daily Processing", value: "84%", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Active Notaries", value: "12", icon: Users, color: "text-teal-600", bg: "bg-teal-50" }
                ].map((stat, i) => (
                    <div key={i} className={`${stat.bg} border border-slate-100 p-8 rounded-[40px] flex items-center justify-between group hover:shadow-xl hover:border-teal-200 transition-all shadow-sm`}>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className="text-4xl font-black text-slate-900 tracking-tighter">{stat.value}</p>
                        </div>
                        <stat.icon className={`w-8 h-8 ${stat.color} opacity-20 group-hover:opacity-100 transition-opacity`} />
                    </div>
                ))}
            </div>

            {/* Main Workspace Area */}
            <div className="bg-white rounded-[48px] border border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/50">
                <div className="p-10 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-4 tracking-tighter uppercase">
                        <LayoutDashboard className="text-teal-600" />
                        Application Queue
                    </h2>
                    <div className="flex items-center gap-6">
                        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
                            <button
                                onClick={() => setShowHistory(false)}
                                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!showHistory ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Active Queue
                            </button>
                            <button
                                onClick={() => setShowHistory(true)}
                                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${showHistory ? 'bg-white text-teal-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Recent Activity
                            </button>
                        </div>
                        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-3xl px-6 py-3 w-full max-w-sm group focus-with:border-teal-500/50 transition-all">
                            <Search size={18} className="text-slate-400 group-focus-within:text-teal-600 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search IDs or names..."
                                className="bg-transparent border-none focus:outline-none text-sm text-slate-900 w-full font-bold py-1 placeholder:text-slate-400"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="divide-y divide-slate-50">
                    {loading ? (
                        <div className="p-32 flex flex-col items-center justify-center gap-6">
                            <Loader2 className="w-12 h-12 text-teal-600 animate-spin" />
                            <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.3em]">Syncing National Registry...</p>
                        </div>
                    ) : (
                        filteredCases.map((c) => (
                            <div key={c.id} className="p-10 flex flex-col md:flex-row justify-between items-center group hover:bg-slate-50/50 transition-all">
                                <div className="flex gap-8 items-start">
                                    <div className={`p-5 rounded-[28px] border shadow-sm ${c.status === 'approved' ? 'bg-green-50 border-green-100 text-green-600' :
                                        c.status === 'rejected' ? 'bg-red-50 border-red-100 text-red-600' :
                                            c.type === 'new_registration' ? 'bg-blue-50 border-blue-100 text-blue-600' :
                                                'bg-orange-50 border-orange-100 text-orange-600'
                                        }`}>
                                        {c.status === 'approved' ? <CheckCircle size={28} /> :
                                            c.status === 'rejected' ? <ShieldAlert size={28} /> :
                                                c.type === 'new_registration' ? <ShieldAlert size={28} /> : <Clock size={28} />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-4 mb-2">
                                            <h3 className="font-black text-xl text-slate-900 uppercase tracking-tighter leading-none">{c.type.replace('_', ' ')}</h3>
                                            <span className={`text-[10px] font-black px-3 py-1 rounded-full border uppercase tracking-widest shadow-sm ${c.status === 'approved' ? 'bg-green-500 text-white border-green-600' :
                                                c.status === 'rejected' ? 'bg-red-500 text-white border-red-600' :
                                                    'bg-white text-slate-500 border-slate-200'
                                                }`}>
                                                {c.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <p className="text-slate-500 font-medium tracking-tight">Applicant: <span className="text-slate-900 font-black">{c.initiator?.full_name}</span></p>
                                        <div className="flex items-center gap-6 mt-3">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                <Calendar size={12} className="text-teal-600" />
                                                {new Date(c.created_at).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] font-black text-teal-600 uppercase tracking-widest">
                                                <Shield size={12} />
                                                ID: {c.id}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right mt-6 md:mt-0">
                                    <div className="font-mono text-xs text-teal-600 mb-6 bg-teal-50 px-5 py-2 rounded-2xl border border-teal-100 font-bold inline-block shadow-sm">
                                        {c.data?.parcel_number || "PENDING-ID"}
                                    </div>
                                    <div>
                                        <Link
                                            href={`/portal/authority/${c.id}`}
                                            className="inline-flex items-center gap-4 bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-teal-600 transition-all active:scale-[0.98] shadow-xl group"
                                        >
                                            {c.status === 'approved' || c.status === 'rejected' ? "View Audit" :
                                                userPermissions.includes("cases.seal") ? "Begin Review" :
                                                    userPermissions.includes("cases.validate_technical") ? "Validate Plan" :
                                                        userPermissions.includes("cases.upload_report") ? "Upload Report" : "View Details"}
                                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    {!loading && filteredCases.length === 0 && (
                        <div className="p-20 text-center">
                            <Database className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-400 font-bold">No applications found in this view.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
