'use client';

import { Notification } from '@/lib/notifications/types';
import { CheckCircle, Info, AlertTriangle, Trophy, XCircle, Award, FileText } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface NotificationItemProps {
    notification: Notification;
    onRead: (id: string) => void;
}

export default function NotificationItem({ notification, onRead }: NotificationItemProps) {
    const getIcon = () => {
        switch (notification.type) {
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
            case 'MOTIVATIONAL':
                return <Trophy className="w-5 h-5 text-amber-500" />;
            case 'ANNOUNCEMENT':
                return <AlertTriangle className="w-5 h-5 text-orange-500" />;
            case 'INFO':
            default:
                return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    const content = (
        <div
            className={`flex gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-800 relative ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
            onClick={() => onRead(notification.id)}
        >
            <div className="mt-1 flex-shrink-0">
                {getIcon()}
            </div>
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold text-slate-900 dark:text-slate-100 ${!notification.read ? 'text-blue-700 dark:text-blue-300' : ''} line-clamp-2`}>
                    {notification.title}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5 break-words line-clamp-3">
                    {notification.message}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </p>
            </div>
            {!notification.read && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-600" />
            )}
        </div>
    );

    if (notification.link) {
        return (
            <Link href={notification.link} className="block w-full">
                {content}
            </Link>
        );
    }

    return (
        <div className="cursor-pointer">
            {content}
        </div>
    );
}
