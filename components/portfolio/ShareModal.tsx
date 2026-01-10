"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, QrCode, Check, Share2, Globe } from "lucide-react";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentName: string;
    description?: string;
}

export default function ShareModal({ isOpen, onClose, studentName, description }: ShareModalProps) {
    const [copied, setCopied] = useState(false);

    // In a real app, this would be a dynamic public profile URL
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/public/portfolio/${btoa(studentName)}` : '';

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="relative h-32 bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/30 text-white rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className="text-center text-white p-6">
                                <Share2 className="w-10 h-10 mx-auto mb-2 opacity-90" />
                                <h2 className="text-xl font-bold">Share Your Success</h2>
                                <p className="text-purple-100 text-sm">Showcase your achievements to the world</p>
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            {/* QR Code */}
                            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                                <div className="p-2 bg-white rounded-xl shadow-sm mb-4">
                                    <QRCodeSVG value={shareUrl} size={150} />
                                </div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <QrCode className="w-4 h-4" />
                                    Scan to View Portfolio
                                </p>
                            </div>

                            {/* Public Link */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase ml-1">
                                    Public Profile Link
                                </label>
                                <div className="flex gap-2">
                                    <div className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-950 rounded-xl text-sm font-mono text-slate-600 dark:text-slate-300 truncate border border-slate-200 dark:border-slate-800 flex items-center gap-2">
                                        <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                                        {shareUrl}
                                    </div>
                                    <button
                                        onClick={handleCopy}
                                        className={`px-4 py-3 rounded-xl font-bold text-white transition-all flex items-center gap-2 ${copied
                                                ? "bg-green-500 hover:bg-green-600"
                                                : "bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600"
                                            }`}
                                    >
                                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <p className="text-xs text-center text-slate-500 dark:text-slate-400 leading-relaxed">
                                This link allows anyone to view your verified achievements and portfolio. You can include it in your CV or LinkedIn profile.
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
