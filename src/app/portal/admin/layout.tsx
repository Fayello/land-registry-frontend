"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    ShieldCheck,
    Lock,
    LogOut,
    Loader2,
    Shield,
    Settings,
    UserCircle,
    Menu,
    X
} from "lucide-react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const [userName, setUserName] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false);

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
            const role = user.role.toLowerCase();
            // Strictly for ADMIN role for now
            if (role !== "admin") {
                router.replace(role === "owner" ? "/portal/owner" : "/portal/authority");
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
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    if (isAuthorized === false) return null;

    const navItems = [
        { label: "Admin Home", href: "/portal/admin", icon: LayoutDashboard },
        { label: "User Management", href: "/portal/admin/users", icon: Users },
        { label: "Roles & Permissions", href: "/portal/admin/roles", icon: ShieldCheck },
        { label: "System Security", href: "/portal/admin/security", icon: Lock },
        { label: "Settings", href: "/portal/admin/settings", icon: Settings },
    ];

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans selection:bg-teal-500/30 flex-col md:flex-row">
            {/* Mobile Header */}
            <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="bg-teal-600 p-1 rounded-md">
                        <Shield size={16} className="text-white" />
                    </div>
                    <span className="font-bold text-slate-900 text-sm tracking-tight">MINDAF.admin</span>
                </div>
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
                >
                    {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 flex flex-col 
                transition-transform duration-300 ease-in-out shadow-2xl md:shadow-none
                ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
                md:translate-x-0 md:fixed
            `}>
                <div className="p-8 border-b border-slate-100 hidden md:block">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="bg-teal-600 p-1.5 rounded-lg">
                            <Shield size={20} className="text-white" />
                        </div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tighter">MINDAF<span className="text-teal-600">.admin</span></h2>
                    </div>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] ml-1">Central Authority</p>
                </div>

                <div className="p-6 border-b border-slate-100 md:hidden flex items-center gap-3">
                    <div className="bg-teal-600 p-1.5 rounded-lg">
                        <Shield size={20} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-slate-900 tracking-tighter">MINDAF.admin</h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Navigation</p>
                    </div>
                </div>

                <div className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-4 px-6 py-4 rounded-[20px] transition-all duration-300 group ${isActive
                                    ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10 font-black"
                                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                    }`}
                            >
                                <item.icon size={20} className={isActive ? "text-white" : "group-hover:text-teal-600 transition-colors"} />
                                <span className="text-sm tracking-tight">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* Profile Section */}
                <div className="p-6 border-t border-slate-100">
                    <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex items-center gap-3 mb-6">
                        <div className="bg-gradient-to-br from-teal-500 to-emerald-600 p-2 rounded-xl text-white">
                            <UserCircle size={24} />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-black text-slate-900 truncate">{userName}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Super Admin</p>
                        </div>
                    </div>

                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-4 px-6 py-4 w-full rounded-[20px] transition-all duration-300 text-slate-500 hover:text-red-600 hover:bg-red-50 group"
                    >
                        <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
                        <span className="text-sm font-bold uppercase tracking-widest">Exit Console</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 md:ml-72 p-4 md:p-12 min-h-[calc(100vh-64px)] md:min-h-screen bg-slate-50 transition-all duration-300">
                <div className="w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
