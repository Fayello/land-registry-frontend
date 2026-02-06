"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Building2, FileText, Settings, LogOut, Loader2 } from "lucide-react";

export default function OwnerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

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
        <div className="flex min-h-screen bg-slate-50 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col fixed h-full transition-all duration-300 shadow-xl z-20">
                <div className="p-6 border-b border-slate-800">
                    <h2 className="text-xl font-bold text-white tracking-tight">LandRegistry<span className="text-blue-500">.gov</span></h2>
                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">Owner Portal</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/portal/owner" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-white transition-colors group">
                        <LayoutDashboard size={20} className="text-slate-500 group-hover:text-blue-400" />
                        <span>Overview</span>
                    </Link>
                    <Link href="/portal/owner/properties" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-white transition-colors group">
                        <Building2 size={20} className="text-slate-500 group-hover:text-blue-400" />
                        <span>My Properties</span>
                    </Link>
                    <Link href="/portal/owner/applications" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-white transition-colors group">
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
            <main className="flex-1 ml-64 p-8 min-h-screen">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
