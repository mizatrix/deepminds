'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { X, GripVertical, Eye, EyeOff, RotateCcw } from 'lucide-react';
import {
    DashboardPreferences,
    StatWidget,
    getDashboardPreferences,
    saveDashboardPreferences,
    getDefaultPreferences
} from '@/lib/dashboard/preferences';

interface CustomizeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (prefs: DashboardPreferences) => void;
}

export default function CustomizeModal({ isOpen, onClose, onSave }: CustomizeModalProps) {
    const [widgets, setWidgets] = useState<StatWidget[]>([]);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen) {
            const prefs = getDashboardPreferences();
            setWidgets([...prefs.widgets]);
        }
    }, [isOpen]);

    const handleToggle = (id: string) => {
        setWidgets(prev =>
            prev.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w)
        );
    };

    const handleReset = () => {
        const defaultPrefs = getDefaultPreferences();
        setWidgets([...defaultPrefs.widgets]);
    };

    const handleSave = () => {
        const newPrefs: DashboardPreferences = { widgets };
        saveDashboardPreferences(newPrefs);
        onSave(newPrefs);
        onClose();
    };

    if (!mounted) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 px-4"
                    >
                        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                            {/* Header */}
                            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold">
                                            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                                Customize Dashboard
                                            </span>
                                        </h2>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                            Toggle and reorder your stat cards
                                        </p>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                                    >
                                        <X className="w-5 h-5 text-slate-400" />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-xs font-bold uppercase text-slate-400">
                                        Drag to reorder
                                    </span>
                                    <button
                                        onClick={handleReset}
                                        className="flex items-center gap-1 text-xs text-slate-500 hover:text-purple-600 transition-colors"
                                    >
                                        <RotateCcw className="w-3 h-3" />
                                        Reset
                                    </button>
                                </div>

                                <Reorder.Group
                                    axis="y"
                                    values={widgets}
                                    onReorder={setWidgets}
                                    className="space-y-2"
                                >
                                    {widgets.map((widget) => (
                                        <Reorder.Item
                                            key={widget.id}
                                            value={widget}
                                            className={`flex items-center gap-3 p-4 rounded-2xl border transition-colors cursor-grab active:cursor-grabbing ${widget.enabled
                                                    ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                                                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 opacity-60'
                                                }`}
                                        >
                                            <GripVertical className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                            <span className={`flex-1 font-medium ${widget.enabled
                                                    ? 'text-slate-900 dark:text-white'
                                                    : 'text-slate-400 dark:text-slate-500'
                                                }`}>
                                                {widget.label}
                                            </span>
                                            <button
                                                onClick={() => handleToggle(widget.id)}
                                                className={`p-2 rounded-xl transition-colors ${widget.enabled
                                                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                                                    }`}
                                            >
                                                {widget.enabled ? (
                                                    <Eye className="w-4 h-4" />
                                                ) : (
                                                    <EyeOff className="w-4 h-4" />
                                                )}
                                            </button>
                                        </Reorder.Item>
                                    ))}
                                </Reorder.Group>

                                <p className="text-xs text-slate-400 mt-4 text-center">
                                    At least one widget must be visible
                                </p>
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={!widgets.some(w => w.enabled)}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
