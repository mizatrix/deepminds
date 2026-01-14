'use client';

import { useState, useEffect } from 'react';
import { useNotifications } from '@/components/providers/NotificationProvider';
import { Bell, BellOff, CheckCheck, Trophy, CheckCircle, XCircle, Award, FileText, Info, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { Notification, NotificationType } from '@/lib/notifications/types';
import MotivationalNotificationCard from '@/components/notifications/MotivationalNotificationCard';

// Skeleton component for loading state
function SkeletonNotificationItem() {
    return (
        <div className="flex gap-4 p-5 animate-pulse">
            <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/3" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-lg w-2/3" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/4" />
            </div>
        </div>
    );
}

function getNotificationIcon(type: NotificationType) {
    switch (type) {
        case 'ACHIEVEMENT_ADDED':
            return <Trophy className="w-5 h-5 text-yellow-500" />;
        case 'SUCCESS':
        case 'SUBMISSION_APPROVED':
            return <CheckCircle className="w-5 h-5 text-green-500" />;
        case 'ERROR':
        case 'SUBMISSION_REJECTED':
            return <XCircle className="w-5 h-5 text-red-500" />;
        case 'BADGE_EARNED':
            return <Award className="w-5 h-5 text-purple-500" />;
        case 'CERTIFICATE_ISSUED':
            return <FileText className="w-5 h-5 text-blue-500" />;
        case 'INFO':
        default:
            return <Info className="w-5 h-5 text-blue-500" />;
    }
}

function getNotificationBgColor(type: NotificationType, isUnread: boolean) {
    if (!isUnread) return '';

    switch (type) {
        case 'SUBMISSION_APPROVED':
        case 'SUCCESS':
            return 'bg-green-50/50 dark:bg-green-900/10';
        case 'SUBMISSION_REJECTED':
        case 'ERROR':
            return 'bg-red-50/50 dark:bg-red-900/10';
        case 'BADGE_EARNED':
            return 'bg-purple-50/50 dark:bg-purple-900/10';
        case 'CERTIFICATE_ISSUED':
            return 'bg-blue-50/50 dark:bg-blue-900/10';
        case 'ACHIEVEMENT_ADDED':
            return 'bg-yellow-50/50 dark:bg-yellow-900/10';
        default:
            return 'bg-blue-50/50 dark:bg-blue-900/10';
    }
}

function NotificationFeedItem({ notification, onRead }: { notification: Notification; onRead: (id: string) => void }) {
    const content = (
        <div
            onClick={() => onRead(notification.id)}
            className={`flex gap-4 p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer border-b border-slate-100 dark:border-slate-800 relative ${getNotificationBgColor(notification.type, !notification.read)}`}
        >
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${!notification.read ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                    {notification.title}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5 break-words">
                    {notification.message}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </p>
            </div>
            {!notification.read && (
                <div className="absolute right-5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg shadow-purple-500/30" />
            )}
        </div>
    );

    if (notification.link) {
        return (
            <Link href={notification.link} className="block">
                {content}
            </Link>
        );
    }

    return content;
}

export default function NotificationsPage() {
    const { notifications, loading, markAsRead, markAllAsRead, unreadCount } = useNotifications();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || loading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href="/student/dashboard"
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">
                            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                Notifications
                            </span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">Stay updated on your achievements</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    {[...Array(5)].map((_, i) => (
                        <SkeletonNotificationItem key={i} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link
                        href="/student/dashboard"
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">
                            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                Notifications
                            </span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            Stay updated on your achievements
                            {unreadCount > 0 && (
                                <span className="ml-2 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-bold rounded-full">
                                    {unreadCount} unread
                                </span>
                            )}
                        </p>
                    </div>
                </div>
                {notifications.length > 0 && unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-colors"
                    >
                        <CheckCheck className="w-4 h-4" />
                        Mark all read
                    </button>
                )}
            </div>

            {/* Notifications List */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                            <BellOff className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                            No Notifications Yet
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                            When you receive updates about your submissions, badges, or certificates, they'll appear here.
                        </p>
                        <Link
                            href="/student/dashboard"
                            className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all"
                        >
                            Go to Dashboard
                        </Link>
                    </div>
                ) : (
                    <div>
                        {notifications.map((notification) => {
                            // Render motivational notifications with special card
                            if (notification.type === 'MOTIVATIONAL' || notification.type === 'ANNOUNCEMENT') {
                                return (
                                    <div key={notification.id} className="p-4">
                                        <MotivationalNotificationCard
                                            notification={notification}
                                            onRead={markAsRead}
                                            userId={session?.user?.email || ''}
                                        />
                                    </div>
                                );
                            }

                            // Regular notifications
                            return (
                                <NotificationFeedItem
                                    key={notification.id}
                                    notification={notification}
                                    onRead={markAsRead}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
