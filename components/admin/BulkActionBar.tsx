"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Trash2, Download, FileSpreadsheet, FileText, ChevronDown } from "lucide-react";
import { useState } from "react";

interface BulkActionBarProps {
    selectedCount: number;
    onApproveAll: () => void;
    onRejectAll: () => void;
    onDeleteAll: () => void;
    onExportCSV: () => void;
    onExportPDF: () => void;
    onClearSelection: () => void;
}

export default function BulkActionBar({
    selectedCount,
    onApproveAll,
    onRejectAll,
    onDeleteAll,
    onExportCSV,
    onExportPDF,
    onClearSelection
}: BulkActionBarProps) {
    const [showExportMenu, setShowExportMenu] = useState(false);

    return (
        <AnimatePresence>
            {selectedCount > 0 && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
                >
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl shadow-slate-900/20 dark:shadow-black/40 px-6 py-4 flex items-center gap-4">
                        {/* Selection Count */}
                        <div className="flex items-center gap-3 pr-4 border-r border-slate-200 dark:border-slate-700">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                <span className="text-purple-600 dark:text-purple-400 font-black text-lg">{selectedCount}</span>
                            </div>
                            <div className="text-sm">
                                <p className="font-bold text-slate-900 dark:text-white">Selected</p>
                                <button
                                    onClick={onClearSelection}
                                    className="text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 text-xs font-medium transition-colors"
                                >
                                    Clear selection
                                </button>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            {/* Approve All */}
                            <button
                                onClick={onApproveAll}
                                className="flex items-center gap-2 px-4 py-2.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl font-bold text-sm hover:bg-green-100 dark:hover:bg-green-900/40 transition-all hover:scale-105"
                            >
                                <Check className="w-4 h-4" />
                                Approve All
                            </button>

                            {/* Reject All */}
                            <button
                                onClick={onRejectAll}
                                className="flex items-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl font-bold text-sm hover:bg-red-100 dark:hover:bg-red-900/40 transition-all hover:scale-105"
                            >
                                <X className="w-4 h-4" />
                                Reject All
                            </button>

                            {/* Delete All */}
                            <button
                                onClick={onDeleteAll}
                                className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all hover:scale-105"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </button>

                            {/* Export Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowExportMenu(!showExportMenu)}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-purple-500/30 transition-all hover:scale-105"
                                >
                                    <Download className="w-4 h-4" />
                                    Export
                                    <ChevronDown className={`w-4 h-4 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {showExportMenu && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.15 }}
                                            className="absolute bottom-full mb-2 right-0 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden min-w-[160px]"
                                        >
                                            <button
                                                onClick={() => {
                                                    onExportCSV();
                                                    setShowExportMenu(false);
                                                }}
                                                className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                            >
                                                <FileSpreadsheet className="w-4 h-4 text-green-600" />
                                                Export as CSV
                                            </button>
                                            <button
                                                onClick={() => {
                                                    onExportPDF();
                                                    setShowExportMenu(false);
                                                }}
                                                className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                            >
                                                <FileText className="w-4 h-4 text-red-600" />
                                                Export as PDF
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
