"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Shield,
    Printer,
    ArrowLeft,
    Loader2,
    CheckCircle2,
    MapPin,
    Maximize2,
    Award,
    Hash,
    Building2,
    Calendar,
    Stamp,
    FileText,
    User,
    Locate
} from "lucide-react";
import Link from "next/link";

export default function CertificatePage() {
    const params = useParams();
    const router = useRouter();
    const [deed, setDeed] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDeed = async () => {
            const token = localStorage.getItem("token");
            try {
                const response = await fetch(`http://localhost:3001/api/owner/deeds/${params.deedId}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (!response.ok) throw new Error("Unauthorized or not found");
                const data = await response.json();
                setDeed(data);
            } catch (error) {
                console.error("Error fetching deed:", error);
                router.replace("/portal/owner");
            } finally {
                setLoading(false);
            }
        };

        if (params.deedId) fetchDeed();
    }, [params.deedId, router]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-100 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
            </div>
        );
    }

    if (!deed) return null;

    return (
        <div className="min-h-screen bg-slate-200/50 p-8 print:p-0 print:bg-white selection:bg-teal-500/10">
            {/* Control Bar */}
            <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center print:hidden">
                <Link href={`/portal/owner/properties`} className="flex items-center gap-2 text-slate-600 hover:text-slate-950 font-bold text-sm transition-colors bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200">
                    <ArrowLeft size={16} /> Close Preview
                </Link>
                <div className="flex gap-4">
                    <button
                        onClick={handlePrint}
                        className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 active:scale-95"
                    >
                        <Printer size={16} /> Print Official Copy
                    </button>
                </div>
            </div>

            {/* The Deed Document (Page 1) */}
            <div className="max-w-[850px] mx-auto bg-white shadow-[0_0_80px_rgba(0,0,0,0.1)] border-[1px] border-slate-300 p-16 relative overflow-hidden print:shadow-none print:border-none print:p-8 mb-8">

                {/* Official Border */}
                <div className="absolute inset-4 border-2 border-slate-200 pointer-events-none"></div>
                <div className="absolute inset-6 border-[1px] border-slate-100 pointer-events-none"></div>

                {/* Header Section */}
                <div className="relative z-10 flex justify-between items-start mb-16">
                    <div className="text-center space-y-1">
                        <p className="font-bold text-xs uppercase tracking-tight">République du Cameroun</p>
                        <p className="text-[10px] italic text-slate-500">Paix - Travail - Patrie</p>
                        <div className="h-0.5 w-12 bg-slate-900 mx-auto my-2"></div>
                        <p className="font-bold text-xs uppercase tracking-tight">Republic of Cameroon</p>
                        <p className="text-[10px] italic text-slate-500">Peace - Work - Fatherland</p>
                    </div>

                    <div className="relative w-24 h-24">
                        <div className="absolute inset-0 border-[3px] border-slate-900/10 rounded-full flex items-center justify-center">
                            <Shield size={40} className="text-slate-900/10" />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-40">
                            <Stamp size={80} className="text-slate-900" />
                        </div>
                    </div>
                </div>

                {/* Office Identification */}
                <div className="text-center space-y-2 mb-24 relative z-10">
                    <p className="text-sm font-black uppercase tracking-widest border-b border-dotted border-slate-300 inline-block pb-1">
                        CONSERVATION FONCIERE DE : <span className="text-lg ml-2">{deed.department?.toUpperCase() || "MFOU"}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em]">Registry of Landed Property of</p>
                </div>

                {/* Main Title */}
                <div className="text-center space-y-6 mb-24 relative z-10">
                    <h1 className="text-4xl font-black tracking-tighter uppercase text-slate-900 drop-shadow-sm">Copie du Titre Foncier</h1>
                    <h2 className="text-2xl font-bold uppercase text-slate-500 tracking-widest">Copy of Land Certificate</h2>
                </div>

                {/* Numbering and Register Entry */}
                <div className="max-w-md mx-auto text-center space-y-12 relative z-10">
                    <div className="flex justify-center items-end gap-4">
                        <div className="text-right">
                            <p className="text-sm font-bold">N°</p>
                            <p className="text-[10px] text-slate-400">No.</p>
                        </div>
                        <p className="text-6xl font-black tracking-tighter border-b-4 border-slate-900 pb-2 px-8">{deed.deed_number}</p>
                    </div>

                    <div className="space-y-4">
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Inséré au livre foncier</p>
                        <p className="text-[10px] text-slate-300 uppercase -mt-3">Entered in the land register</p>

                        <div className="grid grid-cols-2 gap-8 pt-4">
                            <div className="text-center">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Vol.</p>
                                <p className="text-xl font-black text-slate-900 border-b border-slate-200 pb-1">{deed.vol || "155"}</p>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Folio</p>
                                <p className="text-xl font-black text-slate-900 border-b border-slate-200 pb-1">{deed.folio || "197"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Seal Area */}
                <div className="mt-32 pt-12 border-t border-slate-100 flex justify-between items-end relative z-10">
                    <div className="space-y-4">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 max-w-[200px]">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Authentification Digitale</p>
                            <code className="text-[8px] text-teal-600 font-mono break-all leading-tight">{deed.digital_seal_hash?.substring(0, 32)}...</code>
                        </div>
                    </div>
                    <div className="text-center space-y-2 pb-8 pr-8">
                        <div className="opacity-10 mb-[-40px]">
                            <Stamp size={120} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest">Le Conservateur Foncier</p>
                        <p className="text-[10px] italic text-slate-400">The Registrar of Land Property</p>
                    </div>
                </div>

                {/* Watermark Logo */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
                    <Shield size={500} />
                </div>
            </div>

            {/* Bordereau Analytique (Page 2 - Functional Abstract) */}
            <div className="max-w-[850px] mx-auto bg-white shadow-[0_0_80px_rgba(0,0,0,0.1)] border-[1px] border-slate-300 p-16 relative overflow-hidden print:shadow-none print:border-none print:p-8 break-before-page">
                <div className="absolute inset-4 border border-slate-100 pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="text-center mb-12">
                        <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900">Bordereau Analytique</h3>
                        <p className="text-[10px] text-slate-400 uppercase tracking-[0.3em]">Abstract of the Certificate</p>
                        <div className="h-0.5 w-24 bg-slate-900 mx-auto mt-4"></div>
                    </div>

                    <div className="space-y-12">
                        {/* Section 1: Property Description */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 border-b border-slate-900 pb-2">
                                <div className="bg-slate-900 text-white p-1 rounded-md">
                                    <Locate size={16} />
                                </div>
                                <h4 className="text-sm font-black uppercase tracking-widest">1. Désignation et Description</h4>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-serif italic text-slate-700">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase not-italic">Nature of Property</span>
                                    <p className="text-sm leading-relaxed">Immeuble urbain bâti, à usage d'habitation.</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-slate-400 uppercase not-italic">Surface Area</span>
                                    <p className="text-sm leading-relaxed">{deed.parcel?.area_sq_meters} mètres carrés.</p>
                                </div>
                                <div className="space-y-1 col-span-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase not-italic">Situation / Location</span>
                                    <p className="text-sm leading-relaxed">{deed.parcel?.locality}, Département de la {deed.department || "MEFOU ET AFAMBA"}.</p>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Proprietor Info */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 border-b border-slate-900 pb-2">
                                <div className="bg-slate-900 text-white p-1 rounded-md">
                                    <User size={16} />
                                </div>
                                <h4 className="text-sm font-black uppercase tracking-widest">2. Etat Civil du Propriétaire</h4>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                <p className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">
                                    {deed.owner?.full_name || "OFFICIAL OWNER"}
                                </p>
                                <p className="text-sm font-serif italic text-slate-600 leading-relaxed">
                                    Inscrit au Registre National des Personnes Physiques, domicilié à {deed.owner?.address || "Yaoundé"}, agissant en qualité de plein propriétaire du lot mentionné.
                                </p>
                            </div>
                        </div>

                        {/* Section 3: Legal Basis */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 border-b border-slate-900 pb-2">
                                <div className="bg-slate-900 text-white p-1 rounded-md">
                                    <FileText size={16} />
                                </div>
                                <h4 className="text-sm font-black uppercase tracking-widest">3. Mentions et Charges</h4>
                            </div>

                            <div className="font-serif text-sm text-slate-600 leading-relaxed space-y-4">
                                <p>Déposé au Livre Foncier le {new Date(deed.registration_date).toLocaleDateString()}.</p>
                                <p>Suivant procès-verbal de bornage de Morcellement Judiciaire clos et arrêté le {new Date(deed.registration_date).toLocaleDateString()} par le Géomètre Expert Assermenté du Cadastre.</p>
                                <div className="p-4 bg-teal-50 border border-teal-100 rounded-xl flex items-center gap-3">
                                    <CheckCircle2 size={18} className="text-teal-600" />
                                    <p className="text-xs text-teal-900 font-bold uppercase">Aucune Charge ou Hypothèque Inscrite à ce jour.</p>
                                </div>
                            </div>
                        </div>

                        {/* Signatures */}
                        <div className="pt-12 grid grid-cols-2 gap-12 text-center">
                            <div className="space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Security Signature</p>
                                <div className="h-16 flex items-center justify-center opacity-20">
                                    <Stamp size={64} />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Le Conservateur</p>
                                <div className="font-serif italic text-2xl text-slate-900 pt-4 underline underline-offset-8">
                                    {deed.conservator?.full_name?.split(' ')[0] || "Albert"}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @media print {
                    body { background: white; }
                    .print-hidden { display: none; }
                    .break-before-page { page-break-before: always; }
                }
            `}</style>
        </div>
    );
}
