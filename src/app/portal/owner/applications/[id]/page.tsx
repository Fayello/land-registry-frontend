"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Clock, CheckCircle, XCircle, FileText, Loader2,
    ArrowLeft, MapPin, Calendar, User, ShieldCheck, AlertCircle, Megaphone, ArrowRight
} from "lucide-react";
import Link from "next/link";

export default function ApplicationDetail() {
    const params = useParams();
    const router = useRouter();
    const [application, setApplication] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            const token = localStorage.getItem("token");
            try {
                const response = await fetch(`http://localhost:3001/api/owner/applications/${params.id}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (!response.ok) throw new Error("Not found");
                const data = await response.json();
                setApplication(data);
            } catch (error) {
                console.error("Error fetching application:", error);
                router.replace("/portal/owner/applications");
            } finally {
                setLoading(false);
            }
        };

        if (params.id) fetchDetail();
    }, [params.id, router]);

    const getStatusStep = (status: string) => {
        switch (status?.toLowerCase()) {
            case "pending_payment": return 1;
            case "submitted":
            case "pending_commission": return 2;
            case "commission_visit": return 3;
            case "technical_validation": return 4;
            case "opposition_period": return 5;
            case "under_review": return 6;
            case "approved":
            case "rejected": return 7;
            default: return 0;
        }
    };

    const handlePayment = async () => {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`http://localhost:3001/api/cases/${params.id}/pay-fees`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                window.location.reload();
            }
        } catch (error) {
            console.error("Payment error:", error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
            </div>
        );
    }

    if (!application) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <Link
                href="/portal/owner/applications"
                className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium text-sm group"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to My Applications
            </Link>

            {/* Payment Gating Card */}
            {application.status === 'pending_payment' && (
                <div className="bg-orange-50 border border-orange-200 rounded-[32px] p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="bg-orange-500 text-white p-3 rounded-2xl shadow-lg shadow-orange-500/20">
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-orange-900 uppercase tracking-tight">Payment Required</h3>
                            <p className="text-orange-800/80 text-sm font-medium">To proceed with your application, a registration fee of **25,000 XAF** must be settled.</p>
                        </div>
                    </div>
                    <button
                        onClick={handlePayment}
                        className="bg-orange-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20 active:scale-95"
                    >
                        Pay with Mobile Money
                    </button>
                </div>
            )}

            <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-slate-900 text-white p-2 rounded-xl">
                                <FileText size={20} />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900 uppercase">
                                {application.type.replace('_', ' ')}
                            </h1>
                        </div>
                        <p className="text-slate-500 text-sm font-medium">Application ID: <span className="text-slate-900">CASE-{application.id}</span></p>
                    </div>
                    <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm ${application.status === 'approved' ? 'bg-green-100 text-green-700' :
                        application.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                        {application.status.replace('_', ' ')}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
                    {/* Left: Metadata */}
                    <div className="p-8 lg:col-span-1 space-y-8">
                        <div>
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Location Details</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <MapPin size={18} className="text-slate-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">{application.data?.locality || "Not Specified"}</p>
                                        <p className="text-xs text-slate-500 uppercase tracking-tighter font-semibold">Locality</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <ShieldCheck size={18} className="text-slate-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">{application.data?.parcel_number || application.related_parcel?.parcel_number || "Pending Allocation"}</p>
                                        <p className="text-xs text-slate-500 uppercase tracking-tighter font-semibold">Parcel / Slot Number</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Timestamps</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <Calendar size={18} className="text-slate-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">{new Date(application.created_at).toLocaleDateString()}</p>
                                        <p className="text-xs text-slate-500 uppercase tracking-tighter font-semibold">Submission Date</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Progress Timeline */}
                    <div className="p-10 lg:col-span-2 bg-white">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-2">
                            Live Tracking Status <span className="h-2 w-2 bg-green-500 rounded-full animate-ping"></span>
                        </h3>

                        <div className="relative pb-10">
                            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-100"></div>

                            {/* Step 1: Payment */}
                            <div className="relative flex gap-8 mb-12">
                                <div className={`z-10 w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${getStatusStep(application.status) >= 1 ? "bg-orange-500 text-white" : "bg-white border-2 border-slate-200 text-slate-300"}`}>
                                    <CheckCircle size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-lg">Fee Settlement</h4>
                                    <p className="text-sm text-slate-500 leading-relaxed max-w-sm mt-1">Official state fees required for processing land titles.</p>
                                    <span className={`text-xs font-bold mt-3 inline-block px-2 py-1 rounded-md ${getStatusStep(application.status) >= 2 ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"}`}>
                                        {getStatusStep(application.status) >= 2 ? "PAID" : "AWAITING PAYMENT"}
                                    </span>
                                </div>
                            </div>

                            {/* Step 2: Submission */}
                            <div className="relative flex gap-8 mb-12">
                                <div className={`z-10 w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${getStatusStep(application.status) >= 2 ? "bg-slate-900 text-white" : "bg-white border-2 border-slate-200 text-slate-300"}`}>
                                    <CheckCircle size={20} />
                                </div>
                                <div>
                                    <h4 className={`font-bold text-lg ${getStatusStep(application.status) >= 2 ? "text-slate-900" : "text-slate-300"}`}>Registry Log Entry</h4>
                                    <p className="text-sm text-slate-500 leading-relaxed max-w-sm mt-1">Application successfully recorded in the National Registry database. Unique identifier Case IDCASE-{application.id} assigned.</p>
                                    {getStatusStep(application.status) >= 2 && (
                                        <span className={`text-xs font-bold mt-3 inline-block px-2 py-1 rounded-md ${application.status === 'submitted' ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-400"}`}>
                                            {application.status === 'submitted' ? "PENDING EXAMINATION" : "COMPLETED"}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Step 3: Commission Visit */}
                            <div className={`relative flex gap-8 mb-12 ${application.type === 'transfer' ? 'opacity-40 grayscale' : ''}`}>
                                <div className={`z-10 w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${getStatusStep(application.status) >= 3 ? "bg-orange-500 text-white" : "bg-white border-2 border-slate-200 text-slate-300"}`}>
                                    {application.status === 'commission_visit' ? <Loader2 size={20} className="animate-spin" /> : <MapPin size={20} />}
                                </div>
                                <div className="flex-1">
                                    <h4 className={`font-bold text-lg ${getStatusStep(application.status) >= 3 ? "text-slate-900" : "text-slate-300"}`}>Technical Field Descent</h4>
                                    <p className="text-sm text-slate-500 leading-relaxed max-w-sm mt-1">
                                        {application.type === 'transfer'
                                            ? "Site verification of boundaries is typically waived for standard ownership transfers."
                                            : "Land Commission visit to verify boundaries and property development on site."}
                                    </p>
                                    {application.type === 'transfer' && (
                                        <span className="text-[10px] font-black text-slate-400 mt-3 inline-block bg-slate-100 px-2 py-1 rounded-md uppercase tracking-wider">Not Required for Transfers</span>
                                    )}
                                    {application.data?.visit_date && (
                                        <div className="mt-3 bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center gap-3">
                                            <Calendar size={14} className="text-slate-400" />
                                            <span className="text-xs font-bold text-slate-600">Visit Scheduled: {new Date(application.data.visit_date).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Step 4: Technical Validation (Cadastre) */}
                            <div className={`relative flex gap-8 mb-12 ${application.type === 'transfer' ? 'opacity-40 grayscale' : ''}`}>
                                <div className={`z-10 w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${getStatusStep(application.status) >= 4 ? "bg-purple-600 text-white" : "bg-white border-2 border-slate-200 text-slate-300"}`}>
                                    {application.status === 'technical_validation' ? <Loader2 size={20} className="animate-spin" /> : <ShieldCheck size={20} />}
                                </div>
                                <div className="flex-1">
                                    <h4 className={`font-bold text-lg ${getStatusStep(application.status) >= 4 ? "text-slate-900" : "text-slate-300"}`}>Cadastre Plan Certification</h4>
                                    <p className="text-sm text-slate-500 leading-relaxed max-w-sm mt-1">
                                        {application.type === 'transfer'
                                            ? "Final plan certification is verified during the Conservator review phase."
                                            : "Technical desk verification of georeferencing data and official cadastral plan issuance."}
                                    </p>
                                </div>
                            </div>

                            {/* Step 5: Opposition Period */}
                            <div className={`relative flex gap-8 mb-12 ${application.type === 'transfer' ? 'opacity-40 grayscale' : ''}`}>
                                <div className={`z-10 w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${getStatusStep(application.status) >= 5 ? "bg-blue-600 text-white" : "bg-white border-2 border-slate-200 text-slate-300"}`}>
                                    {application.status === 'opposition_period' ? <Megaphone size={20} className="animate-pulse" /> : <ShieldCheck size={20} />}
                                </div>
                                <div className="flex-1">
                                    <h4 className={`font-bold text-lg ${getStatusStep(application.status) >= 5 ? "text-slate-900" : "text-slate-300"}`}>Public Opposition Period</h4>
                                    <p className="text-sm text-slate-500 leading-relaxed max-w-sm mt-1">Legal notice published on the national transparency board for a mandatory 30-day monitoring phase.</p>
                                    {application.status === 'opposition_period' && (
                                        <Link href="/notices" className="mt-3 inline-flex items-center gap-2 text-blue-600 font-bold text-xs uppercase hover:underline">
                                            View Public Notice Board <ArrowRight size={14} />
                                        </Link>
                                    )}
                                </div>
                            </div>

                            {/* Step 6: Review */}
                            <div className="relative flex gap-8 mb-12">
                                <div className={`z-10 w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${getStatusStep(application.status) >= 6 ? "bg-teal-600 text-white" : "bg-white border-2 border-slate-200 text-slate-300"}`}>
                                    {application.status === 'under_review' ? <Loader2 size={20} className="animate-spin" /> : <Clock size={20} />}
                                </div>
                                <div className="flex-1">
                                    <h4 className={`font-bold text-lg ${getStatusStep(application.status) >= 6 ? "text-slate-900" : "text-slate-300"}`}>Conservator Final Review</h4>
                                    <p className="text-sm text-slate-500 leading-relaxed max-w-sm mt-1">Final legal verification of the boundary plan and clearance from the Regional Governor.</p>
                                </div>
                            </div>

                            {/* Step 7: Finalization */}
                            <div className="relative flex gap-8">
                                <div className={`z-10 w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${getStatusStep(application.status) >= 7 ? (application.status === 'approved' ? "bg-green-600 text-white" : "bg-red-600 text-white") : "bg-white border-2 border-slate-200 text-slate-300"}`}>
                                    {application.status === 'approved' ? <ShieldCheck size={20} /> : (application.status === 'rejected' ? <XCircle size={20} /> : <FileText size={20} />)}
                                </div>
                                <div className="flex-1">
                                    <h4 className={`font-bold text-lg ${getStatusStep(application.status) >= 7 ? "text-slate-900" : "text-slate-300"}`}>Digital Title Deed Issuance</h4>
                                    <p className="text-sm text-slate-500 leading-relaxed max-w-sm mt-1">Generation of the official digital deed with cryptographic seal. Access your certificate below upon approval.</p>
                                    {application.status === 'approved' ? (
                                        <div className="mt-4 space-y-4">
                                            <div className="p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-3">
                                                <div className="bg-green-600 text-white p-1.5 rounded-lg">
                                                    <ShieldCheck size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-green-900 font-black uppercase tracking-tighter">DEED ISSUED</p>
                                                    <p className="text-[10px] text-green-700 font-bold opacity-80 mt-0.5">SHA256: {application.related_parcel?.current_deed?.digital_seal_hash?.substring(0, 12)}...</p>
                                                </div>
                                            </div>
                                            <Link
                                                href={`/portal/owner/certificate/${application.related_parcel?.current_deed?.id}`}
                                                className="inline-flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                                            >
                                                Download Printable Deed
                                            </Link>
                                        </div>
                                    ) : application.status === 'rejected' ? (
                                        <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3">
                                            <XCircle size={18} className="text-red-600" />
                                            <p className="text-xs text-red-900 font-black uppercase tracking-tighter">APPLICATION DENIED</p>
                                        </div>
                                    ) : (
                                        <span className="text-xs font-bold text-slate-300 mt-3 inline-block bg-slate-50 px-2 py-1 rounded-md">CERTIFICATION</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
