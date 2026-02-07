"use client";
import { API_URL } from "@/config/api";

import { useState, useEffect } from "react";
import {
    Users,
    ShieldCheck,
    ShieldAlert,
    Activity,
    Shield,
    ArrowRight
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeRoles: 0,
        permissions: 0,
        lastAdminAction: "RBAC Matrix Sync"
    });

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("token");
            try {
                const [rolesRes, permsRes] = await Promise.all([
                    fetch(`${API_URL}/api/admin/roles`, { headers: { "Authorization": `Bearer ${token}` } }),
                    fetch(`${API_URL}/api/admin/permissions`, { headers: { "Authorization": `Bearer ${token}` } })
                ]);

                if (rolesRes.ok && permsRes.ok) {
                    const roles = await rolesRes.json();
                    const perms = await permsRes.json();
                    setStats(prev => ({
                        ...prev,
                        activeRoles: roles.length,
                        permissions: perms.length
                    }));
                }
            } catch (error) {
                console.error("Error fetching admin stats:", error);
            }
        };
        fetchData();
    }, []);

    const cards = [
        {
            label: "Role Matrix",
            value: stats.activeRoles,
            desc: "Custom Authority Groups",
            icon: ShieldCheck,
            color: "text-teal-600",
            bg: "bg-teal-50",
            link: "/portal/admin/roles"
        },
        {
            label: "System Permissions",
            value: stats.permissions,
            desc: "Granular Action Keys",
            icon: Activity,
            color: "text-purple-600",
            bg: "bg-purple-50",
            link: "/portal/admin/roles"
        },
        {
            label: "Active Users",
            value: "82",
            desc: "Across all stakeholders",
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50",
            link: "/portal/admin/users"
        }
    ];

    return (
        <div className="space-y-12">
            {/* Header */}
            <div>
                <div className="flex items-center gap-3 text-teal-600 mb-2">
                    <Shield size={24} />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Governance Hub</span>
                </div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Admin Control Center</h1>
                <p className="text-slate-500 mt-2 max-w-xl leading-relaxed">Oversee the National Land Registry's security framework, manage high-privilege roles, and audit system-wide authority actions.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {cards.map((card, i) => (
                    <Link href={card.link} key={i} className="group bg-white border border-slate-200 p-8 rounded-[40px] hover:shadow-xl hover:border-teal-200 transition-all shadow-sm">
                        <div className="flex justify-between items-start mb-6">
                            <div className={`${card.bg} ${card.color} p-4 rounded-3xl`}>
                                <card.icon size={24} />
                            </div>
                            <ArrowRight size={20} className="text-slate-300 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
                        </div>
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{card.label}</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-black text-slate-900">{card.value}</span>
                            <span className="text-xs text-slate-500 font-bold">{card.desc}</span>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Security Alert */}
            <div className="bg-white border border-slate-200 p-10 rounded-[48px] overflow-hidden relative shadow-sm">
                <div className="relative z-10 flex gap-10 items-center">
                    <div className="bg-teal-50 p-6 rounded-[32px] border border-teal-100">
                        <ShieldAlert size={40} className="text-teal-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Impenetrable Audit Trail</h2>
                        <p className="text-slate-500 max-w-2xl leading-relaxed font-medium">All role modifications and permission overrides are cryptographically logged. The Super Admin console enforces the highest level of integrity for the Cameroonian Land Registry infrastructure.</p>
                    </div>
                    <Link href="/portal/admin/audit" className="ml-auto bg-slate-900 text-white px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10">
                        View Audit Log
                    </Link>
                </div>
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 blur-[100px] rounded-full -mr-32 -mt-32"></div>
            </div>
        </div>
    );
}
