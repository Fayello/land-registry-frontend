"use client";
import { API_URL } from "@/config/api";

import { ShieldCheck, Lock, Key, Smartphone, AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function SecurityPage() {
    const [configs, setConfigs] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchConfig = async () => {
            const token = localStorage.getItem("token");
            try {
                const response = await fetch(`${API_URL}/api/admin/config`, {
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

    const updateConfig = async (key: string, value: string) => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${API_URL}/api/admin/config`, {
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
        }
    };

    if (loading) return null;

    const mfaEnabled = configs["mfa_enabled"] === "true";

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <Link href="/portal/admin" className="inline-flex items-center gap-2 text-slate-400 hover:text-teal-600 font-bold uppercase text-[10px] tracking-widest mb-4 transition-colors">
                    <ArrowLeft size={16} />
                    Back to Console
                </Link>
                <div className="flex items-center gap-3 text-teal-600 mb-2">
                    <ShieldCheck size={24} />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Infrastructure Defense</span>
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter">System Security</h1>
                <p className="text-slate-500 mt-2 max-w-xl leading-relaxed">Configure authentication protocols, session policies, and encryption standards for the Land Registry.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Auth Policy */}
                <div className="p-8 bg-white border border-slate-200 rounded-[32px] shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-teal-50 p-3 rounded-2xl text-teal-600">
                            <Lock size={24} />
                        </div>
                        <h3 className="font-black text-lg text-slate-900">Authentication Policy</h3>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div>
                                <p className="font-bold text-slate-900 text-sm">Two-Factor Authentication (2FA)</p>
                                <p className="text-xs text-slate-500 mt-1">Enforce 2FA for all Official Authority roles.</p>
                            </div>
                            <button
                                onClick={() => updateConfig("mfa_enabled", mfaEnabled ? "false" : "true")}
                                className={`w-12 h-6 rounded-full transition-colors relative ${mfaEnabled ? "bg-teal-500" : "bg-slate-300"}`}
                            >
                                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${mfaEnabled ? "left-7" : "left-1"}`}></div>
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div>
                                <p className="font-bold text-slate-900 text-sm">Session Timeout</p>
                                <p className="text-xs text-slate-500 mt-1">Auto-logout after inactivity ({configs["session_timeout"] || "15"}m).</p>
                            </div>
                            <span className="text-xs font-black bg-white px-3 py-1 rounded-lg border border-slate-200 text-slate-600">Active</span>
                        </div>
                    </div>
                </div>

                {/* Encryption Standards */}
                <div className="p-8 bg-white border border-slate-200 rounded-[32px] shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-purple-50 p-3 rounded-2xl text-purple-600">
                            <Key size={24} />
                        </div>
                        <h3 className="font-black text-lg text-slate-900">Cryptographic Standards</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                            <CheckIcon />
                            <span className="text-sm font-bold text-slate-600">AES-256 Data Encryption at Rest</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                            <CheckIcon />
                            <span className="text-sm font-bold text-slate-600">TLS 1.3 Strict Transport Security</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                            <CheckIcon />
                            <span className="text-sm font-bold text-slate-600">Argon2id Password Hashing</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Threat Monitor */}
            <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden">
                <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-red-500/20 p-3 rounded-2xl text-red-400 animate-pulse">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <h3 className="font-black text-lg">Active Threat Monitor</h3>
                            <p className="text-slate-400 text-sm">Real-time intrusion detection system status.</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-black text-emerald-400">Secure</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">System Status</p>
                    </div>
                </div>
                {/* Decorative Elements */}
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-teal-500/10 rounded-full blur-[80px]"></div>
            </div>
        </div>
    );
}

function CheckIcon() {
    return (
        <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </div>
    );
}
