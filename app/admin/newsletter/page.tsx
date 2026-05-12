"use client";

import { useState, useEffect } from "react";
import { Mail, Search, Trash2, ArrowUpDown, Activity, Download, Users, UserCheck, UserX, CalendarDays, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { useToast } from "@/lib/ToastContext";
import {
    getNewsletterSubscribers,
    deleteNewsletterSubscriber,
    toggleNewsletterSubscriber,
    type NewsletterSubscriberData,
} from "@/lib/actions/newsletter";

export default function NewsletterPage() {
    const { showToast } = useToast();
    const [subscribers, setSubscribers] = useState<NewsletterSubscriberData[]>([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"ALL" | "Active" | "Inactive">("ALL");
    const [sortBy, setSortBy] = useState<"email" | "subscribedAt">("subscribedAt");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const data = await getNewsletterSubscribers();
        setSubscribers(data);
    };

    const filtered = subscribers
        .filter((s) => {
            const matchesSearch = s.email.toLowerCase().includes(search.toLowerCase());
            const matchesStatus =
                statusFilter === "ALL" ||
                (statusFilter === "Active" && s.isActive) ||
                (statusFilter === "Inactive" && !s.isActive);
            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            let cmp = 0;
            if (sortBy === "email") cmp = a.email.localeCompare(b.email);
            else cmp = new Date(a.subscribedAt).getTime() - new Date(b.subscribedAt).getTime();
            return sortDir === "asc" ? cmp : -cmp;
        });

    // Pagination calculations
    const totalFiltered = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
    const safePage = Math.min(currentPage, totalPages);
    const startIndex = (safePage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalFiltered);
    const paginatedItems = filtered.slice(startIndex, endIndex);

    const getPageNumbers = () => {
        const pages: number[] = [];
        const maxVisible = 5;
        let start = Math.max(1, safePage - Math.floor(maxVisible / 2));
        const end = Math.min(totalPages, start + maxVisible - 1);
        start = Math.max(1, end - maxVisible + 1);
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    };

    const handleSort = (field: typeof sortBy) => {
        if (sortBy === field) {
            setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortBy(field);
            setSortDir("asc");
        }
    };

    const handleToggle = async (id: string) => {
        const result = await toggleNewsletterSubscriber(id);
        if (result.success) {
            showToast(`Subscriber ${result.isActive ? "activated" : "deactivated"}.`, "success");
            loadData();
        } else {
            showToast(result.error || "Failed to toggle status.", "error");
        }
    };

    const handleDelete = async (id: string) => {
        const sub = subscribers.find((s) => s.id === id);
        if (!sub) return;
        if (!confirm(`Delete subscriber "${sub.email}"? This cannot be undone.`)) return;

        const result = await deleteNewsletterSubscriber(id);
        if (result.success) {
            showToast(`"${sub.email}" removed.`, "success");
            loadData();
        } else {
            showToast(result.error || "Failed to delete subscriber.", "error");
        }
    };

    const handleExportCSV = () => {
        const rows = [["Email", "Subscribed At", "Status"]];
        subscribers.forEach((s) => {
            rows.push([
                s.email,
                new Date(s.subscribedAt).toISOString(),
                s.isActive ? "Active" : "Inactive",
            ]);
        });
        const csv = rows.map((r) => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `newsletter-subscribers-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        showToast("CSV exported successfully!", "success");
    };

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const stats = {
        total: subscribers.length,
        active: subscribers.filter((s) => s.isActive).length,
        inactive: subscribers.filter((s) => !s.isActive).length,
        thisMonth: subscribers.filter((s) => new Date(s.subscribedAt) >= thisMonthStart).length,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">
                        <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            Newsletter Subscribers
                        </span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Manage email subscriptions from the website footer.
                    </p>
                </div>
                <button
                    onClick={handleExportCSV}
                    disabled={subscribers.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:hover:bg-purple-600"
                >
                    <Download className="w-4 h-4" />
                    Export CSV
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                            <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                            <p className="text-xs text-slate-500">Total</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                            <UserCheck className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                            <p className="text-xs text-slate-500">Active</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                            <UserX className="w-5 h-5 text-slate-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.inactive}</p>
                            <p className="text-xs text-slate-500">Inactive</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                            <CalendarDays className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-purple-600">{stats.thisMonth}</p>
                            <p className="text-xs text-slate-500">This Month</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            placeholder="Search by email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                        />
                    </div>
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                    className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm"
                >
                    <option value="ALL">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>
            </div>

            {/* Subscribers Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4 text-left">
                                    <button
                                        onClick={() => handleSort("email")}
                                        className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300 hover:text-purple-600"
                                    >
                                        Email
                                        <ArrowUpDown className="w-3 h-3" />
                                    </button>
                                </th>
                                <th className="px-6 py-4 text-left">
                                    <button
                                        onClick={() => handleSort("subscribedAt")}
                                        className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300 hover:text-purple-600"
                                    >
                                        Subscribed
                                        <ArrowUpDown className="w-3 h-3" />
                                    </button>
                                </th>
                                <th className="px-6 py-4 text-left font-bold text-slate-700 dark:text-slate-300">Status</th>
                                <th className="px-6 py-4 text-right font-bold text-slate-700 dark:text-slate-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {paginatedItems.map((sub) => (
                                <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-100 dark:bg-purple-900/20">
                                                <Mail className="w-5 h-5 text-purple-600" />
                                            </div>
                                            <p className="font-bold text-slate-900 dark:text-white">{sub.email}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                        {new Date(sub.subscribedAt).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric",
                                        })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${sub.isActive
                                                    ? "bg-green-100 dark:bg-green-900/20 text-green-600"
                                                    : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                                                }`}
                                        >
                                            {sub.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-end gap-1">
                                            <button
                                                onClick={() => handleToggle(sub.id)}
                                                className={`p-2 rounded-lg transition-colors ${sub.isActive
                                                        ? "text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                                                        : "text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                                                    }`}
                                                title={sub.isActive ? "Deactivate" : "Activate"}
                                            >
                                                <Activity className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(sub.id)}
                                                className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                title="Delete Subscriber"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {paginatedItems.length === 0 && (
                    <div className="p-12 text-center text-slate-500">
                        {subscribers.length === 0
                            ? "No newsletter subscribers yet."
                            : "No subscribers found matching your criteria."}
                    </div>
                )}

                {/* Pagination Bar */}
                {totalFiltered > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
                        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                            <span>
                                Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{startIndex + 1}</span>–<span className="font-semibold text-slate-700 dark:text-slate-200">{endIndex}</span> of{" "}
                                <span className="font-semibold text-slate-700 dark:text-slate-200">{totalFiltered}</span> subscribers
                            </span>
                            <div className="flex items-center gap-2">
                                <label htmlFor="nlPageSize" className="text-xs">Per page:</label>
                                <select
                                    id="nlPageSize"
                                    value={pageSize}
                                    onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                                    className="px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                                >
                                    <option value={10}>10</option>
                                    <option value={20}>20</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setCurrentPage(1)} disabled={safePage <= 1} className={`p-2 rounded-lg transition-colors ${safePage <= 1 ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed' : 'text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20'}`} title="First page"><ChevronsLeft className="w-4 h-4" /></button>
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={safePage <= 1} className={`p-2 rounded-lg transition-colors ${safePage <= 1 ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed' : 'text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20'}`} title="Previous page"><ChevronLeft className="w-4 h-4" /></button>
                            {getPageNumbers().map(page => (
                                <button key={page} onClick={() => setCurrentPage(page)} className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${page === safePage ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20' : 'text-slate-600 dark:text-slate-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600'}`}>{page}</button>
                            ))}
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={safePage >= totalPages} className={`p-2 rounded-lg transition-colors ${safePage >= totalPages ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed' : 'text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20'}`} title="Next page"><ChevronRight className="w-4 h-4" /></button>
                            <button onClick={() => setCurrentPage(totalPages)} disabled={safePage >= totalPages} className={`p-2 rounded-lg transition-colors ${safePage >= totalPages ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed' : 'text-slate-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20'}`} title="Last page"><ChevronsRight className="w-4 h-4" /></button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
