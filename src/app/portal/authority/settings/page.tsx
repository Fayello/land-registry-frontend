"use client";

import { Hammer, Shield, Lock, FileSignature, Key, Eye, EyeOff, Save, Bell, AlertTriangle, Settings2 } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
    const [showKey, setShowKey] = useState(false);

    return (
        <div className="text-slate-300">
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-teal-500/10 p-2 rounded-lg border border-teal-500/20">
                        <Hammer className="text-teal-500 w-5 h-5" />
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Authority Settings</h1>
                </div>
                <p className="text-slate-500 font-medium">Manage your official digital signature, official seals, and security preferences.</p>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Digital Signature Profile */}
                <div className="xl:col-span-2 space-y-8">
                    <div className="bg-slate-900/50 rounded-[40px] border border-slate-800 p-8 shadow-2xl backdrop-blur-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <FileSignature size={120} />
                        </div>

                        <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                            <Lock className="text-teal-500" />
                            Cryptographic Signature
                        </h2>

                        <div className="space-y-6 max-w-2xl">
                            <div className="p-6 bg-slate-950 rounded-3xl border border-slate-800">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Public Key Identity</p>
                                <div className="flex items-center justify-between gap-4">
                                    <code className="text-xs text-teal-500 font-mono break-all leading-relaxed">
                                        {showKey ? "rsa-sha256-AAAA-E231-98FF-B1B2-C3C4-D5D6-E7E8-F9G0-H1I2-J3K4-L5M6-N7O8-P9Q0" : "••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"}
                                    </code>
                                    <button
                                        onClick={() => setShowKey(!showKey)}
                                        className="p-2 text-slate-500 hover:text-white transition-colors"
                                    >
                                        {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4 pt-4">
                                <button className="flex-1 bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">
                                    Rotate Authority Key
                                </button>
                                <button className="flex-1 bg-teal-500 text-slate-950 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-teal-500/20">
                                    Download Registry Certificate
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Official Seal Mockup */}
                    <div className="bg-slate-900/50 rounded-[40px] border border-slate-800 p-8 shadow-2xl backdrop-blur-sm">
                        <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                            <Shield className="text-blue-500" />
                            Official Physical Seal Upload
                        </h2>
                        <div className="border-2 border-dashed border-slate-800 bg-slate-950/30 rounded-[32px] p-12 text-center group hover:border-teal-500/50 transition-all cursor-pointer">
                            <div className="bg-slate-800 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                <Settings2 className="text-slate-500 group-hover:text-teal-500" />
                            </div>
                            <p className="text-sm font-bold text-slate-400 group-hover:text-white transition-colors">Drag and drop your official seal scan (PNG/SVG)</p>
                            <p className="text-[10px] text-slate-600 font-bold uppercase mt-2">Maximum 5MB • Transparent Background Required</p>
                        </div>
                    </div>
                </div>

                {/* Side Controls */}
                <div className="space-y-8">
                    <div className="bg-slate-900/50 rounded-[40px] border border-slate-800 p-8 shadow-2xl backdrop-blur-sm">
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Security Notifications</h3>
                        <div className="space-y-4">
                            {[
                                { label: "Notify on New Assignment", icon: Bell },
                                { label: "Notify on Boundary Conflict", icon: AlertTriangle },
                                { label: "Two-Factor Auth Required", icon: Key },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-slate-950/30 rounded-2xl border border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <item.icon size={16} className="text-slate-500" />
                                        <span className="text-xs font-bold text-slate-400">{item.label}</span>
                                    </div>
                                    <div className="w-8 h-4 bg-teal-500 rounded-full cursor-pointer relative">
                                        <div className="absolute right-1 top-0.5 w-3 h-3 bg-white rounded-full"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-8 bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-[40px]">
                        <h4 className="text-red-500 font-black text-[10px] uppercase tracking-widest mb-2 flex items-center gap-2">
                            <AlertTriangle size={14} /> Critical Action
                        </h4>
                        <p className="text-xs text-red-500/80 font-medium mb-4">Temporarily suspend authority to process cases.</p>
                        <button className="w-full bg-red-500/10 border border-red-500/50 text-red-500 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
                            Maintenance Mode
                        </button>
                    </div>
                </div>
            </div>

            <footer className="mt-12 flex justify-between items-center">
                <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Version 2.4.0-Official • Build 98A</p>
                <button className="flex items-center gap-3 bg-white text-slate-950 px-10 py-4 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-teal-400 transition-all shadow-2xl">
                    <Save size={18} />
                    Save Security Profile
                </button>
            </footer>
        </div>
    );
}
