'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Filter,
    ChevronDown,
    ChevronUp,
    Monitor,
    Smartphone,
    Tablet,
    Globe,
    Clock,
    User,
    Activity,
    Download,
    RefreshCw,
    Calendar
} from 'lucide-react';
import { getAuditLogs, type AuditLog } from '@/lib/submissions';
import { formatAuditAction, getAuditActionColor } from '@/lib/audit-service';

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [actionFilter, setActionFilter] = useState<string>('all');
    const [deviceFilter, setDeviceFilter] = useState<string>('all');
    const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
        start: '',
        end: ''
    });

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = () => {
        setLoading(true);
        const allLogs = getAuditLogs();
        // Sort by most recent first
        setLogs(allLogs.sort((a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ));
        setLoading(false);
    };

    // Filtered logs
    const filteredLogs = useMemo(() => {
        return logs.filter(log => {
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesSearch =
                    log.userEmail?.toLowerCase().includes(query) ||
                    log.userName?.toLowerCase().includes(query) ||
                    log.details?.toLowerCase().includes(query) ||
                    log.targetTitle?.toLowerCase().includes(query);
                if (!matchesSearch) return false;
            }

            // Action filter
            if (actionFilter !== 'all' && log.action !== actionFilter) {
                return false;
            }

            // Device filter
            if (deviceFilter !== 'all' && log.deviceType !== deviceFilter) {
                return false;
            }

            // Date range filter
            if (dateRange.start) {
                const logDate = new Date(log.timestamp);
                const startDate = new Date(dateRange.start);
                if (logDate < startDate) return false;
            }
            if (dateRange.end) {
                const logDate = new Date(log.timestamp);
                const endDate = new Date(dateRange.end);
                endDate.setHours(23, 59, 59); // Include full end day
                if (logDate > endDate) return false;
            }

            return true;
        });
    }, [logs, searchQuery, actionFilter, deviceFilter, dateRange]);

    const getDeviceIcon = (deviceType: string) => {
        switch (deviceType) {
            case 'mobile': return <Smartphone className="w-4 h-4" />;
            case 'tablet': return <Tablet className="w-4 h-4" />;
            default: return <Monitor className="w-4 h-4" />;
        }
    };

    const formatDate = (timestamp: string) => {
        return new Date(timestamp).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    };

    const exportToCSV = () => {
        const headers = ['Timestamp', 'User', 'Email', 'Role', 'Action', 'Details', 'Device', 'Browser', 'OS', 'Location', 'IP'];
        const rows = filteredLogs.map(log => [
            log.timestamp,
            log.userName || '',
            log.userEmail || '',
            log.userRole || '',
            log.action,
            log.details || '',
            log.deviceType || '',
            `${log.browser || ''} ${log.browserVersion || ''}`,
            log.os || '',
            `${log.city || ''}, ${log.country || ''}`,
            log.ipAddress || ''
        ]);

        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const clearFilters = () => {
        setSearchQuery('');
        setActionFilter('all');
        setDeviceFilter('all');
        setDateRange({ start: '', end: '' });
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Audit Logs</h1>
                    <p className="text-slate-500">Track all system activities and user actions</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={loadLogs}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                    <button
                        onClick={exportToCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Search */}
                    <div className="lg:col-span-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by user, email, or details..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                            />
                        </div>
                    </div>

                    {/* Action Filter */}
                    <div>
                        <select
                            value={actionFilter}
                            onChange={(e) => setActionFilter(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                        >
                            <option value="all">All Actions</option>
                            <option value="login">Login</option>
                            <option value="logout">Logout</option>
                            <option value="submit">Submit</option>
                            <option value="approve">Approve</option>
                            <option value="reject">Reject</option>
                            <option value="delete">Delete</option>
                        </select>
                    </div>

                    {/* Device Filter */}
                    <div>
                        <select
                            value={deviceFilter}
                            onChange={(e) => setDeviceFilter(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                        >
                            <option value="all">All Devices</option>
                            <option value="desktop">Desktop</option>
                            <option value="mobile">Mobile</option>
                            <option value="tablet">Tablet</option>
                        </select>
                    </div>

                    {/* Clear Filters */}
                    <div>
                        <button
                            onClick={clearFilters}
                            className="w-full px-4 py-2.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>

                {/* Date Range */}
                <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <Calendar className="w-5 h-5 text-slate-400" />
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
                    <span className="text-sm text-slate-500">
                        Showing {filteredLogs.length} of {logs.length} logs
                    </span>
                </div>
            </div>

            {/* Logs List */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-slate-500">
                        Loading audit logs...
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div className="p-12 text-center">
                        <Activity className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500">No audit logs found</p>
                        <p className="text-sm text-slate-400 mt-1">
                            {logs.length === 0
                                ? "Activity logs will appear here as users interact with the system"
                                : "Try adjusting your filters"
                            }
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                        {filteredLogs.map((log) => (
                            <motion.div
                                key={log.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                            >
                                {/* Main Row */}
                                <div
                                    className="p-4 cursor-pointer flex items-center gap-4"
                                    onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                                >
                                    {/* Action Badge */}
                                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getAuditActionColor(log.action)}`}>
                                        {formatAuditAction(log.action)}
                                    </span>

                                    {/* User Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-slate-400" />
                                            <span className="font-medium text-slate-900 dark:text-white">
                                                {log.userName || 'Unknown'}
                                            </span>
                                            <span className="text-sm text-slate-500">
                                                ({log.userEmail})
                                            </span>
                                            {log.userRole && (
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${log.userRole === 'ADMIN'
                                                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                    }`}>
                                                    {log.userRole}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-500 truncate mt-1">
                                            {log.details}
                                        </p>
                                    </div>

                                    {/* Device & Time */}
                                    <div className="hidden md:flex items-center gap-4 text-sm text-slate-500">
                                        <span className="flex items-center gap-1">
                                            {getDeviceIcon(log.deviceType || 'desktop')}
                                            {log.browser}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Globe className="w-4 h-4" />
                                            {log.city}, {log.country}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <Clock className="w-4 h-4" />
                                        {formatDate(log.timestamp)}
                                    </div>

                                    {/* Expand Icon */}
                                    {expandedId === log.id ? (
                                        <ChevronUp className="w-5 h-5 text-slate-400" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-slate-400" />
                                    )}
                                </div>

                                {/* Expanded Details */}
                                <AnimatePresence>
                                    {expandedId === log.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-4 pb-4 grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-800/50">
                                                <div>
                                                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Device Type</p>
                                                    <p className="text-sm text-slate-700 dark:text-slate-300 capitalize">
                                                        {log.deviceType || 'Unknown'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Browser</p>
                                                    <p className="text-sm text-slate-700 dark:text-slate-300">
                                                        {log.browser} {log.browserVersion}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Operating System</p>
                                                    <p className="text-sm text-slate-700 dark:text-slate-300">
                                                        {log.os || 'Unknown'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">IP Address</p>
                                                    <p className="text-sm text-slate-700 dark:text-slate-300">
                                                        {log.ipAddress || 'Unknown'}
                                                    </p>
                                                </div>
                                                <div className="col-span-2">
                                                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Location</p>
                                                    <p className="text-sm text-slate-700 dark:text-slate-300">
                                                        {log.city}, {log.country}
                                                    </p>
                                                </div>
                                                <div className="col-span-2">
                                                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">User Agent</p>
                                                    <p className="text-xs text-slate-500 break-all">
                                                        {log.userAgent || 'Not available'}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
