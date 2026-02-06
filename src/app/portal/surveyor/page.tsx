"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function SurveyorRedirect() {
    const router = useRouter();

    useEffect(() => {
        // Unified Authority Console handles Surveyors, Cadastre, and Conservators
        router.replace("/portal/authority");
    }, [router]);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
            <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest">
                Redirecting to Unified Authority Console...
            </p>
        </div>
    );
}
