"use client";
import { API_URL } from "@/config/api";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Megaphone,
    ArrowLeft,
    Calendar,
    MapPin,
    AlertTriangle,
    FileText,
    Loader2
} from "lucide-react";

interface Notice {
    id: number;
    // type: string; // CaseType
    status: string;
    data: {
        locality: string;
        parcel_number: string;
        area: number;
        notice_start_date: string;
        notice_expiration_date: string;
        [key: string]: any;
    };
    initiator: {
        full_name: string;
    };
    created_at: string;
}

export default function NoticesPage() {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotices = async () => {
            try {
                const res = await fetch(`${API_URL}/api/cases/notices`);
                if (res.ok) {
                    setNotices(await res.json());
                }
            } catch (error) {
                console.error("Failed to load notices", error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotices();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Header */}
            <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-100 p-2 rounded-lg">
                            <Megaphone className="text-orange-600 w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight uppercase">Official Notice Board</h1>
                            <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest leading-none">Republic of Cameroon</p>
                        </div>
                    </div>
                    <Link href="/" className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
                        <ArrowLeft size={16} />
                        Return to Portal
                    </Link>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="bg-orange-50 border border-orange-200 rounded-3xl p-8 mb-12 flex items-start gap-4">
                    <AlertTriangle className="text-orange-600 shrink-0 mt-1" size={24} />
                    <div>
                        <h2 className="text-orange-700 font-bold uppercase text-sm tracking-widest mb-2">Public Opposition Period</h2>
                        <p className="max-w-3xl text-sm leading-relaxed text-slate-600">
                            The following land registration requests are currently under the mandatory 30-day public notice period.
                            Any citizen with a valid claim or boundary dispute regarding these properties must file an official opposition with the Service du Cadastre before the expiration date.
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4 text-slate-500">
                        <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
                        <p className="text-xs font-bold uppercase tracking-widest">Loading Notices...</p>
                    </div>
                ) : notices.length === 0 ? (
                    <div className="text-center py-24 border-2 border-dashed border-slate-300 rounded-3xl bg-slate-100/50">
                        <p className="text-slate-500 font-medium">No active public notices at this time.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {notices.map((notice) => {
                            const expires = new Date(notice.data.notice_expiration_date);
                            const daysLeft = Math.ceil((expires.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

                            return (
                                <div key={notice.id} className="bg-white border border-slate-200 rounded-3xl p-6 hover:shadow-xl hover:border-orange-300 transition-all group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                                        <FileText size={120} className="text-slate-900" />
                                    </div>

                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-6">
                                            <span className="bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-slate-200">
                                                Ref: {notice.data.parcel_number || "PENDING"}
                                            </span>
                                            {daysLeft > 0 ? (
                                                <span className="text-orange-600 font-bold text-xs uppercase tracking-wider flex items-center gap-1">
                                                    <Calendar size={12} />
                                                    {daysLeft} Days Left
                                                </span>
                                            ) : (
                                                <span className="text-red-500 font-bold text-xs uppercase tracking-wider">Expired</span>
                                            )}
                                        </div>

                                        <h3 className="text-2xl font-bold text-slate-900 mb-1">{notice.data.locality}</h3>
                                        <p className="text-sm text-slate-500 font-medium mb-6">Applicant: <span className="text-slate-900 font-semibold">{notice.initiator.full_name}</span></p>

                                        <div className="space-y-3 mb-6">
                                            <div className="flex items-center gap-3 text-sm text-slate-500">
                                                <MapPin size={16} className="text-orange-500" />
                                                <span>{notice.data.area} m² Surface Area</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-slate-500">
                                                <Calendar size={16} className="text-orange-500" />
                                                <span>Notice Ends: {expires.toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        <Link
                                            href={`/notices/${notice.id}`}
                                            className="block w-full text-center py-3 bg-slate-50 text-slate-600 border border-slate-200 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-colors"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
