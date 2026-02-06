"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Repeat, UserPlus, FileCheck, Send, Building2 } from "lucide-react";
import Link from "next/link";

export default function TransferOwnership() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [properties, setProperties] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        propertyId: "",
        recipientEmail: "",
        recipientName: "",
        reason: "",
    });

    useEffect(() => {
        const token = localStorage.getItem("token");
        // Fetch real properties for the user
        const fetchProperties = async () => {
            try {
                const res = await fetch("http://localhost:3001/api/owner/properties", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await res.json();
                setProperties(Array.isArray(data) ? data : []);
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

        const token = localStorage.getItem("token");
        try {
            const response = await fetch("http://localhost:3001/api/cases/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    type: "transfer",
                    related_parcel_id: properties.find(p => p.id === parseInt(formData.propertyId))?.parcel.id,
                    data: {
                        recipient_email: formData.recipientEmail,
                        recipient_name: formData.recipientName,
                        reason: formData.reason,
                        original_deed_id: formData.propertyId,
                        checklist: {}
                    }
                }),
            });

            if (response.ok) {
                alert("Transfer request submitted! It will now be reviewed by the Ministry.");
                router.push("/portal/owner");
            } else {
                alert("Transfer submission failed.");
            }
        } catch (error) {
            console.error(error);
            alert("Error submitting transfer.");
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
                    <div className="bg-teal-900 p-8 text-white">
                        <h1 className="text-3xl font-bold flex items-center">
                            <Repeat className="w-8 h-8 mr-3 text-teal-400" />
                            Initiate Property Transfer
                        </h1>
                        <p className="text-teal-100 mt-2">
                            Securely transfer ownership of your registered land to another party.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {/* Property Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center">
                                <Building2 className="w-4 h-4 mr-1" /> Select Property to Transfer
                            </label>
                            <select
                                required
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 transition-all bg-white"
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
                                <label className="text-sm font-semibold text-slate-700 flex items-center">
                                    <UserPlus className="w-4 h-4 mr-1" /> Recipient Full Name
                                </label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Jean-Paul Biya"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 transition-all"
                                    value={formData.recipientName}
                                    onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Recipient Email / ID</label>
                                <input
                                    required
                                    type="email"
                                    placeholder="recipient@example.com"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 transition-all"
                                    value={formData.recipientEmail}
                                    onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Reason for Transfer (Optional)</label>
                            <textarea
                                rows={3}
                                placeholder="e.g. Sale, Inheritance, Donation..."
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 transition-all"
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            />
                        </div>

                        <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex items-start">
                            <FileCheck className="w-5 h-5 text-amber-600 mr-3 mt-1 flex-shrink-0" />
                            <p className="text-sm text-amber-800">
                                <strong>Legal Warning:</strong> By submitting this request, you acknowledge that you are the legal owner. The transfer is only finalized once the Ministry Conservator approves and signs the new deed.
                            </p>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-teal-700 text-white px-8 py-4 rounded-2xl font-bold flex items-center hover:bg-teal-800 transition-all disabled:opacity-50 shadow-lg shadow-teal-700/20"
                            >
                                {loading ? "Submitting..." : (
                                    <>
                                        Initiate Legal Transfer
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
