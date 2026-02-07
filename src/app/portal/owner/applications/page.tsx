"use client";

import { useEffect, useState } from "react";
import { CaseService } from "@/services/case.service";
import { Clock, CheckCircle, XCircle, FileText, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function MyApplications() {
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const data = await CaseService.getOwnerApplications();
                setApplications(data);
            } catch (error) {
                console.error("Error fetching applications:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, []);

    const getStatusStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case "approved": return "bg-green-100 text-green-700";
            case "rejected": return "bg-red-100 text-red-700";
            case "pending_payment": return "bg-yellow-100 text-yellow-700";
            case "submitted": return "bg-blue-100 text-blue-700";
            case "under_review": return "bg-teal-100 text-teal-700";
            default: return "bg-slate-100 text-slate-700";
        }
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Track Applications</h1>
                    <p className="text-slate-500 font-medium">Monitor the official status of your registry requests.</p>
                </div>
                <div className="text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-lg">
                    {applications.length} Files Active
                </div>
            </header>

            <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-5 font-black text-slate-400 uppercase tracking-widest">Reference</th>
                            <th className="px-6 py-5 font-black text-slate-400 uppercase tracking-widest">Type & Location</th>
                            <th className="px-6 py-5 font-black text-slate-400 uppercase tracking-widest">Status</th>
                            <th className="px-6 py-5 font-black text-slate-400 uppercase tracking-widest">Date</th>
                            <th className="px-6 py-5 font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {applications.map((app) => (
                            <tr key={app.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-5 font-bold text-slate-900">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-900 text-white rounded-lg shadow-sm">
                                            <FileText size={16} />
                                        </div>
                                        CASE-{app.id}
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="font-bold text-slate-900 uppercase tracking-tighter">
                                        {app.type.replace('_', ' ')}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-0.5 font-medium">
                                        {app.data?.locality ? `${app.data.locality}` : "General Application"}
                                        {app.data?.parcel_number && ` • #${app.data.parcel_number}`}
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusStyle(app.status)}`}>
                                        <Clock size={10} />
                                        {app.status.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-5 text-slate-500 font-medium italic">
                                    {new Date(app.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-5 text-right font-bold">
                                    <Link
                                        href={`/portal/owner/applications/${app.id}`}
                                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-all hover:translate-x-1"
                                    >
                                        Track File <ArrowRight size={14} />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {applications.length === 0 && (
                    <div className="p-20 text-center">
                        <div className="bg-slate-50 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                            <FileText size={32} />
                        </div>
                        <h3 className="font-bold text-slate-900">No active files</h3>
                        <p className="text-sm text-slate-500">Your submitted applications will appear here for tracking.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
