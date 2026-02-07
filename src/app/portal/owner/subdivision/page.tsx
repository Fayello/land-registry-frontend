"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RegistryService } from "@/services/registry.service";
import { CaseService } from "@/services/case.service";
import { ArrowLeft, SplitSquareHorizontal, Building2, Send, FileCheck } from "lucide-react";
import Link from "next/link";

export default function Subdivision() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [properties, setProperties] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        propertyId: "",
        proposedLots: 2,
        reason: "",
    });

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const data = await RegistryService.getOwnerProperties();
                setProperties(data);
            } catch (e) {
                console.error(e);
            }
        };
        fetchProperties();
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.propertyId) return alert("Please select a property");

        setLoading(true);
        try {
            await CaseService.submitCase({
                type: "subdivision",
                related_parcel_id: properties.find(p => p.id === parseInt(formData.propertyId))?.parcel.id,
                data: {
                    proposed_lots: formData.proposedLots,
                    reason: formData.reason,
                    parent_deed_id: formData.propertyId,
                    checklist: {}
                }
            });

            alert("Subdivision request submitted for municipal review.");
            router.push("/portal/owner");
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Error submitting subdivision.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-4xl mx-auto">
                <Link href="/portal/owner" className="flex items-center text-slate-600 hover:text-slate-900 mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Link>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                    <div className="bg-indigo-900 p-8 text-white">
                        <h1 className="text-3xl font-bold flex items-center">
                            <SplitSquareHorizontal className="w-8 h-8 mr-3 text-indigo-400" />
                            Request Land Subdivision
                        </h1>
                        <p className="text-indigo-100 mt-2">
                            Apply for "Morcellement" to divide an existing title into multiple legal parcels.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {/* Property Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center">
                                <Building2 className="w-4 h-4 mr-1" /> Select Parent Property
                            </label>
                            <select
                                required
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all bg-white"
                                value={formData.propertyId}
                                onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                            >
                                <option value="">-- Choose a property --</option>
                                {properties.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.deed_number} - {p.parcel.locality} ({p.parcel.area_sq_meters} sqm)
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Proposed Number of Lots</label>
                                <input
                                    required
                                    type="number"
                                    min="2"
                                    max="50"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                                    value={formData.proposedLots}
                                    onChange={(e) => setFormData({ ...formData, proposedLots: parseInt(e.target.value) })}
                                />
                                <p className="text-xs text-slate-500">Must be at least 2 derived parcels.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Reason for Division</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Commercial Development, Family Partition"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex items-start">
                            <FileCheck className="w-5 h-5 text-amber-600 mr-3 mt-1 flex-shrink-0" />
                            <p className="text-sm text-amber-800">
                                <strong>Technical Requirement:</strong> A sworn surveyor plan showing the proposed boundaries must be submitted during the "Technical Validation" phase after this application is approved.
                            </p>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-indigo-700 text-white px-8 py-4 rounded-2xl font-bold flex items-center hover:bg-indigo-800 transition-all disabled:opacity-50 shadow-lg shadow-indigo-700/20"
                            >
                                {loading ? "Submitting..." : (
                                    <>
                                        Submit Subdivision Request
                                        <Send className="w-5 h-5 ml-2" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
