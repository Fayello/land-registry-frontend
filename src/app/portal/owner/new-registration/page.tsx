"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, MapPin, Maximize2, Send } from "lucide-react";
import Link from "next/link";

export default function NewRegistration() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        locality: "",
        area: "",
        parcel_number: "",
        boundary_json: "",
    });

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/login");
        }
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const token = localStorage.getItem("token");
        try {
            const response = await fetch("http://localhost:3001/api/cases/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    type: "new_registration",
                    data: {
                        locality: formData.locality,
                        area: parseFloat(formData.area),
                        parcel_number: formData.parcel_number,
                        boundary: formData.boundary_json ? JSON.parse(formData.boundary_json) : null,
                        checklist: {}
                    }
                }),
            });

            if (response.ok) {
                alert("Application submitted successfully!");
                router.push("/portal/owner");
            } else {
                alert("Submission failed.");
            }
        } catch (error) {
            console.error(error);
            alert("Error submitting application.");
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
                    <div className="bg-slate-900 p-8 text-white">
                        <h1 className="text-3xl font-bold flex items-center">
                            <FileText className="w-8 h-8 mr-3 text-blue-400" />
                            New Land Registration
                        </h1>
                        <p className="text-slate-400 mt-2">
                            Submit a digital record of your property for government verification and deed issuance.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 flex items-center">
                                    <MapPin className="w-4 h-4 mr-1" /> Locality / City
                                </label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Bastos, Yaoundé"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                                    value={formData.locality}
                                    onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 flex items-center">
                                    <Maximize2 className="w-4 h-4 mr-1" /> Surface Area (sqm)
                                </label>
                                <input
                                    required
                                    type="number"
                                    placeholder="e.g. 500"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                                    value={formData.area}
                                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Survey Reference / Parcel ID</label>
                            <input
                                required
                                type="text"
                                placeholder="e.g. YDE-2024-SURVEY-883"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                                value={formData.parcel_number}
                                onChange={(e) => setFormData({ ...formData, parcel_number: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Boundary Data (GeoJSON Polygon)</label>
                            <textarea
                                rows={4}
                                placeholder='{"type": "Polygon", "coordinates": [[[lon, lat], ...]]}'
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all bg-slate-50"
                                value={formData.boundary_json}
                                onChange={(e) => setFormData({ ...formData, boundary_json: e.target.value })}
                            />
                            <p className="text-xs text-slate-500 italic">
                                Note: In a production environment, this would be captured via a map drawing tool.
                            </p>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold flex items-center hover:bg-slate-800 transition-all disabled:opacity-50"
                            >
                                {loading ? "Processing..." : (
                                    <>
                                        Submit for Ministry Review
                                        <Send className="w-5 h-5 ml-2" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-6">
                    <h3 className="text-blue-900 font-bold mb-2">What happens next?</h3>
                    <ol className="list-decimal list-inside text-blue-800 text-sm space-y-2">
                        <li>Your application is assigned to a Ministry Clerk for document verification.</li>
                        <li>A Conservator will review the legal standing and geometric boundaries.</li>
                        <li>Upon approval, a Digital Land Deed will be issued and appear in your portal.</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}
