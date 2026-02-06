"use client";

import { CheckCircle, Circle, AlertCircle } from "lucide-react";

interface ChecklistProps {
    items: { [key: string]: boolean };
    onChange: (key: string, value: boolean) => void;
    readOnly?: boolean;
}

export const REQUIREMENTS: { [key: string]: string } = {
    identity_verified: "Identity Document Verified",
    survey_valid: "Survey Plan / GIS Validated",
    tax_cleared: "Property Tax Clearance Confirmed",
    no_overlap: "No Boundary Overlap Detected",
    notary_seal: "Notary Authority Seal Verified", // For Mutations
    field_report: "Official Field Report Filed"    // For Registrations
};

export default function ExaminationChecklist({ items, onChange, readOnly = false, caseType = "new_registration", permissions = [], phase = "all" }: ChecklistProps & { caseType?: string, permissions?: string[], phase?: "vetting" | "technical" | "all" }) {
    let relevantKeys = caseType === "transfer"
        ? ["identity_verified", "tax_cleared", "notary_seal", "no_overlap"]
        : ["identity_verified", "tax_cleared", "survey_valid", "field_report", "no_overlap"];

    // Phase filtering for "Fluid" workflow
    if (phase === "vetting") {
        relevantKeys = relevantKeys.filter(k => ["identity_verified", "tax_cleared", "notary_seal"].includes(k));
    } else if (phase === "technical") {
        relevantKeys = relevantKeys.filter(k => ["survey_valid", "field_report", "no_overlap"].includes(k));
    }

    // SOD Filtering: Cadastre only sees Technical keys
    if (permissions.includes("cases.validate_technical")) {
        relevantKeys = relevantKeys.filter(k => ["survey_valid", "no_overlap", "field_report"].includes(k));
    }

    // SOD Filtering: Conservator sees everything but focused on Legal/Checklist
    // (In a more complex app, we might subtract technical if Cadastre has already greenlit)

    return (
        <div className="space-y-4">
            <h3 className="font-bold text-slate-400 uppercase text-[10px] tracking-widest mb-2 px-1">Authority Checklist</h3>
            {relevantKeys.map((key) => {
                const label = REQUIREMENTS[key];
                const isChecked = items[key] || false;
                return (
                    <div
                        key={key}
                        className={`flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${isChecked
                            ? "bg-teal-500/10 border-teal-500/30 text-teal-400"
                            : "bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700"
                            }`}
                        onClick={() => {
                            const isTechnicalKey = ["survey_valid", "no_overlap", "field_report"].includes(key);
                            const hasTechnicalPerm = permissions.includes("cases.validate_technical");
                            const hasLegalPerm = !hasTechnicalPerm; // Simplified for this context

                            const canEdit = !readOnly && (
                                (isTechnicalKey && hasTechnicalPerm) ||
                                (!isTechnicalKey && hasLegalPerm)
                            );

                            if (canEdit) onChange(key, !isChecked);
                            else alert(`SOD Policy: Only ${isTechnicalKey ? 'Cadaster' : 'Conservator'} can verify this item.`);
                        }}
                    >
                        {isChecked ? (
                            <CheckCircle size={18} className="text-teal-500" />
                        ) : (
                            <Circle size={18} className="text-slate-700" />
                        )}
                        <span className="text-xs font-bold uppercase tracking-tight">{label}</span>
                    </div>
                );
            })}
        </div>
    );
}
