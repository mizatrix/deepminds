"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import StudentStats from "@/components/StudentStats";
import ProfileCompletionBanner from "@/components/ProfileCompletionBanner";
import { ArrowRight, Trophy, FileCheck, Star, Eye, Clock, CheckCircle, XCircle, Edit2, Save, X as XIcon, Settings, Medal } from "lucide-react";
import Link from "next/link";
import { getSubmissionsByStudent } from "@/lib/actions/submissions";
import { type Submission } from "@/lib/submissions";
import { SkeletonDashboard } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import CustomizeModal from "@/components/dashboard/CustomizeModal";
import { getDashboardPreferences, DashboardPreferences, StatWidget } from "@/lib/dashboard/preferences";

export default function StudentDashboard() {
    const { data: session } = useSession();
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [editingSubmission, setEditingSubmission] = useState<Submission | null>(null);
    const [editFormData, setEditFormData] = useState<Partial<Submission>>({});
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [confirmAction, setConfirmAction] = useState<'edit' | 'save' | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [showCustomizeModal, setShowCustomizeModal] = useState(false);
    const [dashboardPrefs, setDashboardPrefs] = useState<DashboardPreferences | null>(null);

    useEffect(() => {
        if (session?.user?.email) {
            loadSubmissions();

            // Poll for updates every 30 seconds
            const intervalId = setInterval(() => {
                loadSubmissions();
            }, 30000);

            return () => clearInterval(intervalId);
        }
        // Load dashboard preferences
        const prefs = getDashboardPreferences();
        setDashboardPrefs(prefs);
    }, [session?.user?.email]);

    const loadSubmissions = async () => {
        setIsLoading(true);
        try {
            const userEmail = session?.user?.email;
            if (userEmail) {
                const userSubmissions = await getSubmissionsByStudent(userEmail);
                // Sort by most recent first
                const sorted = userSubmissions.sort((a, b) =>
                    new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
                );
                setSubmissions(sorted);
            }
        } catch (error) {
            console.error('Error loading submissions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = (status: Submission['status']) => {
        switch (status) {
            case 'approved':
                return "px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-xs font-bold border border-green-200 dark:border-green-800";
            case 'rejected':
                return "px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-full text-xs font-bold border border-red-200 dark:border-red-800";
            default:
                return "px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-full text-xs font-bold border border-amber-200 dark:border-amber-800";
        }
    };

    const getStatusIcon = (status: Submission['status']) => {
        switch (status) {
            case 'approved':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'rejected':
                return <XCircle className="w-4 h-4 text-red-600" />;
            default:
                return <Clock className="w-4 h-4 text-amber-600" />;
        }
    };

    const handleEditClick = (submission: Submission) => {
        setEditingSubmission(submission);
        setEditFormData(submission);
        setConfirmAction('edit');
        setShowConfirmDialog(true);
    };

    const handleConfirmEdit = () => {
        setShowConfirmDialog(false);
        // Modal will open automatically when editingSubmission is set
    };

    const handleSaveEdit = () => {
        setConfirmAction('save');
        setShowConfirmDialog(true);
    };

    const handleConfirmSave = () => {
        // Update the submission in local storage
        const allSubmissions = JSON.parse(localStorage.getItem('submissions') || '[]');
        const updatedSubmissions = allSubmissions.map((sub: Submission) =>
            sub.id === editingSubmission?.id ? { ...sub, ...editFormData } : sub
        );
        localStorage.setItem('submissions', JSON.stringify(updatedSubmissions));

        // Reload submissions
        loadSubmissions();

        // Close modals
        setShowConfirmDialog(false);
        setEditingSubmission(null);
        setEditFormData({});
    };

    const handleCancelEdit = () => {
        setEditingSubmission(null);
        setEditFormData({});
    };

    const handleInputChange = (field: keyof Submission, value: string) => {
        setEditFormData(prev => ({ ...prev, [field]: value }));
    };

    const totalPoints = submissions
        .filter(s => s.status === 'approved')
        .reduce((sum, s) => sum + (s.points || 0), 0);

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8 space-y-8">
                <SkeletonDashboard />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            {/* Profile Completion Banner */}
            <ProfileCompletionBanner />

            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold">
                        <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            My Dashboard
                        </span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Track your progress and manage Achievement(s) submissions</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowCustomizeModal(true)}
                        className="p-2.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-all group"
                        title="Customize Dashboard"
                    >
                        <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                    </button>
                    <Link
                        href="/student/certificates"
                        className="hidden sm:flex px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all items-center gap-2"
                    >
                        <Medal className="w-4 h-4 text-amber-500" />
                        My Certificates
                    </Link>
                    <Link
                        href="/"
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2"
                    >
                        New Submission <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {/* Stats Overview - Dynamic based on preferences */}
            {dashboardPrefs?.widgets && (
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${dashboardPrefs.widgets.filter(w => w.enabled).length >= 3 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
                    }`}>
                    {dashboardPrefs.widgets.filter(w => w.enabled).map((widget) => {
                        // Render each enabled widget
                        switch (widget.id) {
                            case 'total_submissions':
                                return (
                                    <div key={widget.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                                                <FileCheck className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{submissions.length}</p>
                                                <p className="text-xs text-slate-500">Total Submissions</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            case 'total_points':
                                return (
                                    <div key={widget.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                                                <Trophy className="w-5 h-5 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalPoints}</p>
                                                <p className="text-xs text-slate-500">Total Points</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            case 'approved':
                                return (
                                    <div key={widget.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                                    {submissions.filter(s => s.status === 'approved').length}
                                                </p>
                                                <p className="text-xs text-slate-500">Approved</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            case 'pending':
                                return (
                                    <div key={widget.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                                                <Clock className="w-5 h-5 text-amber-600" />
                                            </div>
                                            <div>
                                                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                                    {submissions.filter(s => s.status === 'pending').length}
                                                </p>
                                                <p className="text-xs text-slate-500">Pending</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            default:
                                return null;
                        }
                    })}
                </div>
            )}

            {/* Submissions List */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        My Submissions
                    </span>
                </h2>
                <div className="space-y-3">
                    {submissions.length === 0 ? (
                        <EmptyState
                            variant="submissions"
                            title="No Submissions Yet"
                            description="Start your journey to excellence by submitting your first achievement!"
                            actionLabel="Submit Achievement"
                            actionHref="/"
                        />
                    ) : (
                        submissions.map((submission) => (
                            <div
                                key={submission.id}
                                className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-900/50 transition-colors"
                            >
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            {getStatusIcon(submission.status)}
                                            <p className="font-bold text-slate-900 dark:text-white">{submission.title}</p>
                                        </div>
                                        <p className="text-xs text-slate-500 mb-2">
                                            {submission.category} • Submitted {new Date(submission.submittedAt).toLocaleDateString()}
                                        </p>
                                        {submission.status === 'approved' && submission.points && (
                                            <p className="text-sm font-bold text-green-600 dark:text-green-400">
                                                +{submission.points} points awarded
                                            </p>
                                        )}
                                        {submission.status === 'rejected' && submission.adminFeedback && (
                                            <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                                <p className="text-xs font-bold text-red-700 dark:text-red-400 mb-1">Admin Feedback:</p>
                                                <p className="text-sm text-red-600 dark:text-red-300">{submission.adminFeedback}</p>
                                            </div>
                                        )}
                                        {submission.status === 'approved' && submission.adminFeedback && (
                                            <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                                <p className="text-xs font-bold text-green-700 dark:text-green-400 mb-1">Admin Comment:</p>
                                                <p className="text-sm text-green-600 dark:text-green-300">{submission.adminFeedback}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={getStatusBadge(submission.status)}>
                                            {submission.status.toUpperCase()}
                                        </span>
                                        {submission.status === 'pending' && (
                                            <button
                                                onClick={() => handleEditClick(submission)}
                                                className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors group"
                                                title="Edit Submission"
                                            >
                                                <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setSelectedSubmission(submission)}
                                            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                            title="View Details"
                                        >
                                            <Eye className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Details Modal */}
            {selectedSubmission && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl p-8 space-y-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold">
                                    <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                        Submission Details
                                    </span>
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400">{selectedSubmission.title}</p>
                            </div>
                            <button
                                onClick={() => setSelectedSubmission(null)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                            >
                                <XCircle className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold uppercase text-slate-400">Category</label>
                                <p className="font-medium text-slate-900 dark:text-white">{selectedSubmission.category}</p>
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-slate-400">Status</label>
                                <p><span className={getStatusBadge(selectedSubmission.status)}>{selectedSubmission.status.toUpperCase()}</span></p>
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-slate-400">Organization</label>
                                <p className="font-medium text-slate-900 dark:text-white">{selectedSubmission.orgName}</p>
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-slate-400">Date</label>
                                <p className="font-medium text-slate-900 dark:text-white">
                                    {new Date(selectedSubmission.achievementDate).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase text-slate-400">Description</label>
                            <p className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl text-slate-700 dark:text-slate-300 text-sm mt-2">
                                {selectedSubmission.description}
                            </p>
                        </div>

                        {selectedSubmission.adminFeedback && (
                            <div>
                                <label className="text-xs font-bold uppercase text-slate-400">Admin Feedback</label>
                                <p className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl text-slate-700 dark:text-slate-300 text-sm mt-2">
                                    {selectedSubmission.adminFeedback}
                                </p>
                            </div>
                        )}

                        {selectedSubmission.points && (
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                                <p className="text-sm font-bold text-green-700 dark:text-green-400">
                                    Points Awarded: {selectedSubmission.points}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingSubmission && !showConfirmDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl p-8 space-y-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold">
                                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        Edit Submission
                                    </span>
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400">Update your achievement details</p>
                            </div>
                            <button
                                onClick={handleCancelEdit}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                            >
                                <XIcon className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={editFormData.title || ''}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Category</label>
                                <select
                                    value={editFormData.category || ''}
                                    onChange={(e) => handleInputChange('category', e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                >
                                    <option value="SCIENTIFIC">Scientific Research</option>
                                    <option value="ARTISTIC">Artistic</option>
                                    <option value="COMPETITION">Competition</option>
                                    <option value="HACKATHONS">Hackathons</option>
                                    <option value="AWARDS">Awards</option>
                                    <option value="SPORTS">Sports</option>
                                    <option value="INTERNSHIPS">Internships</option>
                                    <option value="VOLUNTEERING">Volunteering</option>
                                    <option value="ENTREPRENEURSHIP">Entrepreneurship</option>
                                    <option value="GLOBAL EXCHANGE">Global Exchange</option>
                                    <option value="SPECIAL TRAINING">Special Training</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Organization</label>
                                    <input
                                        type="text"
                                        value={editFormData.orgName || ''}
                                        onChange={(e) => handleInputChange('orgName', e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Location</label>
                                    <input
                                        type="text"
                                        value={editFormData.location || ''}
                                        onChange={(e) => handleInputChange('location', e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Achievement Date</label>
                                <input
                                    type="date"
                                    value={editFormData.achievementDate || ''}
                                    onChange={(e) => handleInputChange('achievementDate', e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Description</label>
                                <textarea
                                    value={editFormData.description || ''}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={handleCancelEdit}
                                className="flex-1 px-6 py-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl hover:shadow-xl hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
                            >
                                <Save className="w-5 h-5" />
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Dialog */}
            {showConfirmDialog && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl p-8">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-4">
                                {confirmAction === 'edit' ? (
                                    <Edit2 className="w-8 h-8 text-blue-600" />
                                ) : (
                                    <Save className="w-8 h-8 text-blue-600" />
                                )}
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                                {confirmAction === 'edit' ? 'Edit Submission?' : 'Save Changes?'}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400">
                                {confirmAction === 'edit'
                                    ? 'Are you sure you want to edit this submission?'
                                    : 'Are you sure you want to save these changes?'}
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirmDialog(false)}
                                className="flex-1 px-6 py-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmAction === 'edit' ? handleConfirmEdit : handleConfirmSave}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl hover:shadow-xl hover:shadow-blue-500/30 transition-all"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Customize Dashboard Modal */}
            <CustomizeModal
                isOpen={showCustomizeModal}
                onClose={() => setShowCustomizeModal(false)}
                onSave={(newPrefs) => setDashboardPrefs(newPrefs)}
            />
        </div>
    );
}
