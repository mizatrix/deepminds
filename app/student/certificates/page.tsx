"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Download, QrCode, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { EmptyState } from "@/components/ui/EmptyState";
import { getStudentCertificates, type Certificate } from "@/lib/actions/certificates";
import { generateCertificatePDF } from "@/lib/certificates/template-generator";
import { getCertificateConfig } from "@/lib/certificates/certificate-config";

export default function CertificatesPage() {
    const { data: session, status } = useSession();
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState<string | null>(null);
    const [qrImage, setQrImage] = useState<string>("");
    const [showQRModal, setShowQRModal] = useState(false);
    const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

    // Fetch real certificates from database
    useEffect(() => {
        async function loadCertificates() {
            if (status === "loading") return;

            if (!session?.user?.email) {
                setLoading(false);
                return;
            }

            try {
                const certs = await getStudentCertificates(session.user.email);
                setCertificates(certs);
            } catch (error) {
                console.error("Error loading certificates:", error);
            } finally {
                setLoading(false);
            }
        }

        loadCertificates();
    }, [session, status]);

    const generateQRCode = async (cert: Certificate) => {
        try {
            const verificationUrl = `${window.location.origin}/verify/${cert.id}`;
            const QRCode = (await import('qrcode')).default;
            const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#1e293b',
                    light: '#ffffff'
                }
            });

            setQrImage(qrDataUrl);
            setSelectedCert(cert);
            setShowQRModal(true);
        } catch (error) {
            console.error('Error generating QR code:', error);
        }
    };

    const generatePDF = async (cert: Certificate) => {
        setGenerating(cert.id);
        try {
            generateCertificatePDF(cert);
        } catch (error) {
            console.error('Error generating PDF:', error);
        } finally {
            setGenerating(null);
        }
    };

    const getCategoryColor = (category: string) => {
        const config = getCertificateConfig(category);
        return config.colors.primary;
    };

    const getTierBadge = (tier: string) => {
        const badges = {
            standard: { text: "Standard", color: " bg-slate-500" },
            honor: { text: "Honor", color: "bg-amber-500" },
            excellence: { text: "Excellence", color: "bg-purple-600" }
        };
        return badges[tier as keyof typeof badges] || badges.standard;
    };

    if (loading || status === "loading") {
        return (
            <div className="container mx-auto px-4 py-12 min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12 min-h-screen">
            <div className="mb-12">
                <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4">My Certificates</h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg">
                    Download and share your verifiable proofs of achievement.
                </p>
                {certificates.length > 0 && (
                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">
                        You have earned {certificates.length} certificate{certificates.length !== 1 ? 's' : ''}
                    </p>
                )}
            </div>

            {certificates.length === 0 ? (
                <EmptyState
                    variant="certificates"
                    title="No Certificates Yet"
                    description="Complete approved achievements with 50+ points to earn verifiable certificates of excellence!"
                    actionLabel="Submit Achievement"
                    actionHref="/"
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {certificates.map((cert, index) => {
                        const tierBadge = getTierBadge(cert.tier);
                        const categoryColor = getCategoryColor(cert.category);

                        return (
                            <motion.div
                                key={cert.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                            >
                                {/* Decorative BG with category color */}
                                <div
                                    className="absolute top-0 right-0 w-32 h-32 rounded-bl-[4rem] z-0 transition-transform group-hover:scale-110 opacity-10"
                                    style={{ backgroundColor: categoryColor }}
                                />

                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-6">
                                        <div
                                            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                                            style={{
                                                background: `linear-gradient(135deg, ${categoryColor}, ${categoryColor}dd)`,
                                                boxShadow: `0 4px 12px ${categoryColor}40`
                                            }}
                                        >
                                            <Award className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex gap-2">
                                            <div className={`px-3 py-1 rounded-full ${tierBadge.color} text-xs font-bold text-white`}>
                                                {tierBadge.text}
                                            </div>
                                            <div className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400">
                                                {cert.category}
                                            </div>
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 leading-tight line-clamp-2">
                                        {cert.title}
                                    </h3>

                                    <div className="mb-4 space-y-1">
                                        <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                            {cert.issuer}
                                        </p>
                                        <p className="text-sm text-slate-400 dark:text-slate-500">
                                            {new Date(cert.date).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between mb-6">
                                        <div className="text-sm">
                                            <span className="text-slate-500 dark:text-slate-400">Points: </span>
                                            <span className="font-bold text-slate-900 dark:text-white">{cert.points}</span>
                                        </div>
                                        <div className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                                            {cert.certificateNo}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => generatePDF(cert)}
                                            disabled={generating === cert.id}
                                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {generating === cert.id ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Generating...
                                                </>
                                            ) : (
                                                <>
                                                    <Download className="w-4 h-4" /> Download PDF
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => generateQRCode(cert)}
                                            className="px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            <QrCode className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* QR Code Modal */}
            <AnimatePresence>
                {showQRModal && selectedCert && (
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setShowQRModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl"
                        >
                            <div className="text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <QrCode className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                    Verify Certificate
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 mb-6">
                                    {selectedCert.title}
                                </p>

                                {/* QR Code */}
                                <div className="bg-white p-4 rounded-2xl inline-block mb-6 shadow-lg">
                                    <img
                                        src={qrImage}
                                        alt="QR Code"
                                        className="w-64 h-64"
                                    />
                                </div>

                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                                    Scan this QR code to verify the authenticity of this certificate
                                </p>

                                <button
                                    onClick={() => setShowQRModal(false)}
                                    className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:opacity-90 transition-opacity"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
