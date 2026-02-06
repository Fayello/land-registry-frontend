import React from "react";
import { CheckCircle, Circle, MapPin, Search, Megaphone, ShieldCheck, FileText } from "lucide-react";

interface Step {
    id: string;
    label: string;
    description: string;
    icon: React.ElementType;
    statuses: string[];
}

const STEPS: Step[] = [
    {
        id: "submission",
        label: "Dossier Submission",
        description: "Initial intake and administrative vetting",
        icon: FileText,
        statuses: ["submitted", "pending_payment"]
    },
    {
        id: "technical",
        label: "Technical Audit",
        description: "Survey Plan and Boundary Certification",
        icon: MapPin,
        statuses: ["pending_commission", "commission_visit", "technical_validation"]
    },
    {
        id: "opposition",
        label: "Opposition Period",
        description: "30-day monitoring for boundary disputes",
        icon: Megaphone,
        statuses: ["opposition_period"]
    },
    {
        id: "governance",
        label: "Governor Review",
        description: "Final administrative and regional unblocking",
        icon: Search,
        statuses: ["governor_approval"]
    },
    {
        id: "sealing",
        label: "Legal Sealing",
        description: "Digital stamping and deed issuance",
        icon: ShieldCheck,
        statuses: ["approved"]
    }
];

interface PipelineStepperProps {
    currentStatus: string;
    isTransfer?: boolean;
}

export default function PipelineStepper({ currentStatus, isTransfer = false }: PipelineStepperProps) {
    // For transfers, skip technical and opposition usually
    const relevantSteps = isTransfer
        ? STEPS.filter(s => ["submission", "governance", "sealing"].includes(s.id))
        : STEPS;

    const getCurrentStepIndex = () => {
        return relevantSteps.findIndex(step => step.statuses.includes(currentStatus));
    };

    const currentIndex = getCurrentStepIndex();

    return (
        <div className="w-full flex items-center justify-between gap-2 px-4 py-8 bg-white border-b border-slate-100 overflow-x-auto">
            {relevantSteps.map((step, index) => {
                const isCompleted = index < currentIndex || currentStatus === "approved";
                const isActive = index === currentIndex;
                const Icon = step.icon;

                return (
                    <React.Fragment key={step.id}>
                        <div className="flex flex-col items-center flex-1 min-w-[120px] text-center group">
                            <div className={`relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 mb-3 ${isCompleted ? "bg-teal-500 text-white shadow-lg shadow-teal-500/20" :
                                isActive ? "bg-slate-900 text-teal-400 shadow-xl shadow-slate-900/10 scale-110" :
                                    "bg-slate-50 text-slate-300 border border-slate-100"
                                }`}>
                                <Icon size={20} className={isActive ? "animate-pulse" : ""} />
                                {isCompleted && (
                                    <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                                        <CheckCircle size={14} className="text-teal-500 fill-white" />
                                    </div>
                                )}
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? "text-slate-900" : "text-slate-400"
                                }`}>
                                {step.label}
                            </span>
                            <p className="text-[9px] text-slate-400 font-medium px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {step.description}
                            </p>
                        </div>
                        {index < relevantSteps.length - 1 && (
                            <div className="h-0.5 flex-1 max-w-[40px] bg-slate-100 rounded-full overflow-hidden shrink-0">
                                <div className={`h-full bg-teal-500 transition-all duration-1000 ${isCompleted ? "w-full" : "w-0"
                                    }`}></div>
                            </div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}
