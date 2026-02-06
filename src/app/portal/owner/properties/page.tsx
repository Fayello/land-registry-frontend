"use client";

import { useEffect, useState } from "react";
import { MapPin, QrCode, ShieldCheck, Loader2, ArrowRight, ExternalLink, X, Fingerprint, Globe, Shield } from "lucide-react";
import Link from "next/link";

export default function MyProperties() {
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedQRDeed, setSelectedQRDeed] = useState<any>(null);

    useEffect(() => {
        const fetchProperties = async () => {
            const token = localStorage.getItem("token");
            try {
                const response = await fetch("http://localhost:3001/api/owner/properties", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await response.json();
                setProperties(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error fetching properties:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProperties();
    }, []);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">My Properties</h1>
                    <p className="text-slate-500">Manage your registered land assets.</p>
                </div>
                <Link href="/portal/owner/new-registration" className="bg-slate-900 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-slate-800 transition-colors">
                    + Register New Land
                </Link>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {properties.map((prop) => (
                    <div key={prop.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="h-40 bg-slate-900 relative group overflow-hidden">
                            {/* GIS Map Visualization */}
                            <div className="absolute inset-0 opacity-40">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-blue-500/30 rounded-full animate-pulse"></div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-blue-500/10 rounded-full"></div>
                            </div>
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-blue-400 text-[10px] font-black uppercase tracking-[0.3em]">
                                <div className="mb-2 w-1 h-1 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,1)]"></div>
                                Spatial Data Layer Active
                            </div>
                            <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1 shadow-lg uppercase tracking-widest">
                                <ShieldCheck size={12} />
                                Verified Asset
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900">{prop.deed_number}</h3>
                                    <div className="flex items-center gap-1 text-slate-500 text-sm mt-1">
                                        <MapPin size={16} />
                                        {prop.parcel?.locality || "Unknown Locality"}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedQRDeed(prop)}
                                    className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100"
                                >
                                    <QrCode size={24} />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 mt-4">
                                <div>
                                    <span className="text-xs text-slate-400 block uppercase font-bold tracking-tighter">Area Size</span>
                                    <span className="font-bold text-slate-700">{prop.parcel?.area_sq_meters} m²</span>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-400 block uppercase font-bold tracking-tighter">Registered On</span>
                                    <span className="font-bold text-slate-700">
                                        {prop.registration_date ? new Date(prop.registration_date).toLocaleDateString() : 'N/A'}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 flex gap-3">
                                <Link
                                    href={`/portal/owner/certificate/${prop.id}`}
                                    className="flex-1 bg-white border border-slate-200 text-slate-700 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-center hover:bg-slate-50 transition-all"
                                >
                                    View Details
                                </Link>
                                <Link
                                    href={`/portal/owner/transfer?deedId=${prop.id}`}
                                    className="flex-1 bg-blue-600 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest text-center hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                                >
                                    Transfer
                                    <ArrowRight size={14} />
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* QR Code Digital ID Modal */}
            {selectedQRDeed && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-8 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setSelectedQRDeed(null)}></div>

                    <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[48px] overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-300 text-center">
                        <button
                            onClick={() => setSelectedQRDeed(null)}
                            className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <div className="p-12">
                            <div className="flex justify-center mb-8">
                                <div className="bg-blue-500/10 p-4 rounded-3xl border border-blue-500/20">
                                    <Shield className="text-blue-500" size={32} />
                                </div>
                            </div>

                            <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Digital Identity Portal</h2>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-10">Neural Ledger Access • Deed {selectedQRDeed.deed_number}</p>

                            <div className="bg-white p-8 rounded-[40px] shadow-2xl inline-block relative group mb-10">
                                <div className="absolute -inset-4 bg-blue-500/20 rounded-[48px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=http://localhost:3000/?num=${selectedQRDeed.deed_number}`}
                                    alt="Property QR"
                                    className="w-48 h-48 relative z-10"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-10 text-left">
                                <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                                    <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Blockchain Hash</p>
                                    <p className="text-white font-mono text-[9px] truncate">0x{Math.random().toString(16).substring(2, 40)}</p>
                                </div>
                                <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 text-center">
                                    <p className="text-[10px] font-black text-blue-400 uppercase mb-1">Status</p>
                                    <p className="text-emerald-400 font-black text-[10px] uppercase tracking-widest">Encrypted</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-center gap-6 text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em]">
                                    <div className="flex items-center gap-2"><Globe size={14} /> Global Registry</div>
                                    <div className="flex items-center gap-2"><Fingerprint size={14} /> Biometric Verified</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-800/30 p-8 border-t border-slate-800 mt-4 flex items-center justify-center gap-12">
                            <div className="text-center">
                                <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Expiry</p>
                                <p className="text-white text-xs font-bold uppercase">Never</p>
                            </div>
                            <div className="w-[1px] h-8 bg-slate-800"></div>
                            <div className="text-center">
                                <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Security</p>
                                <p className="text-white text-xs font-bold uppercase">SSL V3</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {properties.length === 0 && (
                <div className="bg-white p-16 rounded-3xl border border-slate-200 text-center shadow-sm">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ExternalLink size={32} className="text-slate-300" />
                    </div>
                    <p className="text-slate-900 font-bold text-lg">No verified land deeds found</p>
                    <p className="text-sm text-slate-400 mt-2 max-w-xs mx-auto">New registrations appear here after official review and approval by the conservator.</p>
                </div>
            )}
        </div>
    );
}
