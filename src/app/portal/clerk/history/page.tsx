"use client";

import { useEffect, useState } from "react";
import { History, FileText, Search, Download, Filter, Calendar, Loader2, MapPin } from "lucide-react";
import { IngestionService } from "@/services/ingestion.service";

export default function IngestionHistory() {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await IngestionService.getHistory();
                setHistory(data);
            } catch (error) {
                console.error("Failed to fetch history:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const filteredHistory = history.filter(item =>
        item.deed_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.owner?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.parcel?.parcel_number.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Ingestion History</h2>
                    <p className="text-slate-500 font-medium">Global log of physical-to-digital migrations</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 flex items-center gap-3 shadow-sm hover:border-blue-500/30 transition-all">
                        <Search size={18} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search Deed / Parcel / Owner..."
                            className="bg-transparent outline-none text-sm font-medium w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="bg-white p-3 rounded-2xl border border-slate-200 text-slate-400 hover:text-blue-600 transition-all shadow-sm">
                        <Filter size={20} />
                    </button>
                </div>
            </header>

            <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-24 text-slate-400">
                        <Loader2 className="animate-spin mb-4" size={48} />
                        <p className="font-bold uppercase tracking-widest text-[10px]">Accessing Universal Ledger...</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50">
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Deed ID</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Twin (GIS)</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Digitized Date</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Legal Owner</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredHistory.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-24 text-center text-slate-400 font-medium">
                                        No ingested records found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredHistory.map((row) => (
                                    <tr key={row.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                    <FileText size={16} />
                                                </div>
                                                <div>
                                                    <span className="font-black text-slate-900 block">{row.deed_number}</span>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Vol {row.vol} / Folio {row.folio}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-slate-700">{row.parcel?.parcel_number}</span>
                                                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                                                    <MapPin size={10} /> {row.parcel?.locality} • {row.parcel?.area_sq_meters}m²
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-sm font-medium text-slate-400 italic">
                                            {new Date(row.registration_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/10">
                                                {row.owner?.full_name}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="text-slate-300 hover:text-blue-600 transition-all">
                                                <Download size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="flex justify-center pt-8">
                <button className="bg-slate-50 px-8 py-3 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100">
                    Load Archive Buffers
                </button>
            </div>
        </div>
    );
}
