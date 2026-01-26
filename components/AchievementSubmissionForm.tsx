"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Trophy,
    Upload,
    Sparkles,
    ChevronRight,
    ChevronLeft,
    Save,
    CheckCircle2,
    Loader2,
    Calendar,
    Building,
    MapPin,
    Type,
    ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createSubmission, generateSubmissionId } from "@/lib/actions/submissions";
import { createEnhancedAuditLog } from "@/lib/audit-service";

const categories = [
    "SCIENTIFIC", "ARTISTIC", "SPECIAL TRAINING", "COMPETITION", "HACKATHONS", "AWARDS", "SPORTS",
    "INTERNSHIPS", "VOLUNTEERING", "ENTREPRENEURSHIP", "GLOBAL EXCHANGE", "OTHER"
];

// import { supabase } from "@/lib/supabase";
import { useSession } from "next-auth/react";
import { useToast } from "@/lib/ToastContext";
import { useRole } from "@/lib/RoleContext";
import { useRouter } from "next/navigation";

export default function StudentSubmissionForm() {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [uploading, setUploading] = useState(false);
    const { isAuthenticated } = useRole();
    const { data: session } = useSession();
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: "",
        category: "SCIENTIFIC",
        orgName: "",
        startDate: "",
        endDate: "",
        location: "",
        description: "",
        evidenceUrl: "",
        evidenceFileName: "",
        evidenceFileType: ""
    });
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);

    useEffect(() => {
        setIsMounted(true);

        // Restore form data from localStorage if available
        const savedData = localStorage.getItem('achievement_draft');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                setFormData(parsed);
                // Clear the saved data after restoring
                localStorage.removeItem('achievement_draft');
                showToast('Your progress has been restored!', 'success');
            } catch (error) {
                console.error('Error restoring form data:', error);
            }
        }
    }, []);

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const checkAuth = () => {
        if (!isAuthenticated) {
            // Save current form data to localStorage before redirecting
            try {
                localStorage.setItem('achievement_draft', JSON.stringify(formData));
                showToast("Please login to continue. Your progress will be saved!", "info");
            } catch (error) {
                console.error('Error saving form data:', error);
                showToast("Please login to continue", "error");
            }
            router.push("/login?redirect=/");
            return false;
        }
        return true;
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!checkAuth()) return;

        const file = e.target.files?.[0];
        if (!file) return;

        // Check file size (max 5MB for R2)
        const maxSizeMB = 5;
        if (file.size > maxSizeMB * 1024 * 1024) {
            showToast(`File too large. Maximum size is ${maxSizeMB}MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`, "error");
            return;
        }

        setUploading(true);
        try {
            // Upload via API route (server-side R2 upload)
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Upload failed');
            }

            setFormData(prev => ({
                ...prev,
                evidenceUrl: result.url,
                evidenceFileName: result.fileName,
                evidenceFileType: result.fileType
            }));
            showToast("File uploaded successfully!", "success");
        } catch (error: any) {
            console.error('Error uploading file:', error);
            showToast(error.message || "Error uploading file. Please try again.", "error");
        } finally {
            setUploading(false);
        }
    };

    const { showToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!checkAuth()) return;

        setIsSubmitting(true);

        try {
            console.log('=== SUBMISSION START ===');

            // Get user info from session
            const userEmail = session?.user?.email || 'student@example.com';
            const userName = session?.user?.name || 'Student User';
            console.log('User info:', { userEmail, userName });

            // Prepare submission data
            const submissionData = {
                studentEmail: userEmail,
                studentName: userName,
                title: formData.title,
                category: formData.category,
                orgName: formData.orgName,
                location: formData.location,
                achievementDate: formData.startDate,
                description: formData.description,
                evidenceUrl: formData.evidenceUrl || 'No evidence uploaded',
                evidenceFileName: formData.evidenceFileName,
                evidenceFileType: formData.evidenceFileType,
            };
            console.log('Submission data prepared:', submissionData);

            // Create submission in Supabase database (NOT localStorage)
            console.log('Calling createSubmission...');
            const submission = await createSubmission(submissionData);
            console.log('Submission created successfully:', submission.id);

            // Create enhanced audit log with device and location info (non-blocking)
            try {
                console.log('Creating audit log...');
                await createEnhancedAuditLog({
                    userEmail: userEmail,
                    userName: userName,
                    userRole: 'STUDENT',
                    action: 'submit',
                    targetType: 'submission',
                    targetId: submission.id,
                    targetTitle: formData.title,
                    details: `Submitted achievement: ${formData.title} (Category: ${formData.category})`
                });
                console.log('Audit log created');
            } catch (auditError) {
                // Don't block submission if audit logging fails
                console.error('Audit logging failed (non-critical):', auditError);
            }

            console.log('Setting success state...');
            setIsSubmitting(false);
            showToast("Achievement submitted successfully! Admins have been notified.", "success");
            setStep(4); // Success step
            console.log('=== SUBMISSION COMPLETE ===');

            // Reset form
            setFormData({
                title: "",
                category: "SCIENTIFIC",
                orgName: "",
                startDate: "",
                endDate: "",
                location: "",
                description: "",
                evidenceUrl: "",
                evidenceFileName: "",
                evidenceFileType: ""
            });
        } catch (error: any) {
            console.error('=== SUBMISSION FAILED ===');
            console.error('Error type:', error.constructor.name);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
            console.error('Full error object:', error);

            setIsSubmitting(false);
            const errorMessage = error.message || "Failed to submit achievement. Please try again.";
            showToast(errorMessage, "error");
        }
    };

    const stepVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 }
    };

    if (!isMounted) return null;

    return (
        <div className="w-full">
            {/* Progress Bar */}
            <div className="mb-8 relative px-2">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 rounded-full" />
                <div className="flex justify-between relative z-10">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500",
                                step >= i
                                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30 scale-110"
                                    : "bg-white dark:bg-slate-900 text-slate-400 border-2 border-slate-200 dark:border-slate-800"
                            )}
                        >
                            {step > i ? <CheckCircle2 className="w-6 h-6" /> : i}
                        </div>
                    ))}
                </div>
            </div>

            <motion.div
                layout
                className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/20 dark:border-slate-800/50 rounded-3xl sm:rounded-[2.5rem] shadow-2xl p-4 sm:p-6 md:p-12 overflow-hidden"
            >
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.form
                            key="step1"
                            variants={stepVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="space-y-8"
                            onSubmit={(e) => { e.preventDefault(); nextStep(); }}
                        >
                            <div className="space-y-2">
                                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                                    <Trophy className="w-8 h-8 text-purple-600" />
                                    Submit your Achievement(s) Details
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400">Tell us what you've accomplished.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                                        <Type className="w-4 h-4" /> Achievement Title
                                    </label>
                                    <input
                                        required
                                        placeholder="e.g. 1st Place at National Tech Hackathon"
                                        className="w-full bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2 relative">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Category</label>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                                            className="w-full bg-white/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-left flex items-center justify-between focus:ring-2 focus:ring-purple-500 outline-none transition-all hover:bg-white dark:hover:bg-slate-900"
                                        >
                                            <span className="font-medium text-slate-900 dark:text-white">{formData.category}</span>
                                            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isCategoryOpen ? "rotate-180" : ""}`} />
                                        </button>

                                        <AnimatePresence>
                                            {isCategoryOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                    className="absolute top-full mt-2 left-0 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto"
                                                >
                                                    {categories.map((c) => (
                                                        <button
                                                            key={c}
                                                            type="button"
                                                            onClick={() => {
                                                                setFormData({ ...formData, category: c });
                                                                setIsCategoryOpen(false);
                                                            }}
                                                            className={`w-full text-left px-5 py-3 text-sm font-bold transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${formData.category === c
                                                                ? "text-purple-600 bg-purple-50 dark:bg-purple-900/20"
                                                                : "text-slate-600 dark:text-slate-300"
                                                                }`}
                                                        >
                                                            {c}
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                                        <Building className="w-4 h-4" /> Issuing Organization
                                    </label>
                                    <input
                                        required
                                        placeholder="e.g. Ministry of Higher Education"
                                        className="w-full bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-purple-500 outline-none"
                                        value={formData.orgName}
                                        onChange={e => setFormData({ ...formData, orgName: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                                        <MapPin className="w-4 h-4" /> Location
                                    </label>
                                    <input
                                        required
                                        placeholder="e.g. Cairo, Egypt"
                                        className="w-full bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-purple-500 outline-none"
                                        value={formData.location}
                                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button type="submit" className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-2xl hover:shadow-lg hover:scale-105 shadow-blue-500/30 transition-all flex items-center gap-2 text-sm sm:text-base">
                                    Next Step <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.form>
                    )}

                    {step === 2 && (
                        <motion.form
                            key="step2"
                            variants={stepVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="space-y-8"
                            onSubmit={(e) => { e.preventDefault(); nextStep(); }}
                        >
                            <div className="space-y-2">
                                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                                    <Sparkles className="w-8 h-8 text-purple-600" />
                                    Timeline & Impact
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400">Describe your achievement's significance.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" /> Achievement is During the Period
                                </label>
                                <input
                                    required
                                    type="date"
                                    className="w-full bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-purple-500 outline-none"
                                    value={formData.startDate}
                                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-bold bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full shadow-lg">Professional Description</label>
                                </div>
                                <textarea
                                    required
                                    rows={5}
                                    placeholder="Describe your role and the outcome..."
                                    className="w-full bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="flex justify-between pt-4">
                                <button type="button" onClick={prevStep} className="px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-2">
                                    <ChevronLeft className="w-5 h-5" /> Back
                                </button>
                                <button type="submit" className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-2xl hover:shadow-lg hover:scale-105 shadow-blue-500/30 transition-all flex items-center gap-2">
                                    Next Step <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.form>
                    )}

                    {step === 3 && (
                        <motion.form
                            key="step3"
                            variants={stepVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="space-y-8"
                            onSubmit={handleSubmit}
                        >
                            <div className="space-y-2">
                                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                                    <Upload className="w-8 h-8 text-purple-600" />
                                    Proof & Review
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400">Upload certificates or media evidence.</p>
                            </div>

                            <label className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-[2rem] p-6 sm:p-12 flex flex-col items-center justify-center gap-4 bg-slate-50/50 dark:bg-slate-950/50 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors group cursor-pointer relative overflow-hidden">
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*,.pdf"
                                    onChange={handleFileUpload}
                                    disabled={uploading}
                                />
                                {uploading ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                                        <p className="text-sm font-bold text-slate-600">Uploading...</p>
                                    </div>
                                ) : formData.evidenceUrl ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">File Uploaded Successfully</p>
                                        <p className="text-xs text-slate-500">Click to replace</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Upload className="w-8 h-8 text-blue-600" />
                                        </div>
                                        <div className="text-center">
                                            <p className="font-bold text-slate-900 dark:text-white">Upload Evidence File</p>
                                            <p className="text-sm text-slate-500">PDF, JPG, or PNG (Max 10MB)</p>
                                        </div>
                                        <div className="mt-2 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400">
                                            Browse Files
                                        </div>
                                    </>
                                )}
                            </label>

                            <div className="p-6 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-800 flex gap-4">
                                <CheckCircle2 className="w-6 h-6 text-amber-600 shrink-0" />
                                <p className="text-sm text-amber-800 dark:text-amber-200">
                                    By submitting, you certify that all information is accurate. Admins will review your evidence before points are awarded.
                                </p>
                            </div>

                            <div className="flex justify-between pt-4">
                                <button type="button" onClick={prevStep} className="px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-2">
                                    <ChevronLeft className="w-5 h-5" /> Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || uploading}
                                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-2xl hover:shadow-lg hover:scale-105 shadow-blue-500/30 transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    Submit Achievement
                                </button>
                            </div>
                        </motion.form>
                    )}

                    {step === 4 && (
                        <motion.div
                            key="success"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-center py-12 space-y-6"
                        >
                            <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-12 h-12 text-green-600" />
                            </div>
                            <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white">Submission Successful!</h2>
                            <p className="text-lg text-slate-500 max-w-md mx-auto">
                                Your achievement has been sent for review. You'll receive a notification once it's approved.
                            </p>
                            <div className="pt-8">
                                <button
                                    onClick={() => setStep(1)}
                                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-2xl hover:shadow-lg hover:scale-105 transition-all"
                                >
                                    Submit Another
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
