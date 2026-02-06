"use client";
export const dynamic = 'force-dynamic';
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function VerifyContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const num = searchParams.get("num");
        if (num) {
            router.replace(`/?num=${num}`);
        } else {
            router.replace("/");
        }
    }, [router, searchParams]);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="animate-pulse text-slate-400 font-black uppercase tracking-widest text-sm">
                Redirecting to Primary Verification Portal...
            </div>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyContent />
        </Suspense>
    );
}
