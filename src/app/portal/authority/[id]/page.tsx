"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle, XCircle, FileText, Shield, AlertTriangle, Loader2, Download, ArrowLeft, MapPin, User, Calendar, Search, Megaphone, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CaseService } from "@/services/case.service";
import ExaminationChecklist from "../components/ExaminationChecklist";
import PipelineStepper from "../components/PipelineStepper";

export default function ReviewPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [status, setStatus] = useState("loading"); // loading, pending, approved, creating, error
    const [caseData, setCaseData] = useState<any>(null);
    const [checklist, setChecklist] = useState<{ [key: string]: boolean }>({});
    const [result, setResult] = useState<any>(null);
    const [visitDate, setVisitDate] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const [userPermissions, setUserPermissions] = useState<string[]>([]);
    const [userRoleName, setUserRoleName] = useState<string>("");

    const fetchCaseDetails = useCallback(async () => {
        try {
            const data = await CaseService.getApplicationById(params.id);
            setCaseData(data);
            setChecklist(data.data?.checklist || {});

            if (data.status === "approved") {
                setStatus("approved");
                setResult({
                    deed_number: `DEED-AUTO-GENERATED`,
                    seal_hash: data.digital_seal_hash || "SIGNATURE-VERIFIED-0x8f43..."
                });
            } else {
                setStatus("pending");
            }
        } catch (error) {
            console.error(error);
            setStatus("error");
        }
    }, [params.id]);

    useEffect(() => {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            const user = JSON.parse(userStr);
            setUserPermissions(user.permissions || []);
            setUserRoleName(user.roleName || user.role);
        }
        fetchCaseDetails();
    }, [fetchCaseDetails]);

    const toggleItem = (key: string, value: boolean) => {
        setChecklist(prev => ({ ...prev, [key]: value }));
    };

    const isComplete = () => {
        const isTransfer = caseData?.type === "transfer";
        const keys = isTransfer
            ? ["identity_verified", "tax_cleared", "notary_seal", "no_overlap"]
            : ["identity_verified", "tax_cleared", "survey_valid", "field_report", "no_overlap"];

        const checklistDone = keys.every(k => checklist[k]);

        // SOD: Registrations and Subdivisions REQUIRE a formal Cadastre stamp
        if (!isTransfer && !caseData?.data?.cadastre_validated_at) {
            return false;
        }

        return checklistDone;
    };

    const handleApprove = async () => {
        if (!isComplete() && caseData.status !== "governor_approval") {
            alert("Please complete the examination checklist first.");
            return;
        }

        setStatus("creating");
        const user = JSON.parse(localStorage.getItem("user") || "{}");

        try {
            const data = await CaseService.performAction(params.id, 'approve', {
                checklist,
                conservator_id: user.id
            }, "POST");

            setStatus("approved");
            setResult({
                deed_number: data.case?.related_parcel?.parcel_number || "DEED-ISSUED",
                seal_hash: "SHA256-SIGN-OFF-SUCCESS-" + Date.now().toString(16)
            });
        } catch (e: any) {
            alert(e.message);
            setStatus("pending");
        }
    };

    const handleReject = async () => {
        const reason = prompt("Enter the reason for rejection:");
        if (!reason) return;

        setActionLoading(true);
        try {
            await CaseService.performAction(params.id, 'reject', { reason }, "PUT");
            await fetchCaseDetails();
            alert("Case officially rejected.");
        } catch (e: any) {
            alert(e.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleScheduleVisit = async () => {
        if (!visitDate) return alert("Please select a visit date");
        setActionLoading(true);
        try {
            await CaseService.performAction(params.id, 'schedule-visit', { visitDate }, "PUT");
            await fetchCaseDetails();
        } catch (e: any) {
            alert(e.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleStartNotice = async () => {
        setActionLoading(true);
        try {
            await CaseService.performAction(params.id, 'start-notice', {}, "PUT");
            await fetchCaseDetails();
        } catch (e: any) {
            alert(e.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleValidateTechnical = async () => {
        setActionLoading(true);
        try {
            await CaseService.performAction(params.id, 'validate-technical', {}, "PUT");
            await fetchCaseDetails();
        } catch (e: any) {
            alert(e.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleTechnicalQuery = async () => {
        const reason = prompt("Enter specific technical discrepancies (e.g., 'Boundary overlap at NW pillar'):");
        if (!reason) return;

        setActionLoading(true);
        try {
            await CaseService.performAction(params.id, 'technical-query', { reason }, "PUT");
            await fetchCaseDetails();
            alert("Technical query issued to field surveyor.");
        } catch (e: any) {
            alert(e.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleUploadReport = async () => {
        setActionLoading(true);
        try {
            await CaseService.performAction(params.id, 'upload-report', { reportUrl: `https://ipfs.io/ipfs/QmReport${params.id}` }, "PUT");
            await fetchCaseDetails();
        } catch (e: any) {
            alert(e.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleRequestGovernor = async () => {
        setActionLoading(true);
        try {
            await CaseService.performAction(params.id, 'request-governor-approval', {}, "PUT");
            await fetchCaseDetails();
        } catch (e: any) {
            alert(e.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleAuthorizeCommission = async () => {
        setActionLoading(true);
        try {
            await CaseService.performAction(params.id, 'authorize-commission', { checklist }, "PUT");
            await fetchCaseDetails();
            alert("Administrative vetting complete. Field commission authorized.");
        } catch (e: any) {
            alert(e.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDownload = (filename: string) => {
        alert(`Downloading ${filename}... (Simulated)`);
    };

    if (status === "loading") {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-slate-900 animate-spin" />
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
                <AlertTriangle className="w-12 h-12 text-red-500" />
                <h2 className="text-xl font-bold">Case Not Found</h2>
                <Link href="/portal/authority" className="text-blue-600 font-bold hover:underline">Back to Dashboard</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-8 flex justify-center selection:bg-teal-500/20">
            <div className="max-w-7xl w-full bg-white rounded-[48px] shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-100 flex flex-col lg:flex-row h-full">

                {/* Lateral Review Panel */}
                <div className="lg:w-[400px] bg-slate-50/50 border-r border-slate-100 p-8 flex flex-col overflow-y-auto">
                    <Link href="/portal/authority" className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors mb-8 font-black text-[10px] uppercase tracking-widest">
                        <ArrowLeft size={16} /> Back to Desk
                    </Link>

                    <div className="mb-10">
                        <div className="flex items-center justify-between mb-4">
                            <h1 className="text-2xl font-black text-slate-900 tracking-tighter flex items-center gap-3 uppercase">
                                {userPermissions.includes("cases.validate_technical") ? <MapPin className="text-teal-600 animate-pulse" size={28} /> :
                                    userPermissions.includes("cases.upload_report") ? <Search className="text-blue-600 animate-pulse" size={28} /> :
                                        <Shield className="text-slate-900 animate-pulse" size={28} />}
                                FILE #{caseData.id}
                            </h1>
                        </div>
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${caseData.status === 'approved' ? 'bg-green-500 border-green-600/20 text-white' :
                            caseData.status === 'rejected' ? 'bg-red-500 border-red-600/20 text-white' :
                                'bg-white border-slate-200 text-slate-600'
                            }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${caseData.status === 'approved' || caseData.status === 'rejected' ? 'bg-white' : 'bg-teal-500 animate-ping'}`}></span>
                            {caseData.status.replace('_', ' ')}
                        </div>
                        <div className="mt-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            JURISDICTION: <span className="text-slate-900">{userRoleName}</span>
                        </div>
                        {caseData.status === 'rejected' && caseData.data?.rejection_reason && (
                            <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-2xl">
                                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Official Rejection Note</p>
                                <p className="text-xs text-red-900 font-medium">{caseData.data.rejection_reason}</p>
                            </div>
                        )}
                        {caseData.data?.technical_query && (
                            <div className="mt-4 p-4 bg-orange-50 border border-orange-100 rounded-2xl">
                                <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">Technical Query feedback</p>
                                <p className="text-xs text-orange-900 font-medium">{caseData.data.technical_query}</p>
                            </div>
                        )}
                    </div>

                    <div className="space-y-8 mb-10 pb-8 border-b border-slate-100">
                        <section>
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Applicant Profile</h3>
                            <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <div className="bg-white p-2 rounded-xl text-slate-400 shadow-sm">
                                    <User size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-slate-900">{caseData.initiator?.full_name}</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase">{caseData.initiator?.email}</p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Parcel Specifications</h3>
                            <div className="space-y-3 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400 font-black uppercase tracking-wider">Locality</span>
                                    <span className="text-slate-900 font-black tracking-tight">{caseData.data?.locality || "Unspecified"}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400 font-black uppercase tracking-wider">{caseData.type === 'subdivision' ? 'Parent Area' : 'Area'}</span>
                                    <span className="text-slate-900 font-black tracking-tight">{caseData.data?.area || caseData.data?.total_area || "0"} m²</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400 font-black uppercase tracking-wider">{caseData.type === 'subdivision' ? 'Parent Parcel' : 'Parcel ID'}</span>
                                    <span className="text-teal-600 font-mono font-black tracking-tighter bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                                        {caseData.data?.parcel_number || caseData.related_parcel?.parcel_number || "PENDING"}
                                    </span>
                                </div>
                                {caseData.type === 'subdivision' && caseData.data?.new_lots && (
                                    <div className="pt-4 border-t border-slate-50 space-y-3">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Proposed Lot Splits</p>
                                        {caseData.data.new_lots.map((lot: any) => (
                                            <div key={lot.id} className="flex justify-between items-center text-[10px] bg-slate-50 p-2 rounded-lg border border-slate-100">
                                                <span className="font-bold text-slate-600">LOT {lot.id}</span>
                                                <span className="font-black text-slate-900">{lot.area} m²</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </section>

                        <section>
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Verification Evidence</h3>
                            <div className="space-y-3">
                                <div className="group flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:border-blue-200 transition-all shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-50 p-2 rounded-lg"><FileText size={18} className="text-blue-600" /></div>
                                        <span className="text-xs text-slate-700 font-black tracking-tight">Technical_Plan.pdf</span>
                                    </div>
                                    <button
                                        onClick={() => handleDownload("Technical_Plan.pdf")}
                                        className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                                    >
                                        <Download size={16} />
                                    </button>
                                </div>

                                {!userPermissions.includes("cases.validate_technical") && (
                                    <>
                                        <div className="group flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:border-teal-200 transition-all shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-teal-50 p-2 rounded-lg"><Shield size={18} className="text-teal-600" /></div>
                                                <span className="text-xs text-slate-700 font-black tracking-tight">Tax_Clearance.pdf</span>
                                            </div>
                                            <button
                                                onClick={() => handleDownload("Tax_Clearance.pdf")}
                                                className="p-2 text-slate-400 hover:text-teal-600 transition-colors"
                                            >
                                                <Download size={16} />
                                            </button>
                                        </div>
                                        <div className="group flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 hover:border-purple-200 transition-all shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-purple-50 p-2 rounded-lg"><User size={18} className="text-purple-600" /></div>
                                                <span className="text-xs text-slate-700 font-black tracking-tight">Identity_Proof.pdf</span>
                                            </div>
                                            <button
                                                onClick={() => handleDownload("Identity.pdf")}
                                                className="p-2 text-slate-400 hover:text-purple-600 transition-colors"
                                            >
                                                <Download size={16} />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </section>
                    </div>

                    <div className="flex-1 space-y-6">
                        <ExaminationChecklist
                            items={checklist}
                            onChange={toggleItem}
                            readOnly={caseData.status === 'approved' || status === 'creating' || caseData.status === 'rejected'}
                            caseType={caseData.type}
                            permissions={userPermissions}
                            phase="all"
                        />
                    </div>

                    <div className="mt-10 p-5 bg-orange-500/10 border border-orange-500/20 rounded-3xl text-[10px] text-orange-400 font-bold uppercase tracking-widest leading-relaxed flex gap-3">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <p>Affixing digital seal constitutes a binding legal verification under Article 45 of Registry Law.</p>
                    </div>
                </div>

                {/* Main Action View */}
                <div className="flex-1 bg-white flex flex-col h-full overflow-hidden">
                    <PipelineStepper currentStatus={caseData.status} isTransfer={caseData.type === 'transfer'} />

                    <div className="flex-1 p-12 overflow-y-auto">
                        <header className="flex justify-between items-start mb-12">
                            <div className="flex-1 max-w-2xl">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-200">
                                        Jurisdiction: {caseData.status === 'technical_validation' ? 'Cadastre' : 'Conservator'}
                                    </span>
                                    {caseData.data?.cadastre_validated_at && (
                                        <span className="px-3 py-1 bg-teal-500/10 text-teal-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-teal-500/20 flex items-center gap-1">
                                            <ShieldCheck size={12} /> Technical Validated
                                        </span>
                                    )}
                                </div>
                                <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4 uppercase">
                                    {userPermissions.includes("cases.validate_technical") ? "Technical Plan Audit" :
                                        userPermissions.includes("cases.upload_report") ? "Field Geometer Portal" :
                                            "Administrative Review"}
                                </h2>
                                <div className="bg-slate-50 border-l-4 border-slate-900 p-6 rounded-r-3xl">
                                    <p className="text-slate-600 font-medium text-sm leading-relaxed mb-0">
                                        {caseData.status === 'technical_validation' ?
                                            "Perform boundary integrity checks and verify GPS markers against the national grid." :
                                            caseData.status === 'submitted' ?
                                                "Verify identity documents and tax status before scheduling the multi-party commission." :
                                                caseData.status === 'opposition_period' ?
                                                    "Monitoring the 30-day public notice phase. No boundary disputes reported yet." :
                                                    "Final legal certification and issuance of the digital title deed."}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Audit Score</p>
                                <p className={`text-sm font-black uppercase tracking-widest ${isComplete() || caseData.status === "governor_approval" ? "text-teal-600" : "text-slate-300"}`}>
                                    {isComplete() || caseData.status === "governor_approval" ? "Certified Ready" : "Review In Progress"}
                                </p>
                            </div>
                        </header>

                        {/* Fluid Handoff Tip */}
                        <div className="mb-10 flex items-center gap-4 bg-teal-500/5 p-5 rounded-3xl border border-teal-500/10">
                            <div className="w-10 h-10 bg-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/20 shrink-0">
                                <Search size={18} className="text-white" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-0.5">Fluid Handoff Guide</p>
                                <p className="text-sm text-slate-600 font-medium">
                                    {caseData.status === "technical_validation" && userPermissions.includes("cases.validate_technical")
                                        ? "Once validated, this will automatically flow to the Public Notice phase."
                                        : caseData.status === "submitted" && userPermissions.includes("cases.upload_report")
                                            ? "Submitting the Field Report will hand this off to the Cadastre Technical Desk."
                                            : caseData.status === "opposition_period"
                                                ? "Awaiting the 30-day legal period before handoff to the Regional Governor."
                                                : "Final verification active. Approval will issue the digital deed to the owner."}
                                </p>
                            </div>
                        </div>

                        <div className="flex-1 flex items-center justify-center py-10">
                            {status === 'approved' ? (
                                <div className="bg-white p-12 rounded-[20px] shadow-2xl shadow-green-500/5 border-[12px] border-slate-100 aspect-[21/29.7] w-full max-w-md relative overflow-hidden flex flex-col text-slate-900 animate-in zoom-in-95 duration-700">
                                    <div className="absolute inset-0 border-[24px] border-slate-50/50 pointer-events-none"></div>
                                    <div className="text-center font-serif mb-12 relative">
                                        <h3 className="text-2xl font-black uppercase tracking-tighter leading-none mb-1">Republic of Cameroon</h3>
                                        <p className="text-xs font-bold uppercase opacity-60">Ministry of State Property</p>
                                        <div className="h-1 w-12 bg-slate-900 mx-auto mt-4"></div>
                                    </div>

                                    <div className="space-y-6 font-serif flex-1">
                                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Official Reference</p>
                                            <p className="text-lg font-bold tracking-tighter">LAND-DEED-{caseData.id}-2024</p>
                                        </div>

                                        <div className="space-y-4 pt-4">
                                            <div className="flex justify-between border-b border-slate-100 pb-2">
                                                <span className="text-xs font-bold uppercase opacity-40">Registered Owner</span>
                                                <span className="text-sm font-bold">{caseData.initiator?.full_name}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-slate-100 pb-2">
                                                <span className="text-xs font-bold uppercase opacity-40">Local Authority</span>
                                                <span className="text-sm font-bold">{caseData.data?.locality}</span>
                                            </div>
                                            <div className="flex justify-between border-b border-slate-100 pb-2">
                                                <span className="text-xs font-bold uppercase opacity-40">Certified Area</span>
                                                <span className="text-sm font-bold underline decoration-double">{caseData.data?.area} SQ. METERS</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-12 text-center relative">
                                        <div className="absolute right-0 bottom-0 opacity-10">
                                            <Shield size={120} />
                                        </div>
                                        <div className="mb-4">
                                            <p className="text-[8px] font-black uppercase tracking-widest mb-1">Conservator's Digital Seal</p>
                                            <p className="text-[10px] font-mono break-all">{result?.seal_hash}</p>
                                        </div>
                                        <div className="bg-green-600 text-white p-4 rounded-2xl inline-flex items-center gap-2 shadow-lg">
                                            <CheckCircle size={20} />
                                            <span className="font-black text-xs uppercase tracking-widest">Officially Signed & Sealed</span>
                                        </div>
                                    </div>
                                </div>
                            ) : caseData.status === 'rejected' ? (
                                <div className="text-center space-y-6 max-w-sm animate-in fade-in zoom-in-95 duration-500">
                                    <div className="w-24 h-24 bg-red-600/10 rounded-[32px] flex items-center justify-center mx-auto shadow-2xl border border-red-500/20">
                                        <XCircle size={40} className="text-red-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2 uppercase tracking-tighter">File Rejected / Queried</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">This application has been formally rejected. Check the lateral panel for the specific administrative reason.</p>
                                </div>
                            ) : (
                                <div className="text-center space-y-6 max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {caseData.status === "submitted" && (
                                        <>
                                            <div className="w-24 h-24 bg-blue-600/10 rounded-[32px] flex items-center justify-center mx-auto shadow-2xl border border-blue-500/20">
                                                <Search size={40} className="text-blue-500" />
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900 mb-2">Initial Document Vetting</h3>
                                            <p className="text-slate-500 text-sm leading-relaxed">
                                                {caseData.type === 'subdivision'
                                                    ? "Verify parent deed authenticity and tax status before authorizing the land split commission."
                                                    : "Perform the first administrative check on identity and tax clearance documents before launching the field commission."}
                                            </p>
                                            {caseData.type === 'subdivision' && (
                                                <div className="mt-8 grid grid-cols-2 gap-4">
                                                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Parent Plot</p>
                                                        <p className="text-sm font-black text-slate-900">{caseData.data?.total_area} m²</p>
                                                    </div>
                                                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Target Lots</p>
                                                        <p className="text-sm font-black text-slate-900">{caseData.data?.new_lots?.length} Splits</p>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="mt-12 text-left">
                                                <ExaminationChecklist
                                                    items={checklist}
                                                    onChange={toggleItem}
                                                    readOnly={caseData.status === 'approved' || status === 'creating' || caseData.status === 'rejected'}
                                                    caseType={caseData.type}
                                                    permissions={userPermissions}
                                                    phase="vetting"
                                                />
                                            </div>

                                            {userPermissions.includes("cases.seal") && (
                                                <div className="mt-8">
                                                    <button
                                                        onClick={handleAuthorizeCommission}
                                                        disabled={actionLoading || !checklist.identity_verified || !checklist.tax_cleared}
                                                        className="w-full bg-blue-600 text-white px-8 py-4 rounded-3xl font-black text-xs uppercase hover:bg-blue-500 transition-all shadow-xl disabled:opacity-50 disabled:bg-slate-200 disabled:text-slate-400"
                                                    >
                                                        Authorize Field Commission
                                                    </button>
                                                    {(!checklist.identity_verified || !checklist.tax_cleared) && (
                                                        <p className="mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">
                                                            Complete identity and tax verification to proceed
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )}
                                    {caseData.status === "pending_commission" && (
                                        <>
                                            <div className="w-24 h-24 bg-teal-600/10 rounded-[32px] flex items-center justify-center mx-auto shadow-2xl border border-teal-500/20">
                                                <MapPin size={40} className="text-teal-500" />
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900 mb-2">Commission Visit Scheduling</h3>
                                            <p className="text-slate-500 text-sm leading-relaxed">Coordinate the multi-party site descent with the Surveyors and local authorities to verify physical boundaries.</p>
                                        </>
                                    )}
                                    {caseData.status === "commission_visit" && (
                                        <>
                                            <div className="w-24 h-24 bg-orange-600/10 rounded-[32px] flex items-center justify-center mx-auto shadow-2xl border border-orange-500/20">
                                                <FileText size={40} className="text-orange-500" />
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900 mb-2">Post-Visit Technical Audit</h3>
                                            <p className="text-slate-500 text-sm leading-relaxed">Awaiting the official report from the Surveyor to be filed in the technical desk.</p>
                                        </>
                                    )}
                                    {caseData.status === "technical_validation" && (
                                        <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                                            <div className="bg-slate-50 p-12 rounded-[48px] border border-slate-100 relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                                    <MapPin size={120} className="text-teal-600" />
                                                </div>
                                                <div className="relative z-10">
                                                    <div className="flex items-center gap-4 text-teal-600 mb-6">
                                                        <div className="bg-white p-3 rounded-2xl shadow-xl"><MapPin size={32} /></div>
                                                        <h3 className="text-3xl font-black tracking-tighter uppercase">Physical Boundary Scan</h3>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-8 mb-8">
                                                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-xl">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">North Coordinate</p>
                                                            <p className="text-xl font-mono font-black text-slate-900">3.8482° N</p>
                                                        </div>
                                                        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-xl">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">East Coordinate</p>
                                                            <p className="text-xl font-mono font-black text-slate-900">11.5021° E</p>
                                                        </div>
                                                    </div>

                                                    <div className="p-8 bg-slate-900 rounded-[32px] aspect-video relative flex items-center justify-center group/map overflow-hidden shadow-2xl">
                                                        <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/11.5021,3.8482,16,0/600x400?access_token=pk.placeholder')] bg-cover opacity-60"></div>
                                                        <div className="relative z-10 text-center">
                                                            <div className="w-16 h-16 bg-teal-500/20 border border-teal-400/50 rounded-full flex items-center justify-center animate-ping absolute -inset-0 m-auto"></div>
                                                            <MapPin size={48} className="text-teal-400 drop-shadow-[0_0_15px_rgba(45,212,191,0.5)]" />
                                                        </div>
                                                        <div className="absolute bottom-6 right-6 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700 text-[10px] font-black text-teal-400 uppercase tracking-widest">
                                                            Live Parcel Overlay
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div
                                                    className={`p-8 rounded-[32px] border transition-all cursor-pointer shadow-sm hover:shadow-xl ${checklist.no_overlap
                                                        ? "bg-green-500/5 border-green-500/20"
                                                        : "bg-white border-slate-100"
                                                        }`}
                                                    onClick={() => userPermissions.includes("cases.validate_technical") && toggleItem('no_overlap', !checklist.no_overlap)}
                                                >
                                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Boundary Consistency</h4>
                                                    <div className={`flex items-center gap-3 ${checklist.no_overlap ? "text-green-600" : "text-slate-300"}`}>
                                                        <CheckCircle size={20} className={checklist.no_overlap ? "" : "opacity-20"} />
                                                        <span className="text-sm font-black">{checklist.no_overlap ? "Zero Overlap Detected" : "Verify Boundary Logic"}</span>
                                                    </div>
                                                </div>
                                                <div
                                                    className={`p-8 rounded-[32px] border transition-all cursor-pointer shadow-sm hover:shadow-xl ${checklist.survey_valid
                                                        ? "bg-blue-500/5 border-blue-500/20"
                                                        : "bg-white border-slate-100"
                                                        }`}
                                                    onClick={() => userPermissions.includes("cases.validate_technical") && toggleItem('survey_valid', !checklist.survey_valid)}
                                                >
                                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Markers Verified</h4>
                                                    <div className={`flex items-center gap-3 ${checklist.survey_valid ? "text-blue-600" : "text-slate-300"}`}>
                                                        <CheckCircle size={20} className={checklist.survey_valid ? "" : "opacity-20"} />
                                                        <span className="text-sm font-black">{checklist.survey_valid ? "4 Permanent Pillars Found" : "Verify Site Pillars"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {caseData.status === "opposition_period" && (
                                        <>
                                            <div className="w-24 h-24 bg-blue-600/20 rounded-[32px] flex items-center justify-center mx-auto shadow-2xl border border-blue-400/30 animate-pulse">
                                                <Megaphone size={40} className="text-blue-400" />
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900 mb-2">Legal Opposition Period</h3>
                                            <p className="text-slate-500 text-sm leading-relaxed tracking-tight">The 30-day monitoring phase is active. Community notified via the Public Notice Board.</p>
                                        </>
                                    )}
                                    {caseData.status === "governor_approval" && (
                                        <>
                                            <div className="w-24 h-24 bg-teal-500/20 rounded-[32px] flex items-center justify-center mx-auto shadow-2xl border border-teal-400/30">
                                                <ShieldCheck size={40} className="text-teal-400" />
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900 mb-2">Awaiting Governor Clearance</h3>
                                            <p className="text-slate-500 text-sm leading-relaxed">Final unblocking by the Regional Governor is required before the Digital Seal can be affixed.</p>
                                        </>
                                    )}
                                </div>
                            )}

                            {!status.includes("approved") && caseData.status !== 'rejected' && (
                                <div className="mt-12 w-full max-w-xl">
                                    {caseData.status === "pending_commission" && (
                                        <div className="bg-slate-800/50 p-8 rounded-[32px] border border-slate-700 space-y-6">
                                            <div className="flex items-center gap-4 text-teal-500">
                                                <Calendar size={24} />
                                                <h4 className="text-lg font-bold uppercase tracking-tight">Schedule Land Commission Visit</h4>
                                            </div>
                                            {userPermissions.includes("cases.schedule_visit") ? (
                                                <div className="flex gap-4">
                                                    <input
                                                        type="date"
                                                        className="flex-1 bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-white text-sm"
                                                        value={visitDate}
                                                        onChange={(e) => setVisitDate(e.target.value)}
                                                    />
                                                    <button
                                                        onClick={handleScheduleVisit}
                                                        disabled={actionLoading}
                                                        className="bg-teal-500 text-slate-950 px-8 py-3 rounded-2xl font-black text-xs uppercase hover:bg-teal-400 transition-all disabled:opacity-50"
                                                    >
                                                        Confirm Date
                                                    </button>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-slate-500 italic">Awaiting Scheduling by the Conservator's office.</p>
                                            )}
                                        </div>
                                    )}

                                    {caseData.status === "commission_visit" && (
                                        <div className="bg-slate-800/50 p-8 rounded-[32px] border border-slate-700 space-y-6">
                                            <div className="flex items-center gap-4 text-orange-500">
                                                <AlertTriangle size={24} />
                                                <h4 className="text-lg font-bold uppercase tracking-tight">Post-Visit Action Required</h4>
                                            </div>
                                            {userPermissions.includes("cases.upload_report") ? (
                                                <button
                                                    onClick={handleUploadReport}
                                                    disabled={actionLoading}
                                                    className="w-full bg-blue-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase hover:bg-blue-400 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <FileText size={16} />
                                                    Upload Field Report
                                                </button>
                                            ) : (
                                                <p className="text-sm text-slate-500 italic">Awaiting Field Report submission by the National Surveyor.</p>
                                            )}
                                        </div>
                                    )}

                                    {caseData.status === "technical_validation" && (
                                        <div className="bg-purple-500/10 p-8 rounded-[32px] border border-purple-500/20 space-y-4">
                                            <div className="flex items-center gap-4 text-purple-400">
                                                <Shield size={24} />
                                                <h4 className="text-lg font-bold uppercase tracking-tight">Technical Plan Validation</h4>
                                            </div>
                                            {userPermissions.includes("cases.validate_technical") ? (
                                                <div className="flex flex-col gap-3">
                                                    <div className="mb-8 p-6 bg-purple-500/5 rounded-3xl border border-purple-500/10 flex items-center gap-4">
                                                        <FileText className="text-purple-400" size={24} />
                                                        <div className="flex-1">
                                                            <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Field Report Status</p>
                                                            <p className="text-sm font-bold text-slate-700">Official geometer report is filed and awaiting formal validation stamp.</p>
                                                        </div>
                                                        <div
                                                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${checklist.field_report ? 'bg-purple-500 text-white' : 'bg-slate-200 text-slate-400 hover:bg-slate-300'}`}
                                                            onClick={() => toggleItem('field_report', !checklist.field_report)}
                                                        >
                                                            {checklist.field_report ? 'Report Validated' : 'Verify Report'}
                                                        </div>
                                                    </div>

                                                    <button
                                                        onClick={handleValidateTechnical}
                                                        disabled={actionLoading || !checklist.survey_valid || !checklist.no_overlap || !checklist.field_report}
                                                        className="w-full bg-purple-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase hover:bg-purple-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                                    >
                                                        <CheckCircle size={18} />
                                                        Validate & Issue Cadastral Plan
                                                    </button>
                                                    <button
                                                        onClick={handleTechnicalQuery}
                                                        disabled={actionLoading}
                                                        className="w-full bg-slate-800 text-slate-400 px-8 py-4 rounded-2xl font-black text-xs uppercase hover:bg-red-500/10 hover:text-red-500 border border-slate-700 hover:border-red-500/20 transition-all"
                                                    >
                                                        Raise Technical Query
                                                    </button>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-slate-500 italic text-center">Awaiting technical certification by the Cadastre Division.</p>
                                            )}
                                        </div>
                                    )}

                                    {caseData.status === "opposition_period" && (
                                        <div className="bg-blue-500/10 p-8 rounded-[32px] border border-blue-500/20 space-y-4">
                                            <div className="flex items-center gap-4 text-blue-400">
                                                <Loader2 size={24} className="animate-spin" />
                                                <h4 className="text-lg font-bold uppercase tracking-tight">Opposition Period Active</h4>
                                            </div>
                                            {(userPermissions.includes("cases.start_notice") || userPermissions.includes("cases.request_governor")) && (
                                                <button
                                                    onClick={handleRequestGovernor}
                                                    disabled={actionLoading}
                                                    className="w-full bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase hover:bg-blue-400 transition-all"
                                                >
                                                    Finalize & Request Governor Approval
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {caseData.status === "governor_approval" && (
                                        <div className="bg-slate-800 p-8 rounded-[40px] border-2 border-slate-700 space-y-6">
                                            <div className="flex items-center gap-4 text-teal-500">
                                                <Shield size={24} className="animate-pulse" />
                                                <h4 className="text-xl font-black uppercase tracking-tight">Governor Unblocking Received</h4>
                                            </div>
                                            <p className="text-sm text-slate-400">Governor clearance received. File unblocked for final certification.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <footer className="mt-8 flex justify-end gap-6 pt-8 border-t border-slate-800">
                            {status === 'pending' && caseData.status !== 'rejected' && (
                                <div className="flex gap-4">
                                    {userPermissions.includes("cases.seal") && (
                                        <>
                                            <button
                                                onClick={handleReject}
                                                disabled={actionLoading}
                                                className="px-8 py-4 bg-slate-800 text-slate-400 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-red-500/10 hover:text-red-500 border border-slate-700 hover:border-red-500/20 transition-all disabled:opacity-50"
                                            >
                                                Administrative Rejection
                                            </button>
                                            <button
                                                onClick={handleApprove}
                                                disabled={(!isComplete() && caseData.status !== "governor_approval") || actionLoading}
                                                className={`px-12 py-4 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl flex items-center gap-3 transition-all active:scale-[0.98] ${(isComplete() || caseData.status === "governor_approval")
                                                    ? "bg-teal-500 text-slate-950 hover:bg-teal-400 shadow-teal-500/20"
                                                    : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                                                    }`}
                                            >
                                                <Shield size={18} />
                                                {isComplete() || caseData.status === "governor_approval"
                                                    ? "Affix Authority Seal"
                                                    : (!caseData?.data?.cadastre_validated_at && caseData?.type !== 'transfer')
                                                        ? "Awaiting Technical Validation"
                                                        : "Review Incomplete"}
                                            </button>
                                        </>
                                    )}
                                    {userPermissions.includes("cases.validate_technical") && (
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest self-center italic">
                                            Direct Legal Actions Restricted to Conservator Desk
                                        </p>
                                    )}
                                </div>
                            )}
                            {status === 'creating' && (
                                <div className="flex items-center gap-4 text-teal-500 font-black text-xs uppercase tracking-widest bg-teal-500/5 px-6 py-4 rounded-3xl border border-teal-500/20">
                                    <Loader2 size={18} className="animate-spin" />
                                    Applying Cryptographic Signature...
                                </div>
                            )}
                            {(status === 'approved' || caseData.status === 'rejected') && (
                                <button
                                    onClick={() => router.push("/portal/authority")}
                                    className="px-10 py-5 bg-slate-800 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-slate-700 transition-all border border-slate-700"
                                >
                                    Finish Review Session
                                </button>
                            )}
                        </footer>
                    </div>
                </div>
            </div>
        </div>
    );
}
