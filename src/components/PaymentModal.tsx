"use client";

import { useState } from "react";
import { X, Smartphone, Lock, CheckCircle, AlertTriangle } from "lucide-react";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number;
    purpose: string;
    onSuccess: (token: string) => void;
}

export default function PaymentModal({ isOpen, onClose, amount, purpose, onSuccess }: PaymentModalProps) {
    const [step, setStep] = useState(1); // 1: Input Phone, 2: OTP, 3: Success
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [txnId, setTxnId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleInitiate = async () => {
        setLoading(true);
        setError("");
        try {
            // Mock API Call
            // const res = await fetch('/api/payments/initiate', ...)
            await new Promise(r => setTimeout(r, 1000));

            setTxnId(`TXN-${Date.now()}`); // Mock
            setStep(2);
        } catch (e) {
            setError("Failed to initiate. Try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        setLoading(true);
        setError("");
        try {
            await new Promise(r => setTimeout(r, 1000));

            if (otp === "1234") {
                setStep(3);
                setTimeout(() => {
                    onSuccess(txnId);
                    onClose();
                }, 2000);
            } else {
                setError("Invalid OTP. Try '1234'.");
            }
        } catch (e) {
            setError("Verification failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
                    <h3 className="font-bold flex items-center gap-2">
                        <Smartphone className="text-yellow-400" size={20} />
                        Secure Payment
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    {/* Amount Display */}
                    <div className="text-center mb-6">
                        <p className="text-sm text-slate-500 uppercase tracking-widest">Amount to Pay</p>
                        <p className="text-3xl font-bold text-slate-900">{amount.toLocaleString()} XAF</p>
                        <p className="text-xs text-blue-600 font-medium mt-1">{purpose}</p>
                    </div>

                    {step === 1 && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Money Number</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-3 text-slate-400">+237</span>
                                    <input
                                        type="tel"
                                        className="w-full pl-14 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                                        placeholder="6XX XX XX XX"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                    <div className="absolute right-3 top-2.5 flex gap-1">
                                        <div className="w-6 h-6 bg-yellow-400 rounded-full"></div>
                                        <div className="w-6 h-6 bg-orange-500 rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleInitiate}
                                disabled={phone.length < 9 || loading}
                                className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 transition-all"
                            >
                                {loading ? "Connecting..." : "Pay Now"}
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3 text-sm text-blue-800">
                                <AlertTriangle className="shrink-0" size={18} />
                                <p>Please enter the OTP sent to your phone. (Hint: Use <strong>1234</strong>)</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">One-Time Password (OTP)</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold tracking-widest text-center text-lg"
                                        placeholder="• • • •"
                                        maxLength={4}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                    />
                                </div>
                            </div>
                            {error && <p className="text-red-600 text-sm text-center">{error}</p>}
                            <button
                                onClick={handleConfirm}
                                disabled={otp.length !== 4 || loading}
                                className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 transition-all"
                            >
                                {loading ? "Verifying..." : "Confirm Payment"}
                            </button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                                <CheckCircle size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">Payment Successful!</h3>
                            <p className="text-slate-500">Redirecting you to your content...</p>
                        </div>
                    )}

                    <div className="mt-6 flex justify-center gap-4 border-t pt-4">
                        <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
                            <Lock size={10} /> 256-bit Encrypted
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
