"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Share } from "lucide-react";

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Check if already installed or dismissed
        if (localStorage.getItem('pwa-prompt-dismissed')) return;

        // Listen for install prompt on Android/Desktop
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Check availability on iOS
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        // Check if NOT standalone (not installed)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;

        if (isIOSDevice && !isStandalone) {
            setIsIOS(true);
            setIsVisible(true);
        }

        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setIsVisible(false);
        }
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem('pwa-prompt-dismissed', 'true');
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 400 }}
                    className="fixed top-20 left-0 right-0 z-50 p-4 md:p-6"
                >
                    <div className="max-w-md mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                                <span className="text-white font-black text-lg">CS</span>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-slate-900 dark:text-white text-base">Install App</h3>
                                    <button
                                        onClick={handleDismiss}
                                        className="p-1.5 -mr-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                                    >
                                        <X className="w-4 h-4 text-slate-400" />
                                    </button>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                    {isIOS
                                        ? "Add to your Home Screen for the best experience."
                                        : "Install for offline access and faster loading."}
                                </p>
                            </div>
                        </div>

                        {isIOS ? (
                            <div className="mt-4 flex items-center justify-center gap-1.5 py-2.5 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                                <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                                    Tap
                                </span>
                                <Share className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                                    then &quot;Add to Home Screen&quot;
                                </span>
                            </div>
                        ) : (
                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={handleInstall}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl text-sm shadow-lg hover:scale-105 transition-transform"
                                >
                                    <Download className="w-4 h-4" />
                                    Install
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
