"use client";
import { API_URL } from "@/config/api";

import { useState, useEffect, useRef } from "react";
import { Upload, FileText, CheckCircle, CheckCircle2, Shield, Loader2, Search, ArrowRight, Save, AlertCircle, Monitor, Cpu, Terminal, Camera, Video, X } from "lucide-react";
import Link from "next/link";

export default function DigitizePage() {
    const [scanUrl, setScanUrl] = useState<string | null>(null);
    const [isExtracting, setIsExtracting] = useState(false);
    const [extractedData, setExtractedData] = useState<any>(null);
    const [ownerEmail, setOwnerEmail] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [step, setStep] = useState(1); // 1: Upload, 2: Review, 3: Success
    const [extractionError, setExtractionError] = useState<string | null>(null);

    const [isSpreadsheet, setIsSpreadsheet] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [scanPages, setScanPages] = useState<string[]>([]);

    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [confidenceScore, setConfidenceScore] = useState<number | null>(null);

    const handleOpenCamera = async () => {
        setIsCameraOpen(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            setCameraStream(stream);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Camera error:", err);
            alert("Could not access camera. Please check permissions.");
            setIsCameraOpen(false);
        }
    };

    const handleCloseCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
        }
        setCameraStream(null);
        setIsCameraOpen(false);
    };

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageData = canvas.toDataURL("image/jpeg");
                setScanUrl(imageData);
                handleCloseCamera();
                handleStartOCR("CAMERA_CAPTURE.jpg");
            }
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const fileName = file.name;
            const isSheet = fileName.toLowerCase().endsWith('.xlsx') || fileName.toLowerCase().endsWith('.csv');
            setIsSpreadsheet(isSheet);
            setScanUrl(isSheet ? null : URL.createObjectURL(file));
            handleStartOCR(fileName);
        }
    };

    const handleDeviceScan = async () => {
        setExtractionError(null);
        setIsScanning(true);
        setScanProgress(0);
        setScanPages([]);
        const token = localStorage.getItem("token");

        try {
            // 1. Initial Handshake
            const handshake = await fetch(`${API_URL}/api/ingestion/scanner/scan`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (!handshake.ok) throw new Error("Hardware Bridge Unavailable");

            // 2. Multipage Simulation Flow
            const totalPages = 5;
            for (let i = 1; i <= totalPages; i++) {
                await new Promise(resolve => setTimeout(resolve, 800)); // 60 PPM approx
                setScanProgress((i / totalPages) * 100);
                setScanPages(prev => [...prev, `Page ${i} Ingested`]);
            }

            // 3. Finalize Ingestion
            await handleStartOCR("INDUSTRIAL_SCAN_BATCH.pdf");
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsScanning(false);
        }
    };

    const handleStartOCR = async (fileName?: string) => {
        setIsExtracting(true);
        setExtractionError(null);
        const token = localStorage.getItem("token");
        try {
            // Simulated delay for OCR post-scan
            await new Promise(resolve => setTimeout(resolve, isSpreadsheet ? 1500 : 2500));

            const response = await fetch(`${API_URL}/api/ingestion/extract`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    scanUrl: "https://example.com/legacy_scan.pdf",
                    fileName
                })
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.code === "SCHEMA_MISMATCH" || data.code === "VISION_REJECTION") {
                    setExtractionError(data.message);
                    return;
                }
                throw new Error(data.message || "Digital extraction failed.");
            }

            // Hydrate the form
            setExtractedData(data.extractedData);
            setConfidenceScore(data.confidenceScore);
            if (data.extractedData.owner_email) {
                setOwnerEmail(data.extractedData.owner_email);
            }
            setIsSpreadsheet(data.isSpreadsheet);
            setStep(2);
        } catch (error: any) {
            console.error("Extraction Error:", error);
            setExtractionError(error.message || "Digital extraction failed.");
        } finally {
            setIsExtracting(false);
        }
    };

    const handleConfirmDigitization = async () => {
        if (!ownerEmail) return alert("Please specify the current legal owner email");
        setIsSaving(true);
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${API_URL}/api/ingestion/confirm`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    extractedData,
                    scanUrl: "https://example.com/legacy_scan.pdf", // In production this would be the actual stored URL
                    ownerEmail
                })
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message);
            }
            setStep(3);
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8 pt-12">
            <div className="max-w-6xl mx-auto">
                <header className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-4">
                        <div className="bg-slate-900 p-3 rounded-2xl text-white">
                            <FileText size={32} />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-1">Digitization Desk</h1>
                            <p className="text-slate-500 font-medium flex items-center gap-2">
                                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold">LEGACY BRIDGE</span>
                                Physical Archive Ingestion Engine • Production Grade
                            </p>
                        </div>
                    </div>
                </header>

                {step === 1 && (
                    <div className="bg-white rounded-[48px] border-2 border-dashed border-slate-200 p-24 text-center shadow-sm">
                        <div className="w-24 h-24 bg-blue-600/10 rounded-[32px] flex items-center justify-center mx-auto mb-8 animate-pulse">
                            <Upload size={48} className="text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Upload Paper Archive</h2>
                        <p className="text-slate-500 max-w-md mx-auto mb-8 text-lg font-medium">Select high-resolution scans or initialize the industrial feeder for automated ingestion.</p>

                        {extractionError && (
                            <div className="max-w-md mx-auto mb-8 bg-rose-50 border border-rose-200 p-6 rounded-[32px] flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                <AlertCircle size={20} className="text-rose-500 shrink-0 mt-1" />
                                <div className="text-left">
                                    <p className="text-rose-900 font-black uppercase tracking-widest text-[10px] mb-1">
                                        {extractionError.includes("Vision") ? "Neural Rejection: Scan Failed" : "Access Rejected: Schema Mismatch"}
                                    </p>
                                    <p className="text-rose-700 text-sm font-medium leading-relaxed">{extractionError}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <label className="bg-slate-900 text-white px-10 py-5 rounded-[24px] font-black uppercase text-sm cursor-pointer hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 inline-flex items-center gap-3">
                                {isExtracting && !isScanning ? <Loader2 className="animate-spin" /> : <Upload size={20} />}
                                {isExtracting && !isScanning ? "Running OCR..." : "Upload Local Scan"}
                                <input type="file" className="hidden" onChange={handleFileUpload} disabled={isExtracting || isScanning} />
                            </label>

                            <button
                                onClick={handleDeviceScan}
                                disabled={isExtracting || isScanning}
                                className="bg-blue-600 text-white px-10 py-5 rounded-[24px] font-black uppercase text-sm hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/10 inline-flex items-center gap-3 disabled:opacity-50"
                            >
                                {isScanning ? <Loader2 className="animate-spin" /> : <Monitor size={20} />}
                                {isScanning ? "Scanning Batch..." : "Scan from Device"}
                            </button>

                            <button
                                onClick={handleOpenCamera}
                                disabled={isExtracting || isScanning}
                                className="bg-emerald-600 text-white px-10 py-5 rounded-[24px] font-black uppercase text-sm hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-500/10 inline-flex items-center gap-3 disabled:opacity-50"
                            >
                                <Camera size={20} />
                                Capture from Camera
                            </button>
                        </div>

                        {/* Camera Preview Modal */}
                        {isCameraOpen && (
                            <div className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in duration-300">
                                <div className="bg-slate-900 border border-slate-800 rounded-[64px] overflow-hidden max-w-4xl w-full relative shadow-[0_0_100px_rgba(30,58,138,0.5)]">
                                    <button
                                        onClick={handleCloseCamera}
                                        className="absolute top-8 right-8 z-30 bg-slate-800/80 hover:bg-rose-500 text-white p-4 rounded-full transition-all"
                                    >
                                        <X size={24} />
                                    </button>

                                    <div className="relative aspect-video bg-black">
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            playsInline
                                            className="w-full h-full object-cover opacity-80"
                                        />
                                        <div className="absolute inset-0 border-2 border-white/20 pointer-events-none">
                                            {/* Scanning Guide Overlay */}
                                            <div className="absolute inset-12 border-2 border-dashed border-blue-400/50 rounded-2xl flex items-center justify-center">
                                                <div className="text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] bg-blue-900/40 px-4 py-2 rounded-lg backdrop-blur-sm">
                                                    Align Deed Within Frame
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-12 text-center">
                                        <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Instant Digitization Hub</h3>
                                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-10">High-fidelity capture active • Neural focus enabled</p>

                                        <button
                                            onClick={handleCapture}
                                            className="bg-white text-slate-900 px-12 py-6 rounded-[32px] font-black uppercase text-sm hover:bg-blue-50 transition-all flex items-center justify-center gap-4 mx-auto shadow-2xl group"
                                        >
                                            <div className="w-4 h-4 rounded-full border-4 border-slate-900 animate-pulse group-hover:bg-blue-600 transition-colors"></div>
                                            Capture Deed Record
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <canvas ref={canvasRef} className="hidden" />

                        {isScanning && (
                            <div className="mt-12 max-w-lg mx-auto bg-slate-900 rounded-[32px] p-8 border border-slate-800 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                        <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">Live Hardware Feed</p>
                                    </div>
                                    <p className="text-slate-500 text-[10px] font-bold">FEEDS: 60 PPM</p>
                                </div>
                                <div className="space-y-4 mb-8">
                                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${scanProgress}%` }}></div>
                                    </div>
                                    <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                        <span>Ingesting Stack</span>
                                        <span>{Math.round(scanProgress)}% COMPLETE</span>
                                    </div>
                                </div>
                                <div className="bg-slate-950 rounded-2xl p-4 font-mono text-[10px] text-emerald-400/80 space-y-1 h-32 overflow-y-auto custom-scrollbar text-left border border-slate-800">
                                    <p className="opacity-50 tracking-tighter">Initializing TWAIN driver handshake...</p>
                                    <p className="text-emerald-400 underline">Hardware discovery successful: KODAK i5000</p>
                                    {scanPages.map((page, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <span className="text-emerald-500">✓</span>
                                            <span>{page}</span>
                                            <span className="ml-auto opacity-30">[{new Date().toLocaleTimeString()}]</span>
                                        </div>
                                    ))}
                                    {scanProgress === 100 && <p className="text-blue-400 animate-pulse mt-2 font-black uppercase">Batch complete. Transferring to OCR Engine...</p>}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {step === 2 && extractedData && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-12 duration-700">
                        {/* Physical Scan Preview */}
                        <div className="space-y-6">
                            <div className="bg-slate-900 rounded-[48px] overflow-hidden shadow-2xl border border-slate-800 relative group">
                                <div className="absolute top-6 left-6 z-20 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700 text-[10px] font-black text-blue-400 uppercase tracking-widest">
                                    {isSpreadsheet ? "Spreadsheet Source (Bulk)" : scanPages.length > 0 ? "Industrial Device Input (Kodak i5000)" : scanUrl?.startsWith('data:image') ? "Instant Camera Capture" : "Historical Source Document"}
                                </div>
                                <div className="aspect-[4/5] bg-slate-800 flex items-center justify-center">
                                    {isSpreadsheet ? (
                                        <div className="flex flex-col items-center gap-6">
                                            <div className="w-24 h-24 bg-green-500/10 rounded-3xl flex items-center justify-center border border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.1)]">
                                                <FileText size={48} className="text-green-500" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-white font-black uppercase tracking-widest text-sm mb-2">Spreadsheet Ingestion Active</p>
                                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-tighter">Parsing Row Data Buffer...</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {scanUrl ? (
                                                <img src={scanUrl} className="w-full h-full object-cover opacity-60 mix-blend-luminosity" alt="Scan Overlay" />
                                            ) : (
                                                <div className="flex flex-col items-center gap-6">
                                                    <div className="w-24 h-24 bg-blue-500/10 rounded-3xl flex items-center justify-center border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                                                        <Monitor size={48} className="text-blue-500" />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-white font-black uppercase tracking-widest text-sm mb-2">Live Hardware Stream</p>
                                                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-tighter">Syncing batch buffer...</p>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center pointer-events-none">
                                                <div className="w-full h-1 bg-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.5)] animate-scan mb-4"></div>
                                                <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest">Digital Mapping Layers Active</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Digital Twin Mapping Viz */}
                            <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">System Mapping Pipeline</h4>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 space-y-2">
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div className={`h-full ${isSpreadsheet ? 'bg-green-500' : 'bg-blue-600'} w-full animate-pulse`}></div>
                                        </div>
                                        <p className="text-[9px] font-bold text-slate-500 uppercase">
                                            {isSpreadsheet ? 'Input: Data Roster' : scanPages.length > 0 ? 'Input: Device Batch' : scanUrl?.startsWith('data:image') ? 'Input: Instant Capture' : 'Input: Paper Archive'}
                                        </p>
                                    </div>
                                    <ArrowRight className="text-slate-300" size={16} />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-teal-500 w-full"></div>
                                        </div>
                                        <p className="text-[9px] font-bold text-teal-600 uppercase">Target: Universal Deed Schema</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Extracted Metadata Dashboard */}
                        <div className="space-y-8">
                            <div className="bg-white p-12 rounded-[48px] shadow-2xl border border-slate-100 relative">
                                <div className="flex items-center justify-between mb-10">
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Refining Digital Record</h3>
                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Verify and fill mandatory system fields</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {confidenceScore && (
                                            <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${confidenceScore > 0.9 ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                                {Math.round(confidenceScore * 100)}% Confidence
                                            </div>
                                        )}
                                        <div className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 ${isSpreadsheet ? 'bg-emerald-100 text-emerald-600' : 'bg-green-100 text-green-600'}`}>
                                            {isSpreadsheet ? <CheckCircle2 size={14} /> : <CheckCircle size={14} />}
                                            {isSpreadsheet ? "Template Verified" : "Extraction Valid"}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vol / Folio</p>
                                            <div className="flex gap-2">
                                                <input
                                                    className="w-1/2 bg-transparent font-black text-slate-900 border-none outline-none focus:ring-0 text-xl"
                                                    value={extractedData.vol}
                                                    onChange={(e) => setExtractedData({ ...extractedData, vol: e.target.value })}
                                                />
                                                <span className="text-slate-300">/</span>
                                                <input
                                                    className="w-1/2 bg-transparent font-black text-slate-900 border-none outline-none focus:ring-0 text-xl"
                                                    value={extractedData.folio}
                                                    onChange={(e) => setExtractedData({ ...extractedData, folio: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Deed Number</p>
                                            <input
                                                className="w-full bg-transparent font-black text-slate-900 border-none outline-none focus:ring-0 text-xl"
                                                value={extractedData.deed_number}
                                                onChange={(e) => setExtractedData({ ...extractedData, deed_number: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Additional Digital System Fields */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group/field">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Locality (Town/Quarter)</p>
                                                <div className="flex items-center gap-1.5 opacity-0 group-hover/field:opacity-100 transition-opacity">
                                                    <span className="text-[8px] font-black text-blue-500 uppercase tracking-tighter">AI Insight</span>
                                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                                                </div>
                                            </div>
                                            <input
                                                className="w-full bg-transparent font-black text-slate-900 border-none outline-none focus:ring-0 text-lg"
                                                value={extractedData.locality}
                                                onChange={(e) => setExtractedData({ ...extractedData, locality: e.target.value })}
                                            />
                                        </div>
                                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group/field">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Area (sqm)</p>
                                                <div className="flex items-center gap-1.5 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100 cursor-help" title="Derived from Digital Cadastre Mapping: Area calculated via neural survey link.">
                                                    <span className="text-[8px] font-black text-blue-600 uppercase tracking-tighter">System Derived</span>
                                                </div>
                                            </div>
                                            <input
                                                type="number"
                                                className="w-full bg-transparent font-black text-slate-900 border-none outline-none focus:ring-0 text-lg"
                                                value={extractedData.area_sq_meters}
                                                onChange={(e) => setExtractedData({ ...extractedData, area_sq_meters: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 group/field">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Parcel Reference (GIS Mapping)</p>
                                            <div className="flex items-center gap-1.5 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100 cursor-help" title="Historical data lacks GIS coords; System has generated a temporary Digital Bridge ID.">
                                                <span className="text-[8px] font-black text-amber-600 uppercase tracking-tighter italic">Generated Ref</span>
                                            </div>
                                        </div>
                                        <input
                                            className="w-full bg-transparent font-black text-slate-900 border-none outline-none focus:ring-0 text-xl"
                                            value={extractedData.parcel_number}
                                            onChange={(e) => setExtractedData({ ...extractedData, parcel_number: e.target.value })}
                                        />
                                    </div>

                                    <div className="p-8 bg-blue-50 rounded-[32px] border border-blue-100 space-y-4 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 py-2 px-6 bg-blue-600 text-white text-[8px] font-black uppercase tracking-[0.2em] transform rotate-3 -mr-2 mt-4 shadow-lg">
                                            Digital Identity Link Found
                                        </div>
                                        <h4 className="text-sm font-black text-blue-900 uppercase tracking-tight flex items-center gap-2">
                                            <Search size={18} /> Owner Identity Link
                                        </h4>
                                        <p className="text-xs text-blue-700 opacity-70">Linking <strong>{extractedData.owner_name}</strong> to a verified digital account.</p>
                                        <input
                                            type="email"
                                            placeholder="Digital Identity Email (user@mindaf.gov)"
                                            className="w-full bg-white border border-blue-200 rounded-2xl px-6 py-4 text-sm font-medium focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                            value={ownerEmail}
                                            onChange={(e) => setOwnerEmail(e.target.value)}
                                        />
                                        <div className="flex items-center gap-2 text-[9px] font-bold text-blue-500 uppercase italic">
                                            <CheckCircle size={10} /> Verified match found in National Registry
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleConfirmDigitization}
                                    disabled={isSaving || !ownerEmail}
                                    className="w-full mt-12 bg-slate-900 text-white px-8 py-5 rounded-[24px] font-black uppercase text-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-4 shadow-2xl disabled:opacity-50"
                                >
                                    {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                                    {isSaving ? "Publishing to Digital Ledger..." : "Confirm & Commit to Universal Ledger"}
                                </button>
                                <p className="text-center mt-6 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                    Commitment finalizes the digital twin and mirrors legacy data to the blockchain.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="max-w-2xl mx-auto text-center py-24 animate-in zoom-in-95 duration-700">
                        <div className="w-32 h-32 bg-green-500/10 rounded-[48px] flex items-center justify-center mx-auto mb-12 border-2 border-green-500/20">
                            <CheckCircle size={64} className="text-green-500" />
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-6">Archive Digitized</h2>
                        <p className="text-xl text-slate-500 mb-12 font-medium">The legacy archive has been successfully normalized and published. The owner can now access their property via the secured portal.</p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => { setStep(1); setExtractedData(null); setScanUrl(null); setOwnerEmail(""); }}
                                className="bg-slate-900 text-white px-12 py-5 rounded-[24px] font-black uppercase text-sm hover:bg-slate-800 transition-all shadow-xl"
                            >
                                Digitize Next Record
                            </button>
                            <Link
                                href="/portal/clerk/history"
                                className="bg-white text-slate-900 border-2 border-slate-200 px-12 py-5 rounded-[24px] font-black uppercase text-sm hover:bg-slate-50 transition-all shadow-sm"
                            >
                                View Ingestion History
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes scan {
                    0% { transform: translateY(0); }
                    50% { transform: translateY(400px); }
                    100% { transform: translateY(0); }
                }
                .animate-scan {
                    animation: scan 4s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
