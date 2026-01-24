"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Check, X, Search, Eye, Trash2, Calendar, Filter, Download, RefreshCw, ChevronDown } from "lucide-react";
import { useToast } from "@/lib/ToastContext";
import {
    getSubmissions,
    updateSubmission,
    deleteSubmission,
} from "@/lib/actions/submissions";
import { type Submission } from "@/lib/submissions";
import { createEnhancedAuditLog } from "@/lib/audit-service";
import BulkActionBar from "@/components/admin/BulkActionBar";
import { exportSubmissionsToCSV, exportSubmissionsToPDF } from "@/lib/admin/exportUtils";

// Get unique categories from submissions
const CATEGORIES = [
    "SCIENTIFIC", "ARTISTIC", "SPECIAL TRAINING", "COMPETITION", "HACKATHONS", "AWARDS", "SPORTS",
    "INTERNSHIPS", "VOLUNTEERING", "ENTREPRENEURSHIP", "GLOBAL EXCHANGE", "OTHER"
];

export default function SubmissionsPage() {
    const { data: session } = useSession();
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [filter, setFilter] = useState<"ALL" | "pending" | "approved" | "rejected">("ALL");
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
    const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
    const [showFilters, setShowFilters] = useState(false);
    const { showToast } = useToast();
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [feedback, setFeedback] = useState("");
    const [points, setPoints] = useState(10);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Effect to clear selection when filter changes
    useEffect(() => {
        setSelectedIds(new Set());
    }, [filter, search, categoryFilter, dateRange]);

    // Load submissions from database
    useEffect(() => {
        loadSubmissions();
    }, []);

    const loadSubmissions = async () => {
        const data = await getSubmissions();
        setSubmissions(data);
    };

    const handleApprove = async (submission: Submission) => {
        const adminEmail = session?.user?.email || 'admin@example.com';
        const adminName = session?.user?.name || 'Admin';

        await updateSubmission(submission.id, {
            status: 'approved',
            reviewedAt: new Date().toISOString(),
            reviewedBy: adminName,
            adminFeedback: feedback || 'Approved',
            points: points
        });

        await createEnhancedAuditLog({
            userEmail: adminEmail,
            userName: adminName,
            userRole: 'ADMIN',
            action: 'approve',
            targetType: 'submission',
            targetId: submission.id,
            targetTitle: submission.title,
            details: `Approved submission: ${submission.title} (${points} points awarded)`
        });

        showToast(`Submission approved! ${points} points awarded.`, "success");
        setSelectedSubmission(null);
        setFeedback("");
        setPoints(10);
        loadSubmissions();
    };

    const handleReject = async (submission: Submission) => {
        const adminEmail = session?.user?.email || 'admin@example.com';
        const adminName = session?.user?.name || 'Admin';

        await updateSubmission(submission.id, {
            status: 'rejected',
            reviewedAt: new Date().toISOString(),
            reviewedBy: adminName,
            adminFeedback: feedback || 'Rejected'
        });

        await createEnhancedAuditLog({
            userEmail: adminEmail,
            userName: adminName,
            userRole: 'ADMIN',
            action: 'reject',
            targetType: 'submission',
            targetId: submission.id,
            targetTitle: submission.title,
            details: `Rejected submission: ${submission.title}`
        });

        showToast("Submission rejected.", "info");
        setSelectedSubmission(null);
        setFeedback("");
        loadSubmissions();
    };

    const handleDelete = async (submission: Submission) => {
        if (!confirm(`Are you sure you want to delete "${submission.title}"?`)) return;

        const adminEmail = session?.user?.email || 'admin@example.com';
        const adminName = session?.user?.name || 'Admin';

        await deleteSubmission(submission.id);

        await createEnhancedAuditLog({
            userEmail: adminEmail,
            userName: adminName,
            userRole: 'ADMIN',
            action: 'delete',
            targetType: 'submission',
            targetId: submission.id,
            targetTitle: submission.title,
            details: `Deleted submission: ${submission.title}`
        });

        showToast("Submission deleted.", "success");
        setSelectedSubmission(null);
        loadSubmissions();
    };

    // Enhanced filtering with date range and category
    const filtered = useMemo(() => {
        return submissions.filter(s => {
            // Status filter
            const matchesFilter = filter === "ALL" || s.status === filter;

            // Search filter
            const matchesSearch =
                s.studentName.toLowerCase().includes(search.toLowerCase()) ||
                s.title.toLowerCase().includes(search.toLowerCase()) ||
                s.category.toLowerCase().includes(search.toLowerCase()) ||
                s.studentEmail.toLowerCase().includes(search.toLowerCase());

            // Category filter
            const matchesCategory = categoryFilter === "ALL" || s.category === categoryFilter;

            // Date range filter
            let matchesDate = true;
            if (dateRange.start) {
                const submissionDate = new Date(s.submittedAt);
                const startDate = new Date(dateRange.start);
                matchesDate = submissionDate >= startDate;
            }
            if (dateRange.end && matchesDate) {
                const submissionDate = new Date(s.submittedAt);
                const endDate = new Date(dateRange.end);
                endDate.setHours(23, 59, 59); // Include full end day
                matchesDate = submissionDate <= endDate;
            }

            return matchesFilter && matchesSearch && matchesCategory && matchesDate;
        });
    }, [submissions, filter, search, categoryFilter, dateRange]);

    // Bulk selection handlers
    const toggleSelectAll = () => {
        if (selectedIds.size === filtered.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filtered.map(s => s.id)));
        }
    };

    const toggleSelection = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleBulkApprove = async () => {
        if (!confirm(`Approve ${selectedIds.size} submissions? This will award 10 points to each.`)) return;

        const adminEmail = session?.user?.email || 'admin@example.com';
        const adminName = session?.user?.name || 'Admin';
        const timestamp = new Date().toISOString();

        for (const id of selectedIds) {
            const submission = submissions.find(s => s.id === id);
            if (submission && submission.status === 'pending') {
                updateSubmission(id, {
                    status: 'approved',
                    reviewedAt: timestamp,
                    reviewedBy: adminName,
                    adminFeedback: 'Bulk Approved',
                    points: 10
                });
                await createEnhancedAuditLog({
                    userEmail: adminEmail,
                    userName: adminName,
                    userRole: 'ADMIN',
                    action: 'approve',
                    targetType: 'submission',
                    targetId: id,
                    targetTitle: submission.title,
                    details: `Bulk approved: ${submission.title}`
                });
            }
        }

        showToast(`Approved ${selectedIds.size} submissions`, "success");
        setSelectedIds(new Set());
        loadSubmissions();
    };

    const handleBulkReject = async () => {
        if (!confirm(`Reject ${selectedIds.size} submissions?`)) return;

        const adminEmail = session?.user?.email || 'admin@example.com';
        const adminName = session?.user?.name || 'Admin';
        const timestamp = new Date().toISOString();

        for (const id of selectedIds) {
            const submission = submissions.find(s => s.id === id);
            if (submission && submission.status === 'pending') {
                updateSubmission(id, {
                    status: 'rejected',
                    reviewedAt: timestamp,
                    reviewedBy: adminName,
                    adminFeedback: 'Bulk Rejected'
                });
                await createEnhancedAuditLog({
                    userEmail: adminEmail,
                    userName: adminName,
                    userRole: 'ADMIN',
                    action: 'reject',
                    targetType: 'submission',
                    targetId: id,
                    targetTitle: submission.title,
                    details: `Bulk rejected: ${submission.title}`
                });
            }
        }

        showToast(`Rejected ${selectedIds.size} submissions`, "info");
        setSelectedIds(new Set());
        loadSubmissions();
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Permanently delete ${selectedIds.size} submissions? This action cannot be undone.`)) return;

        const adminEmail = session?.user?.email || 'admin@example.com';
        const adminName = session?.user?.name || 'Admin';

        for (const id of selectedIds) {
            const submission = submissions.find(s => s.id === id);
            if (submission) {
                deleteSubmission(id);
                await createEnhancedAuditLog({
                    userEmail: adminEmail,
                    userName: adminName,
                    userRole: 'ADMIN',
                    action: 'delete',
                    targetType: 'submission',
                    targetId: id,
                    targetTitle: submission.title,
                    details: `Bulk deleted: ${submission.title}`
                });
            }
        }

        showToast(`Deleted ${selectedIds.size} submissions`, "success");
        setSelectedIds(new Set());
        loadSubmissions();
    };

    const handleExportCSV = () => {
        const selectedSubmissions = submissions.filter(s => selectedIds.has(s.id));
        exportSubmissionsToCSV(selectedSubmissions.length > 0 ? selectedSubmissions : filtered);
    };

    const handleExportPDF = () => {
        const selectedSubmissions = submissions.filter(s => selectedIds.has(s.id));
        exportSubmissionsToPDF(selectedSubmissions.length > 0 ? selectedSubmissions : filtered);
    };

    const clearFilters = () => {
        setFilter("ALL");
        setSearch("");
        setCategoryFilter("ALL");
        setDateRange({ start: '', end: '' });
    };

    const hasActiveFilters = filter !== "ALL" || search !== "" || categoryFilter !== "ALL" || dateRange.start !== "" || dateRange.end !== "";

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-bold">
                            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                Review Submissions
                            </span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">Validate student achievements and award points.</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={loadSubmissions}
                            className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            title="Refresh"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors ${showFilters || hasActiveFilters
                                ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-600'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                                }`}
                        >
                            <Filter className="w-4 h-4" />
                            Filters
                            {hasActiveFilters && (
                                <span className="w-2 h-2 rounded-full bg-purple-600" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Expanded Filters Panel */}
                {showFilters && (
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Search */}
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        placeholder="Search by name, email, title..."
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Status Filter */}
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Status</label>
                                <select
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value as typeof filter)}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                >
                                    <option value="ALL">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>

                            {/* Category Filter */}
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-400 mb-2">Category</label>
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                >
                                    <option value="ALL">All Categories</option>
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Clear Filters */}
                            <div className="flex items-end">
                                <button
                                    onClick={clearFilters}
                                    disabled={!hasActiveFilters}
                                    className="w-full px-4 py-2.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>

                        {/* Date Range */}
                        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                            <Calendar className="w-5 h-5 text-slate-400" />
                            <span className="text-sm text-slate-500 font-medium">Date Range:</span>
                            <div className="flex items-center gap-2">
                                <input
                                    type="date"
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                    className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                />
                                <span className="text-slate-400">to</span>
                                <input
                                    type="date"
                                    value={dateRange.end}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                    className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                />
                            </div>
                            <span className="text-sm text-slate-500 ml-auto">
                                Showing {filtered.length} of {submissions.length} submissions
                            </span>
                        </div>
                    </div>
                )}

                {/* Quick Status Tabs (always visible) */}
                <div className="flex gap-2">
                    <div className="flex bg-slate-100 dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-slate-800">
                        {(["ALL", "pending", "approved", "rejected"] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === f
                                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
                                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                    }`}
                            >
                                {f.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                            <th className="px-6 py-4 w-12">
                                <input
                                    type="checkbox"
                                    checked={filtered.length > 0 && selectedIds.size === filtered.length}
                                    onChange={toggleSelectAll}
                                    className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                                />
                            </th>
                            <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">Student</th>
                            <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">Achievement</th>
                            <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">Date</th>
                            <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">Status</th>
                            <th className="px-6 py-4 text-right font-bold text-slate-700 dark:text-slate-300">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filtered.map((submission) => (
                            <tr key={submission.id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors ${selectedIds.has(submission.id) ? 'bg-purple-50/50 dark:bg-purple-900/10' : ''}`}>
                                <td className="px-6 py-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.has(submission.id)}
                                        onChange={() => toggleSelection(submission.id)}
                                        className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-900 dark:text-white">{submission.studentName}</div>
                                    <div className="text-xs text-slate-500">{submission.studentEmail}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-slate-900 dark:text-white">{submission.title}</div>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 mt-1">
                                        {submission.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-medium">
                                    {new Date(submission.achievementDate).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${submission.status === 'approved' ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800" :
                                        submission.status === 'rejected' ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800" :
                                            "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                                        }`}>
                                        {submission.status.toUpperCase()}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => {
                                                setSelectedSubmission(submission);
                                                setFeedback(submission.adminFeedback || "");
                                                setPoints(submission.points || 10);
                                            }}
                                            className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                                            title="View Details"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        {submission.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleApprove(submission)}
                                                    className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                                                    title="Approve"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleReject(submission)}
                                                    className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                                                    title="Reject"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                        <button
                                            onClick={() => handleDelete(submission)}
                                            className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filtered.length === 0 && (
                    <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                        No submissions found matching your criteria.
                    </div>
                )}
            </div>

            {/* Details Modal */}
            {selectedSubmission && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="overflow-y-auto p-8 space-y-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold">
                                        <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                            Submission Details
                                        </span>
                                    </h2>
                                    <p className="text-slate-500 dark:text-slate-400">Reviewing entry for {selectedSubmission.studentName}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedSubmission(null);
                                        setFeedback("");
                                    }}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                                >
                                    <X className="w-6 h-6 text-slate-400" />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-slate-400">Title</label>
                                    <p className="font-medium text-slate-900 dark:text-slate-100">{selectedSubmission.title}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-slate-400">Category</label>
                                    <p className="font-medium text-slate-900 dark:text-slate-100">{selectedSubmission.category}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-slate-400">Organization</label>
                                    <p className="font-medium text-slate-900 dark:text-slate-100">{selectedSubmission.orgName}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-slate-400">Location</label>
                                    <p className="font-medium text-slate-900 dark:text-slate-100">{selectedSubmission.location}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-slate-400">Date</label>
                                    <p className="font-medium text-slate-900 dark:text-slate-100">{new Date(selectedSubmission.achievementDate).toLocaleDateString()}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-slate-400">Status</label>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${selectedSubmission.status === 'approved' ? "bg-green-100 text-green-700" :
                                        selectedSubmission.status === 'rejected' ? "bg-red-100 text-red-700" :
                                            "bg-amber-100 text-amber-700"
                                        }`}>
                                        {selectedSubmission.status.toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-400">Description</label>
                                <p className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl text-slate-700 dark:text-slate-300 text-sm leading-relaxed border border-slate-100 dark:border-slate-800">
                                    {selectedSubmission.description}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-slate-400">Evidence</label>
                                {selectedSubmission.evidenceUrl && selectedSubmission.evidenceUrl !== 'No evidence uploaded' ? (
                                    <div className="border-2 border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                                        {selectedSubmission.evidenceFileType?.startsWith('image/') ? (
                                            <img
                                                src={selectedSubmission.evidenceUrl}
                                                alt="Evidence"
                                                className="w-full h-auto max-h-96 object-contain bg-slate-50 dark:bg-slate-950"
                                            />
                                        ) : selectedSubmission.evidenceFileType === 'application/pdf' ? (
                                            <div className="p-4 bg-slate-50 dark:bg-slate-950">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                                                        <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                                            <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                                                        </svg>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-medium text-slate-900 dark:text-white">{selectedSubmission.evidenceFileName || 'Evidence.pdf'}</p>
                                                        <p className="text-xs text-slate-500">PDF Document</p>
                                                    </div>
                                                </div>
                                                <iframe
                                                    src={selectedSubmission.evidenceUrl}
                                                    className="w-full h-96 rounded-lg border border-slate-200 dark:border-slate-700"
                                                    title="PDF Preview"
                                                />
                                            </div>
                                        ) : (
                                            <div className="p-6 bg-slate-50 dark:bg-slate-950 text-center">
                                                <div className="w-16 h-16 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mx-auto mb-3">
                                                    <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                                <p className="font-medium text-slate-900 dark:text-white mb-1">{selectedSubmission.evidenceFileName || 'Uploaded File'}</p>
                                                <p className="text-sm text-slate-500 mb-3">{selectedSubmission.evidenceFileType || 'File'}</p>
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            //Check if file exists
                                                            const response = await fetch(selectedSubmission.evidenceUrl!, { method: 'HEAD' });
                                                            if (!response.ok) {
                                                                showToast('File not found. This file may have been deleted or moved.', 'error');
                                                                return;
                                                            }
                                                            // File exists, proceed with download
                                                            const link = document.createElement('a');
                                                            link.href = selectedSubmission.evidenceUrl!;
                                                            link.download = selectedSubmission.evidenceFileName || 'evidence';
                                                            link.click();
                                                        } catch (error) {
                                                            showToast('Unable to download file. Please try again later.', 'error');
                                                        }
                                                    }}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium cursor-pointer"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                    </svg>
                                                    Download File
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-xl text-center text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800">
                                        No evidence uploaded
                                    </div>
                                )}
                            </div>

                            {selectedSubmission.status === 'pending' && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-slate-400">Points to Award</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={points}
                                            onChange={(e) => setPoints(parseInt(e.target.value))}
                                            className="w-full p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-slate-400">Admin Feedback</label>
                                        <textarea
                                            className="w-full p-3 bg-slate-50 dark:bg-slate-950/50 rounded-xl text-slate-700 dark:text-slate-300 text-sm border border-slate-100 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            rows={3}
                                            placeholder="Provide feedback..."
                                            value={feedback}
                                            onChange={(e) => setFeedback(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <button
                                            onClick={() => handleApprove(selectedSubmission)}
                                            className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all"
                                        >
                                            Approve & Award {points} Points
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (!feedback.trim()) {
                                                    showToast("Please provide feedback for rejection.", "error");
                                                    return;
                                                }
                                                handleReject(selectedSubmission);
                                            }}
                                            className="flex-1 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 font-bold rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </>
                            )}

                            {selectedSubmission.adminFeedback && selectedSubmission.status !== 'pending' && (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-slate-400">Admin Feedback</label>
                                    <p className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl text-slate-700 dark:text-slate-300 text-sm leading-relaxed border border-slate-100 dark:border-slate-800">
                                        {selectedSubmission.adminFeedback}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Action Bar */}
            <BulkActionBar
                selectedCount={selectedIds.size}
                onApproveAll={handleBulkApprove}
                onRejectAll={handleBulkReject}
                onDeleteAll={handleBulkDelete}
                onExportCSV={handleExportCSV}
                onExportPDF={handleExportPDF}
                onClearSelection={() => setSelectedIds(new Set())}
            />
        </div>
    );
}
