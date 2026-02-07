"use client";
import { API_URL } from "@/config/api";

import { useEffect, useState, useCallback } from "react";
import { ShieldAlert, CheckCircle, Clock, Search, Filter, Loader2, ArrowRight, Shield, FileText, TrendingUp, Users, Calendar, MapPin, Landmark, LayoutDashboard, Database, Scroll } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function QueuePage() {
    const router = useRouter();
    const [cases, setCases] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const [userPermissions, setUserPermissions] = useState<string[]>([]);
    const [userRoleName, setUserRoleName] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState("");

    const fetchPendingCases = useCallback(async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${API_URL}/api/cases/pending`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setCases(data);
            }
        } catch (error) {
            console.error("Fetch pending cases error:", error);
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

            // Authorization check based on view_all permission
            if (!permissions.includes("cases.view_all") && user.role !== "admin") {
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
        fetchPendingCases();
    }, [router, fetchPendingCases]);

    const getRoleContext = () => {
        if (userPermissions.includes("cases.seal")) {
            return { title: "Authority Console", theme: "teal" };
        }
        if (userPermissions.includes("cases.validate_technical")) {
            return { title: "Technical Desk", theme: "purple" };
        }
        if (userPermissions.includes("cases.upload_report")) {
            return { title: "Surveys Portal", theme: "orange" };
        }
        return { title: "Authority Console", theme: "slate" };
    };

    const context = getRoleContext();

    const filteredCases = cases.filter(c =>
        c.initiator?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.data?.parcel_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.toString().includes(searchQuery)
    );

    if (isAuthorized === null || isAuthorized === false) return null;

    return (
        <div className="space-y-8">
            <header className="mb-12">
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">Examination Queue</h1>
                <p className="text-slate-500 font-medium tracking-tight">Active applications pending administrative or technical clearance.</p>
            </header>

            <div className="bg-white rounded-[48px] border border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/50">
                <div className="p-10 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                    <h2 className="text-2xl font-black text-slate-900 flex items-center gap-4 tracking-tighter uppercase">
                        <LayoutDashboard className="text-teal-600" />
                        Pending Files
                    </h2>
                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-3xl px-6 py-3 w-full max-w-sm group focus-with:border-teal-500/50 transition-all">
                        <Search size={18} className="text-slate-400 group-focus-within:text-teal-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by Parcel ID or Name..."
                            className="bg-transparent border-none focus:outline-none text-sm text-slate-900 w-full font-bold py-1 placeholder:text-slate-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="divide-y divide-slate-50">
                    {loading ? (
                        <div className="p-32 flex flex-col items-center justify-center gap-6">
                            <Loader2 className="w-12 h-12 text-teal-600 animate-spin" />
                            <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.3em]">Syncing National Registry...</p>
                        </div>
                    ) : filteredCases.length === 0 ? (
                        <div className="p-32 flex flex-col items-center justify-center gap-4 opacity-50">
                            <CheckCircle className="w-16 h-16 text-slate-300" />
                            <p className="text-slate-400 font-black uppercase text-xs tracking-widest">No matching applications found.</p>
                        </div>
                    ) : (
                        filteredCases.map((c) => (
                            <div key={c.id} className="p-10 flex flex-col md:flex-row justify-between items-center group hover:bg-slate-50/50 transition-all">
                                <div className="flex gap-8 items-start">
                                    <div className={`p-5 rounded-[28px] border shadow-sm ${c.type.toUpperCase() === 'NEW_REGISTRATION' ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-orange-50 border-orange-100 text-orange-600'}`}>
                                        {c.type.toUpperCase() === 'NEW_REGISTRATION' ? <ShieldAlert size={28} /> : <Clock size={28} />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-4 mb-2">
                                            <h3 className="font-black text-xl text-slate-900 uppercase tracking-tighter leading-none">{c.type.toUpperCase().replace('_', ' ')}</h3>
                                            <span className="text-[10px] font-black text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 uppercase tracking-widest shadow-sm">
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
                                            {userPermissions.includes("cases.validate_technical") ? "Validate Plan" : userPermissions.includes("cases.upload_report") ? "Upload Report" : "Begin Review"}
                                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
