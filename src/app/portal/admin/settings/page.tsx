"use client";

import { Settings, Save, ArrowLeft, Globe, Megaphone } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function SettingsPage() {
    const [configs, setConfigs] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchConfig = async () => {
            const token = localStorage.getItem("token");
            try {
                const response = await fetch("http://localhost:3001/api/admin/config", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (response.ok) {
                    setConfigs(await response.json());
                }
            } catch (error) {
                console.error("Error fetching config:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchConfig();
    }, []);

    const handleUpdate = async (key: string, value: string) => {
        setSaving(true);
        const token = localStorage.getItem("token");
        try {
            const response = await fetch("http://localhost:3001/api/admin/config", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ key, value })
            });
            if (response.ok) {
                setConfigs(prev => ({ ...prev, [key]: value }));
            }
        } catch (error) {
            console.error("Error updating config:", error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return null;

    const maintenanceMode = configs["maintenance_mode"] === "true";

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <Link href="/portal/admin" className="inline-flex items-center gap-2 text-slate-400 hover:text-teal-600 font-bold uppercase text-[10px] tracking-widest mb-4 transition-colors">
                    <ArrowLeft size={16} />
                    Back to Console
                </Link>
                <div className="flex items-center gap-3 text-teal-600 mb-2">
                    <Settings size={24} />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">System Config</span>
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Global Settings</h1>
                <p className="text-slate-500 mt-2 max-w-xl leading-relaxed">Manage application-wide parameters, maintenance windows, and public registry defaults.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-[40px] p-10 shadow-sm max-w-3xl">
                <div className="space-y-8">
                    {/* Public Registry Section */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <Megaphone className="text-teal-600" size={20} />
                            <h3 className="font-black text-slate-900 uppercase tracking-wide text-sm">Public Notice Board</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Notice Duration (Days)</label>
                                <select
                                    value={configs["notice_duration"] || "30"}
                                    onChange={(e) => handleUpdate("notice_duration", e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:outline-none focus:border-teal-500 transition-colors"
                                >
                                    <option value="15">15 Days (Expedited)</option>
                                    <option value="30">30 Days (Standard)</option>
                                    <option value="45">45 Days (Extended)</option>
                                    <option value="90">90 Days (Rural)</option>
                                </select>
                                <p className="text-[10px] text-slate-400 mt-2 font-medium">Time before an uncontested notice can be validated.</p>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-slate-100"></div>

                    {/* System Status Section */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <Globe className="text-teal-600" size={20} />
                            <h3 className="font-black text-slate-900 uppercase tracking-wide text-sm">Platform Availability</h3>
                        </div>
                        <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <div>
                                <p className="font-bold text-slate-900">Maintenance Mode</p>
                                <p className="text-xs text-slate-500 mt-1">Suspend all public access for updates.</p>
                            </div>
                            <button
                                onClick={() => handleUpdate("maintenance_mode", maintenanceMode ? "false" : "true")}
                                className={`w-14 h-8 rounded-full transition-colors relative ${maintenanceMode ? "bg-red-500" : "bg-slate-300"}`}
                            >
                                <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-transform ${maintenanceMode ? "left-7" : "left-1"}`}></div>
                            </button>
                        </div>
                    </div>

                    <div className="pt-6">
                        <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                            {saving ? "Synchronizing with Identity Server..." : "Configuration Live"}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
