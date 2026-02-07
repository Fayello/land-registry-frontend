"use client";

import { useEffect, useState } from "react";
import { RegistryService } from "@/services/registry.service";
import { CaseService } from "@/services/case.service";
import { Building2, FileText, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function OwnerDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState({
        properties: 0,
        applications: 0,
    });
    const [properties, setProperties] = useState<any[]>([]);
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState("User");

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            const userData = JSON.parse(userStr);
            setUserName(userData.name);
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return; // Layout handles redirect

        const fetchData = async () => {
            try {
                // Fetch Properties
                const validProperties = await RegistryService.getOwnerProperties();
                setProperties(validProperties);

                // Fetch Applications
                const validApplications = await CaseService.getOwnerApplications();
                setApplications(validApplications);

                setStats({
                    properties: validProperties.length,
                    applications: validApplications.length,
                });
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [router]);

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>
                <p className="text-slate-500">Welcome back, {userName}. Here is what is happening with your assets.</p>
            </header>

            <div className="flex justify-end gap-3">
                <Link href="/portal/owner/new-registration" className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all">
                    <FileText size={16} /> New Registration
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <Building2 size={24} />
                        </div>
                        <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full">Verified Assets</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{stats.properties}</div>
                    <div className="text-sm text-slate-500">Total Properties Owned</div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
                            <FileText size={24} />
                        </div>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${stats.applications > 0 ? 'bg-orange-100 text-orange-700 animate-pulse' : 'bg-slate-100 text-slate-500'}`}>
                            {stats.applications} Active
                        </span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900">{stats.applications}</div>
                    <div className="text-sm text-slate-500">Active Applications</div>
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl text-white shadow-lg">
                    <h3 className="font-bold text-lg mb-2">Need to sell?</h3>
                    <p className="text-blue-100 text-sm mb-4">Initiate a secure transfer request directly.</p>
                    <Link href="/portal/owner/transfer" className="block text-center bg-white text-blue-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-50 transition-colors w-full">
                        Start Transfer
                    </Link>
                </div>

                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-2xl text-white shadow-lg">
                    <h3 className="font-bold text-lg mb-2">Partition Land?</h3>
                    <p className="text-indigo-100 text-sm mb-4">Request a subdivision (Morcellement).</p>
                    <Link href="/portal/owner/subdivision" className="block text-center bg-white text-indigo-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors w-full">
                        Start Subdivision
                    </Link>
                </div>
            </div>

            {/* Recent Activity / Quick Links */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-900 mb-4">Recent Properties</h3>
                    <div className="space-y-4">
                        {loading ? <p className="text-sm text-slate-400">Loading properties...</p> :
                            properties.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-sm text-slate-400 italic mb-2">No properties found.</p>
                                    <p className="text-xs text-slate-400">Approved registrations will appear here.</p>
                                </div>
                            ) :
                                properties.map((p: any) => (
                                    <div key={p.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                                                <Building2 size={18} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 text-sm">Valid Deed #{p.deed_number}</h4>
                                                <p className="text-xs text-slate-500">{p.parcel?.locality || "Global"}</p>
                                            </div>
                                        </div>
                                        <Link href={`/verify?query=${p.deed_number}`} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                                            <ArrowUpRight size={20} />
                                        </Link>
                                    </div>
                                ))
                        }
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-900">Active Applications</h3>
                        <Link href="/portal/owner/applications" className="text-blue-600 text-xs font-bold hover:underline">Track All →</Link>
                    </div>
                    <div className="space-y-4">
                        {loading ? <p className="text-sm text-slate-400">Loading applications...</p> :
                            applications.length === 0 ? <p className="text-sm text-slate-400 italic">No active applications.</p> :
                                applications.slice(0, 5).map((a: any) => (
                                    <Link href={`/portal/owner/applications/${a.id}`} key={a.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-slate-100 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${a.status === 'approved' ? 'bg-green-100 text-green-600' :
                                                a.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                                                }`}>
                                                <FileText size={18} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 text-sm uppercase">
                                                    {a.type.replace('_', ' ')}: {a.data?.locality || a.data?.parcel_number || 'General'}
                                                </h4>
                                                <p className="text-xs text-slate-500">Status: <span className="font-semibold">{a.status.replace('_', ' ')}</span> • {new Date(a.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <ArrowUpRight size={16} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                                    </Link>
                                ))
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}
