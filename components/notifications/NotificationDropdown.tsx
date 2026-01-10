'use client';

import { useNotifications } from '@/components/providers/NotificationProvider';
import NotificationItem from './NotificationItem';
import { CheckCheck, BellOff, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface NotificationDropdownProps {
    onClose: () => void;
}

export default function NotificationDropdown({ onClose }: NotificationDropdownProps) {
    const { notifications, markAsRead, markAllAsRead } = useNotifications();

    // Show only the 5 most recent notifications in the dropdown
    const recentNotifications = notifications.slice(0, 5);
    const hasMore = notifications.length > 5;

    return (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0 z-10">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100">Notifications</h3>
                {notifications.length > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
                    >
                        <CheckCheck className="w-3 h-3" />
                        Mark all read
                    </button>
                )}
            </div>

            <div className="max-h-[50vh] overflow-y-auto custom-scrollbar">
                {recentNotifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                        <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                            <BellOff className="w-6 h-6 text-slate-400" />
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 font-medium">No notifications yet</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                            We'll notify you when something updates
                        </p>
                    </div>
                ) : (
                    <div>
                        {recentNotifications.map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onRead={markAsRead}
                            />
                        ))}
                    </div>
                )}
            </div>

            {notifications.length > 0 && (
                <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                    <Link
                        href="/student/notifications"
                        onClick={onClose}
                        className="flex items-center justify-center gap-2 w-full py-2 text-sm font-bold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                    >
                        View All Notifications
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            )}
        </div>
    );
}

