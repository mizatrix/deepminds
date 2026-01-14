"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Award, Download, ExternalLink, QrCode } from "lucide-react";
import jsPDF from "jspdf";
import { EmptyState } from "@/components/ui/EmptyState";

// Mock Data for certificates
const certificates = [
    {
        id: "CERT-2024-001",
        title: "1st Place - National AI Hackathon",
        category: "Scientific",
        date: "2024-03-15",
        recipient: "Moataz Mohamed",
        issuer: "Ministry of Higher Education",
    },
    {
        id: "CERT-2023-089",
        title: "Best Mobile App Design",
        category: "Artistic",
        date: "2023-11-20",
        recipient: "Moataz Mohamed",
        issuer: "University Arts Club",
    }
];

// Set to true to test empty state
const showEmptyState = false;
const displayCertificates = showEmptyState ? [] : certificates;

export default function CertificatesPage() {
    const [generating, setGenerating] = useState<string | null>(null);
    const [qrImage, setQrImage] = useState<string>("");
    const [showQRModal, setShowQRModal] = useState(false);
    const [selectedCert, setSelectedCert] = useState<typeof certificates[0] | null>(null);

    const generateQRCode = async (cert: typeof certificates[0]) => {
        try {
            // Generate QR code with verification URL
            const verificationUrl = `${window.location.origin}/verify/${cert.id}`;

            // Import QRCode dynamically
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

    const generatePDF = async (cert: typeof certificates[0]) => {
        setGenerating(cert.id);

        // Simulate generation delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const doc = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a4",
        });

        // Background (simulated with a colored rect)
        doc.setFillColor(250, 250, 255);
        doc.rect(0, 0, 297, 210, "F");

        // Border
        doc.setLineWidth(2);
        doc.setDrawColor(59, 130, 246); // Blue-500
        doc.rect(10, 10, 277, 190);

        // Decorative Header
        doc.setFillColor(59, 130, 246);
        doc.rect(0, 0, 297, 40, "F");

        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(30);
        doc.text("CERTIFICATE OF EXCELLENCE", 148.5, 25, { align: "center" });

        // Content
        doc.setTextColor(60, 60, 60);
        doc.setFontSize(16);
        doc.text("This certificate is proudly presented to", 148.5, 70, { align: "center" });

        doc.setTextColor(30, 58, 138); // Dark Blue
        doc.setFont("times", "bolditalic");
        doc.setFontSize(40);
        doc.text(cert.recipient, 148.5, 90, { align: "center" });

        doc.setTextColor(60, 60, 60);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(16);
        doc.text("For outstanding achievement in the category of", 148.5, 110, { align: "center" });

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text(cert.category, 148.5, 125, { align: "center" });

        doc.setFontSize(14);
        doc.setFont("helvetica", "normal");
        doc.text(`Awarded for: ${cert.title}`, 148.5, 140, { align: "center" });

        doc.text(`Date: ${cert.date}`, 50, 170);
        doc.text(`Issuer: ${cert.issuer}`, 200, 170);

        // QR Code Placeholder (In real app, generate QR image data url and add here)
        // doc.addImage(qrDataUrl, 'PNG', 133.5, 155, 30, 30);
        doc.setDrawColor(0, 0, 0);
        doc.rect(133.5, 155, 30, 30);
        doc.setFontSize(10);
        doc.text("Scan to Verify", 148.5, 190, { align: "center" });

        doc.save(`${cert.id}.pdf`);
        setGenerating(null);
    };

    return (
        <div className="container mx-auto px-4 py-12 min-h-screen">
            <div className="mb-12">
                <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4">My Certificates</h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg">
                    Download and share your verifiable proofs of achievement.
                </p>
            </div>

            {displayCertificates.length === 0 ? (
                <EmptyState
                    variant="certificates"
                    title="No Certificates Yet"
                    description="Complete approved achievements to earn verifiable certificates of excellence!"
                    actionLabel="Submit Achievement"
                    actionHref="/"
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {displayCertificates.map((cert) => (
                        <motion.div
                            key={cert.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                        >
                            {/* Decorative BG */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-blue-900/20 rounded-bl-[4rem] z-0 transition-transform group-hover:scale-110" />

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                                        <Award className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-400">
                                        {cert.category}
                                    </div>
                                </div>

                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                                    {cert.title}
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 mb-6 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                    {cert.issuer}
                                </p>

                                <div className="flex items-center gap-3 mt-auto">
                                    <button
                                        onClick={() => generatePDF(cert)}
                                        disabled={generating === cert.id}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {generating === cert.id ? (
                                            "Generating..."
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
                    ))}
                </div>
            )}

            {/* QR Code Modal */}
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
        </div>
    );
}
