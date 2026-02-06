"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
    LayoutDashboard,
    FileSearch,
    Settings,
    LogOut,
    Loader2,
    Shield,
    GanttChartSquare,
    Database,
    Hammer,
    UserCircle
} from "lucide-react";

export default function ConservatorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const [userName, setUserName] = useState("");
    const [userRoleName, setUserRoleName] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        const userStr = localStorage.getItem("user");

        if (!token) {
            router.replace("/login");
            setIsAuthorized(false);
            return;
        }

        if (userStr) {
            const user = JSON.parse(userStr);
            setUserName(user.name);
            setUserRoleName(user.roleName || user.role);
            const role = user.role.toLowerCase();
            const isAuthorizedAuthority = ["conservator", "cadastre", "surveyor", "notary", "admin"].includes(role);

            if (!isAuthorizedAuthority) {
                router.replace(role === "owner" ? "/portal/owner" : "/");
                setIsAuthorized(false);
                return;
            }
        }

        setIsAuthorized(true);
    }, [router]);

    const handleSignOut = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
    };

    if (isAuthorized === null) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
            </div>
        );
    }

    if (isAuthorized === false) return null;

    const navItems = [
        { label: "Console Home", href: "/portal/authority", icon: LayoutDashboard },
        { label: "Examination Queue", href: "/portal/authority/queue", icon: FileSearch },
        { label: "Registry Params", href: "/portal/authority/parameters", icon: Database, roles: ["conservator", "admin"] },
        { label: "Authority Settings", href: "/portal/authority/settings", icon: Hammer, roles: ["conservator", "admin"] },
    ];

    const filteredNavItems = navItems.filter(item => {
        if (!item.roles) return true;
        const role = userRoleName?.toLowerCase();
        return item.roles.includes(role);
    });

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans selection:bg-teal-500/20">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-slate-200 flex flex-col fixed h-full z-30 shadow-2xl shadow-slate-200/50">
                <div className="p-8 border-b border-slate-100">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="bg-teal-600 p-1.5 rounded-xl shadow-lg shadow-teal-600/20">
                            <Shield size={20} className="text-white" />
                        </div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tighter">MINDAF<span className="text-teal-600">.gov</span></h2>
                    </div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] ml-1">{(userRoleName || "Authority").toUpperCase()} Console</p>
                </div>

                <div className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
                    {filteredNavItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${isActive
                                    ? "bg-slate-900 text-white shadow-xl shadow-slate-900/10 font-black"
                                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                    }`}
                            >
                                <item.icon size={20} className={isActive ? "text-teal-400" : "text-slate-400 group-hover:text-teal-600 transition-colors"} />
                                <span className="text-sm tracking-tight">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* Profile Section */}
                <div className="p-6 border-t border-slate-100">
                    <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex items-center gap-3 mb-6">
                        <div className="bg-gradient-to-br from-teal-500 to-emerald-600 p-2 rounded-xl text-white shadow-lg">
                            <UserCircle size={24} />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-black text-slate-900 truncate">{userName}</p>
                            <p className="text-[10px] text-teal-600 font-black uppercase tracking-widest">
                                {userRoleName === "Cadastre" ? "Lead Technical Officer" :
                                    userRoleName === "Surveyor" ? "Field Geometer" :
                                        userRoleName === "Conservator" ? "Registrar of Titles" :
                                            userRoleName}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-4 px-6 py-4 w-full rounded-2xl transition-all duration-300 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all group"
                    >
                        <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
                        <span className="text-sm font-black uppercase tracking-widest">Terminate Session</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 ml-72 p-12 min-h-screen">
                <div className="max-w-[1600px] mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
