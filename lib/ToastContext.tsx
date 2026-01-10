"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion, PanInfo, useMotionValue, useTransform } from "framer-motion";
import { CheckCircle2, XCircle, AlertCircle, X, Info } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = "info") => {
        const id = Math.random().toString(36).substring(7);
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto dismiss
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    }, []);

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {/* Desktop: top-right, Mobile: bottom-center */}
            <div className="fixed z-[100] flex flex-col gap-2 pointer-events-none
                top-24 right-4 sm:right-4
                bottom-auto sm:bottom-auto
                left-4 sm:left-auto
                max-sm:top-auto max-sm:bottom-24 max-sm:left-1/2 max-sm:-translate-x-1/2 max-sm:right-auto max-sm:items-center">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <ToastItem
                            key={toast.id}
                            toast={toast}
                            onRemove={() => removeToast(toast.id)}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

interface ToastItemProps {
    toast: Toast;
    onRemove: () => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
    const x = useMotionValue(0);
    const opacity = useTransform(x, [-100, 0, 100], [0, 1, 0]);

    const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (Math.abs(info.offset.x) > 80) {
            onRemove();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.5}
            onDragEnd={handleDragEnd}
            style={{ x, opacity }}
            className="pointer-events-auto w-full sm:w-auto sm:min-w-[300px] max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl p-4 flex items-start gap-3 backdrop-blur-md cursor-grab active:cursor-grabbing touch-pan-y"
        >
            <div className="mt-0.5 flex-shrink-0">
                {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                {toast.type === "error" && <XCircle className="w-5 h-5 text-red-500" />}
                {toast.type === "warning" && <AlertCircle className="w-5 h-5 text-amber-500" />}
                {toast.type === "info" && <Info className="w-5 h-5 text-blue-500" />}
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 dark:text-white text-sm">
                    {toast.type === "success" ? "Success" :
                        toast.type === "error" ? "Error" :
                            toast.type === "warning" ? "Warning" : "Notification"}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed break-words">{toast.message}</p>
            </div>
            <button
                onClick={onRemove}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors flex-shrink-0 min-w-[28px] min-h-[28px] flex items-center justify-center"
            >
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
}
