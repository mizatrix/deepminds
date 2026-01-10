"use client";

import { useState, useEffect } from "react";
import { Search, FileText, CheckCircle, XCircle, Trash2, Filter } from "lucide-react";
import { getAuditLogs, type AuditLog } from "@/lib/submissions";

export default function AuditLogPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [filter, setFilter] = useState<"ALL" | "submit" | "approve" | "reject" | "delete">("ALL");
    const [search, setSearch] = useState("");

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = () => {
        const data = getAuditLogs();
        // Sort by most recent first
        const sorted = data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setLogs(sorted);
    };

    const filtered = logs.filter(log => {
        const matchesFilter = filter === "ALL" || log.action === filter;
        const matchesSearch =
            log.performedBy.toLowerCase().includes(search.toLowerCase()) ||
            log.submissionTitle.toLowerCase().includes(search.toLowerCase()) ||
            log.details.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getActionIcon = (action: AuditLog['action']) => {
        switch (action) {
            case 'submit': return <FileText className="w-4 h-4" />;
            case 'approve': return <CheckCircle className="w-4 h-4" />;
            case 'reject': return <XCircle className="w-4 h-4" />;
            case 'delete': return <Trash2 className="w-4 h-4" />;
        }
    };

    const getActionColor = (action: AuditLog['action']) => {
        switch (action) {
            case 'submit': return "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800";
            case 'approve': return "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800";
            case 'reject': return "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800";
            case 'delete': return "bg-slate-50 dark:bg-slate-900/20 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800";
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold">
                        <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                            Audit Log
                        </span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Track all submission-related activities.</p>
                </div>
                <div className="flex gap-2">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 flex items-center gap-2">
                        <Search className="w-4 h-4 text-slate-400" />
                        <input
                            placeholder="Search logs..."
                            className="bg-transparent outline-none text-sm w-40"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex bg-slate-100 dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-slate-800">
                        {(["ALL", "submit", "approve", "reject", "delete"] as const).map(f => (
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
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">Timestamp</th>
                                <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">Action</th>
                                <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">Performed By</th>
                                <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">Submission</th>
                                <th className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filtered.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900 dark:text-white">
                                            {new Date(log.timestamp).toLocaleDateString()}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            {new Date(log.timestamp).toLocaleTimeString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getActionColor(log.action)}`}>
                                            {getActionIcon(log.action)}
                                            {log.action.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900 dark:text-white">{log.performedBy}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900 dark:text-white max-w-xs truncate">
                                            {log.submissionTitle}
                                        </div>
                                        <div className="text-xs text-slate-500 font-mono">{log.submissionId}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-slate-600 dark:text-slate-400 max-w-md">
                                            {log.details}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filtered.length === 0 && (
                    <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                        No audit logs found matching your criteria.
                    </div>
                )}
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">About Audit Logs</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    All submission-related actions are automatically logged here. This includes student submissions,
                    admin approvals, rejections, and deletions. Logs are stored locally and cannot be modified.
                </p>
            </div>
        </div>
    );
}
