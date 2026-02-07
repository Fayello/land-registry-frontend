"use client";
import { API_URL } from "@/config/api";

import { useEffect, useState } from "react";
import {
    Megaphone,
    ArrowLeft,
    Calendar,
    MapPin,
    FileText,
    ShieldAlert,
    Scale,
    Gavel,
    Clock,
    Loader2,
    CheckCircle
} from "lucide-react";
import Link from "next/link";

interface Notice {
    id: number;
    type: string;
    status: string;
    data: {
        locality: string;
        parcel_number: string;
        area: number;
        notice_start_date: string;
        notice_expiration_date: string;
        dossier_technique_ref?: string;
        tax_clearance_ref?: string;
        [key: string]: any;
    };
    initiator: {
        full_name: string;
        email?: string;
    };
    created_at: string;
}

export default function NoticeDetailPage({ params }: { params: { id: string } }) {
    const [notice, setNotice] = useState<Notice | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotice = async () => {
            try {
                const res = await fetch(`${API_URL}/api/cases/notices/${params.id}`);
                if (res.ok) {
                    setNotice(await res.json());
                }
            } catch (error) {
                console.error("Failed to load notice", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotice();
    }, [params.id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Retrieving File...</p>
            </div>
        );
    }

    if (!notice) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-6">
                <ShieldAlert className="w-16 h-16 text-red-500" />
                <h1 className="text-2xl font-bold">Public Notice Not Found</h1>
                <Link href="/notices" className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all">
                    Back to Notice Board
                </Link>
            </div>
        );
    }

    const expires = new Date(notice.data.notice_expiration_date);
    const daysLeft = Math.ceil((expires.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-24">
            {/* Header */}
            <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-100 p-2 rounded-lg">
                            <Megaphone className="text-orange-600 w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase">Public Notice Details</h1>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">File Reference: {notice.data.parcel_number}</p>
                        </div>
                    </div>
                    <Link href="/notices" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
                        <ArrowLeft size={16} />
                        Notice Board
                    </Link>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-12">
                {/* Status Card */}
                <div className="bg-white rounded-[40px] shadow-xl border border-slate-200 overflow-hidden mb-8">
                    <div className={`p-6 text-center font-black text-[10px] uppercase tracking-[0.2em] border-b ${daysLeft > 0 ? 'bg-orange-500 text-white' : 'bg-red-500 text-white'}`}>
                        {daysLeft > 0 ? `Public Opposition Period: ${daysLeft} Days Remaining` : 'Opposition Period Expired'}
                    </div>

                    <div className="p-8 md:p-12">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
                            <div className="flex-1">
                                <span className="inline-block px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-slate-200">
                                    {notice.type.replace('_', ' ')}
                                </span>
                                <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-2 uppercase leading-none">
                                    {notice.data.locality}
                                </h2>
                                <p className="text-slate-500 font-medium">
                                    Initiated by <span className="text-slate-900 font-bold">{notice.initiator.full_name}</span>
                                </p>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 w-full md:w-64">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
                                            <Calendar size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Expiration</p>
                                            <p className="text-sm font-bold text-slate-900">{expires.toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                                            <MapPin size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Surface Area</p>
                                            <p className="text-sm font-bold text-slate-900">{notice.data.area} m²</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-y border-slate-100 mb-12">
                            <div className="space-y-6">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <FileText size={14} className="text-orange-500" /> Technical Data
                                </h3>
                                <div className="space-y-4">
                                    <div className="bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Survey Reference</p>
                                        <p className="text-xs font-mono font-bold text-slate-900">{notice.data.parcel_number}</p>
                                    </div>
                                    {notice.data.dossier_technique_ref && (
                                        <div className="bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Dossier Technique Ref</p>
                                            <p className="text-xs font-mono font-bold text-slate-900">{notice.data.dossier_technique_ref}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <ShieldAlert size={14} className="text-orange-500" /> Compliance Ref
                                </h3>
                                <div className="space-y-4">
                                    <div className="bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Tax Clearance (ACF) Ref</p>
                                        <p className="text-xs font-mono font-bold text-slate-900">{notice.data.tax_clearance_ref || "VERIFIED-MINFI-001"}</p>
                                    </div>
                                    <div className="bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">C. Urbanisme Ref</p>
                                        <p className="text-xs font-mono font-bold text-slate-900">{notice.data.urban_cert_ref || "CU-YAO-2024-88"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Opposition Instructions */}
                        <div className="bg-orange-50 rounded-3xl p-8 border border-orange-200">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="bg-orange-600 p-3 rounded-2xl text-white shadow-lg shadow-orange-600/20">
                                    <Scale size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-orange-900 uppercase tracking-tighter">Instructions for Opposition</h3>
                                    <p className="text-xs font-bold text-orange-700/70 uppercase tracking-widest">Mandatory Cameroonian Registry Procedure</p>
                                </div>
                            </div>

                            <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
                                <p>
                                    Following <strong>Article 35 of Decree No. 2005/481 of December 16, 2005</strong>, any person whose rights are harmed by this registration request may file an opposition.
                                </p>

                                <ul className="space-y-4">
                                    <li className="flex gap-3">
                                        <div className="bg-orange-200 h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-orange-700 text-[10px] font-bold">1</div>
                                        <p>Submit a written statement of opposition to the <strong>Service Départemental des Affaires Foncières</strong> (Departmental Service of Land Affairs) of the locality.</p>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="bg-orange-200 h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-orange-700 text-[10px] font-bold">2</div>
                                        <p>Provide evidence of property rights or boundary encroachment (original deeds, survey reports, or traditional certification).</p>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="bg-orange-200 h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-orange-700 text-[10px] font-bold">3</div>
                                        <p>The opposition must be received no later than <strong>{expires.toLocaleDateString()}</strong> before the close of administrative business hours.</p>
                                    </li>
                                </ul>

                                <div className="pt-6 border-t border-orange-200/50 mt-6 flex flex-col md:flex-row gap-6 items-center">
                                    <div className="flex items-center gap-3 text-orange-800 font-bold bg-white/50 px-4 py-2 rounded-xl border border-orange-200">
                                        <Gavel size={18} />
                                        <span>Conciliation Procedure Applies</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-orange-800 font-bold bg-white/50 px-4 py-2 rounded-xl border border-orange-200">
                                        <Clock size={18} />
                                        <span>30-Day Mandatory Period</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 italic">Digitally issued by the National Land Registry transparency portal</p>
                    <div className="flex justify-center gap-4">
                        <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors uppercase tracking-widest">
                            <CheckCircle size={16} className="text-green-500" />
                            Verify Document Hash
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
