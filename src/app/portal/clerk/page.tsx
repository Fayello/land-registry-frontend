"use client";

import { useState } from "react";
import { LayoutDashboard, Upload, History, Database, Shield, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

export default function ClerkDashboard() {
    const stats = [
        { label: "Today's Ingestions", value: "24", icon: Upload, color: "text-blue-600", bg: "bg-blue-600/10" },
        { label: "Pending Verification", value: "12", icon: History, color: "text-orange-600", bg: "bg-orange-600/10" },
        { label: "Total Digital Deeds", value: "1,240", icon: Database, color: "text-green-600", bg: "bg-green-600/10" },
    ];

    const [scannerStatus, setScannerStatus] = useState({ isReady: false, initializing: false, driver: "None Detected" });

    const handleInitializeScanner = async () => {
        setScannerStatus({ ...scannerStatus, initializing: true });
        const token = localStorage.getItem("token");
        try {
            const response = await fetch("http://localhost:3001/api/ingestion/scanner/initialize", {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();
            setScannerStatus({ isReady: true, initializing: false, driver: data.driver });
        } catch (error) {
            setScannerStatus({ ...scannerStatus, initializing: false });
            alert("Hardware discovery failed. Ensure bridge-service is running.");
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            <div className="bg-slate-900 rounded-[48px] p-12 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-12 opacity-10">
                    <Shield size={200} />
                </div>
                <div className="relative z-10 max-w-2xl">
                    <h2 className="text-4xl font-black tracking-tight uppercase mb-4">Digitization Command</h2>
                    <p className="text-slate-400 text-lg leading-relaxed mb-8">
                        The bridge between physical archives and the cloud. Process legacy "Livre Foncier" records through our high-speed ingestion engine.
                    </p>
                    <Link
                        href="/portal/clerk/digitize"
                        className="inline-flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-sm hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20"
                    >
                        Initialize New Scan <ArrowRight size={20} />
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                        <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
                            <stat.icon size={28} className={stat.color} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm">
                    <h3 className="text-xl font-black text-slate-900 uppercase mb-8">Recent Activities</h3>
                    <div className="space-y-6">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                                    <FileText size={24} className={""} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-900">LEGACY-48291 Digitized</p>
                                    <p className="text-xs text-slate-400">Vol 142 / Folio 24 • 2 hours ago</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-green-600 uppercase">Success</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={`p-10 rounded-[40px] border relative overflow-hidden group transition-all duration-500 ${scannerStatus.isReady ? 'bg-emerald-50 border-emerald-100' : 'bg-blue-50 border-blue-100'}`}>
                    <div className="relative z-10">
                        <h3 className={`text-xl font-black uppercase mb-4 ${scannerStatus.isReady ? 'text-emerald-900' : 'text-blue-900'}`}>Scanner Integration</h3>
                        <p className={`text-sm mb-8 max-w-xs ${scannerStatus.isReady ? 'text-emerald-700/70' : 'text-blue-700/70'}`}>
                            {scannerStatus.isReady
                                ? `Connected to ${scannerStatus.driver}. Multi-page feeder is active and ready for ingestion.`
                                : "Connecting to industrial scanners... Ensure the TWAIN driver is active for automated multi-page ingestion."}
                        </p>
                        <div className="flex gap-4">
                            {!scannerStatus.isReady && (
                                <button
                                    onClick={handleInitializeScanner}
                                    disabled={scannerStatus.initializing}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2"
                                >
                                    {scannerStatus.initializing ? <Loader2 className="animate-spin" size={14} /> : <Database size={14} />}
                                    {scannerStatus.initializing ? "Discovering Hardware..." : "Initialize Hardware"}
                                </button>
                            )}
                            {scannerStatus.isReady && (
                                <>
                                    <span className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div> Device Online
                                    </span>
                                    <span className="px-4 py-2 bg-white text-emerald-600 border border-emerald-200 rounded-xl text-[10px] font-black uppercase tracking-widest">Feeder Ready</span>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
                        <Upload size={180} className={scannerStatus.isReady ? 'text-emerald-900' : 'text-blue-900'} />
                    </div>
                </div>
            </div>
        </div>
    );
}

const FileText = ({ size, className }: { size: number, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" />
    </svg>
);
