"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Building2, FileText, Settings, LogOut, Loader2, Menu, X } from "lucide-react";

export default function OwnerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.replace("/login"); // Use replace to avoid back-button loops
            setIsAuthorized(false);
        } else {
            setIsAuthorized(true);
        }
    }, [router]);

    const handleSignOut = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
    };

    // Prevent ANY rendering of sidebar or content until auth status is confirmed
    if (isAuthorized === null) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (isAuthorized === false) return null;

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans flex-col md:flex-row">
            {/* Mobile Header */}
            <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold tracking-tight">LandRegistry<span className="text-blue-500">.gov</span></h2>
                </div>
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
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
                fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col 
                transition-transform duration-300 ease-in-out shadow-xl
                ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
                md:translate-x-0 md:fixed
            `}>
                <div className="p-6 border-b border-slate-800 hidden md:block">
                    <h2 className="text-xl font-bold text-white tracking-tight">LandRegistry<span className="text-blue-500">.gov</span></h2>
                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">Owner Portal</p>
                </div>

                <div className="p-6 border-b border-slate-800 md:hidden">
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Owner Portal Navigation</p>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <Link
                        href="/portal/owner"
                        onClick={() => setSidebarOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-white transition-colors group"
                    >
                        <LayoutDashboard size={20} className="text-slate-500 group-hover:text-blue-400" />
                        <span>Overview</span>
                    </Link>
                    <Link
                        href="/portal/owner/properties"
                        onClick={() => setSidebarOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-white transition-colors group"
                    >
                        <Building2 size={20} className="text-slate-500 group-hover:text-blue-400" />
                        <span>My Properties</span>
                    </Link>
                    <Link
                        href="/portal/owner/applications"
                        onClick={() => setSidebarOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-white transition-colors group"
                    >
                        <FileText size={20} className="text-slate-500 group-hover:text-blue-400" />
                        <span>Applications</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl hover:bg-red-900/20 text-slate-400 hover:text-red-400 transition-colors"
                    >
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-4 md:p-8 min-h-[calc(100vh-64px)] md:min-h-screen transition-all duration-300">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
