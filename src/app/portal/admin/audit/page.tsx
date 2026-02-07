"use client";
import { API_URL } from "@/config/api";

import { useState, useEffect } from "react";
import {
    ShieldAlert,
    Clock,
    User,
    Database,
    FileText,
    ArrowLeft,
    Loader2
} from "lucide-react";
import Link from "next/link";

interface AuditLog {
    id: number;
    actor_id: number;
    actor_name?: string;
    action: string;
    target_table: string;
    target_id: string;
    diff: any;
    timestamp: string;
}

export default function AuditLogPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            const token = localStorage.getItem("token");
            try {
                const response = await fetch(`${API_URL}/api/admin/audit`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (response.ok) {
                    setLogs(await response.json());
                }
            } catch (error) {
                console.error("Error fetching audit logs:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-slate-500">
                <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
                <p className="text-xs font-black uppercase tracking-[0.2em]">Decrypting Audit Trail...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <Link href="/portal/admin" className="inline-flex items-center gap-2 text-slate-400 hover:text-teal-600 font-bold uppercase text-[10px] tracking-widest mb-4 transition-colors">
                    <ArrowLeft size={16} />
                    Back to Console
                </Link>
                <div className="flex items-center gap-3 text-teal-600 mb-2">
                    <ShieldAlert size={24} />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">System Integrity</span>
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter">System Audit Log</h1>
                <p className="text-slate-500 mt-2 max-w-xl leading-relaxed">Immutable record of all high-privilege actions and data modifications within the National Land Registry.</p>
            </div>

            {/* Logs List */}
            <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50">
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest pl-8">Timestamp</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actor Identity</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action Type</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Resource</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="p-6 pl-8">
                                        <div className="flex items-center gap-3 text-slate-500">
                                            <Clock size={16} className="text-slate-300 group-hover:text-teal-500 transition-colors" />
                                            <span className="font-mono text-xs font-medium">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-slate-100 p-1.5 rounded-lg text-slate-500">
                                                <User size={14} />
                                            </div>
                                            <span className="text-sm font-bold text-slate-700">{log.actor_name || `User ID: ${log.actor_id}`}</span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${log.action === "DELETE" ? "bg-red-50 text-red-600 border border-red-100" :
                                                log.action === "UPDATE" ? "bg-amber-50 text-amber-600 border border-amber-100" :
                                                    "bg-teal-50 text-teal-600 border border-teal-100"
                                            }`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Database size={14} className="text-slate-300" />
                                            <span className="text-xs font-bold uppercase">{log.target_table} #{log.target_id}</span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="max-w-xs">
                                            <code className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200 block truncate font-mono">
                                                {JSON.stringify(log.diff)}
                                            </code>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
