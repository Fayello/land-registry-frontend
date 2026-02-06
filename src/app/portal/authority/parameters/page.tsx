"use client";

import { Database, Shield, Save, Info, Settings2, Sliders, Calculator, FileCheck } from "lucide-react";

export default function ParametersPage() {
    return (
        <div className="text-slate-300">
            <header className="mb-12">
                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-blue-500/10 p-2 rounded-lg border border-blue-500/20">
                        <Database className="text-blue-500 w-5 h-5" />
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Registry Parameters</h1>
                </div>
                <p className="text-slate-500 font-medium">Configure system-wide land governance rules and fee structures.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Fee Configuration */}
                <div className="bg-slate-900/50 rounded-[40px] border border-slate-800 p-8 shadow-2xl backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-white flex items-center gap-3">
                            <Calculator className="text-teal-500" />
                            Revenue & Fees
                        </h2>
                        <span className="text-[10px] font-black text-teal-500 bg-teal-500/10 px-3 py-1 rounded-full uppercase tracking-widest border border-teal-500/20">Active Policy</span>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Title Deed Registration Fee (Base)</label>
                            <div className="flex items-center gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-700">
                                <span className="text-slate-500 font-bold">XAF</span>
                                <input type="number" defaultValue="25000" className="bg-transparent border-none focus:outline-none text-white font-bold w-full" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Transfer Tax Percentage (%)</label>
                            <div className="flex items-center gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-700">
                                <span className="text-slate-500 font-bold">%</span>
                                <input type="number" defaultValue="5" className="bg-transparent border-none focus:outline-none text-white font-bold w-full" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Validation Rules */}
                <div className="bg-slate-900/50 rounded-[40px] border border-slate-800 p-8 shadow-2xl backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-white flex items-center gap-3">
                            <FileCheck className="text-blue-500" />
                            Validation Logic
                        </h2>
                        <button className="text-blue-500 hover:text-white transition-colors">
                            <Settings2 size={20} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {[
                            { label: "Automatic GIS Overlap Detection", active: true },
                            { label: "Enforce National ID Card Verification", active: true },
                            { label: "Require Notary Digital Signature", active: false },
                            { label: "Check Property Tax Clearance APIs", active: true },
                        ].map((rule, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group">
                                <span className="text-sm font-bold text-slate-400 group-hover:text-white transition-colors">{rule.label}</span>
                                <div className={`w-10 h-5 rounded-full relative transition-colors ${rule.active ? 'bg-teal-500' : 'bg-slate-800'}`}>
                                    <div className={`absolute top-1 w-3 h-3 rounded-full bg-white shadow-lg transition-all ${rule.active ? 'right-1' : 'left-1'}`}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <footer className="mt-12 flex justify-end">
                <button className="flex items-center gap-3 bg-white text-slate-950 px-10 py-4 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-teal-400 transition-all active:scale-[0.98] shadow-2xl">
                    <Save size={18} />
                    Commit System Changes
                </button>
            </footer>
        </div>
    );
}
