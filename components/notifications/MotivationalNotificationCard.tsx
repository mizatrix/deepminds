'use client';

import { Notification } from '@/lib/notifications/types';
import { Sparkles, Heart, Trophy, Target, Megaphone } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useState, useEffect } from 'react';
import { getReactionCounts, getUserReaction, addReaction, removeReaction, type ReactionType } from '@/lib/actions/notification-reactions';
import ReactionButton from './ReactionButton';

interface MotivationalNotificationCardProps {
    notification: Notification;
    onRead: (id: string) => void;
    userId: string;
}

export default function MotivationalNotificationCard({ notification, onRead, userId }: MotivationalNotificationCardProps) {
    const [hasAnimated, setHasAnimated] = useState(false);
    const [reactionCounts, setReactionCounts] = useState({ like: 0, love: 0, celebrate: 0, inspire: 0 });
    const [userReaction, setUserReaction] = useState<ReactionType | null>(null);

    useEffect(() => {
        // Load reactions
        Promise.all([
            getReactionCounts(notification.id),
            getUserReaction(notification.id, userId)
        ]).then(([counts, reaction]) => {
            setReactionCounts(counts);
            setUserReaction(reaction);
        });
    }, [notification.id, userId]);

    const handleReaction = async (type: ReactionType) => {
        if (userReaction === type) {
            // Remove reaction
            await removeReaction(notification.id, userId);
            setUserReaction(null);
            setReactionCounts(prev => ({ ...prev, [type]: Math.max(0, prev[type] - 1) }));
        } else {
            // Add or change reaction
            await addReaction(notification.id, userId, type);
            const oldReaction = userReaction;
            setUserReaction(type);
            setReactionCounts(prev => ({
                ...prev,
                [type]: prev[type] + 1,
                ...(oldReaction ? { [oldReaction]: Math.max(0, prev[oldReaction] - 1) } : {})
            }));
        }
    };

    const getMotivationalIcon = () => {
        const message = notification.message.toLowerCase();

        if (message.includes('congratulation') || message.includes('milestone')) {
            return <Trophy className="w-6 h-6 text-yellow-400" />;
        }
        if (message.includes('top') || message.includes('spotlight')) {
            return <Target className="w-6 h-6 text-purple-400" />;
        }
        if (message.includes('thank') || message.includes('appreciation')) {
            return <Heart className="w-6 h-6 text-pink-400" />;
        }
        if (notification.type === 'ANNOUNCEMENT') {
            return <Megaphone className="w-6 h-6 text-blue-400" />;
        }
        return <Sparkles className="w-6 h-6 text-amber-400" />;
    };

    const getPriorityGradient = () => {
        switch (notification.priority) {
            case 'URGENT':
                return 'from-red-500 via-orange-500 to-yellow-500';
            case 'HIGH':
                return 'from-purple-500 via-pink-500 to-rose-500';
            case 'NORMAL':
                return 'from-blue-500 via-purple-500 to-pink-500';
            case 'LOW':
            default:
                return 'from-slate-500 via-slate-400 to-slate-300';
        }
    };

    const content = (
        <div
            className={`
                relative overflow-hidden rounded-2xl p-5
                bg-gradient-to-br ${getPriorityGradient()}
                ${!notification.read ? 'ring-2 ring-purple-400 dark:ring-purple-500' : ''}
                ${!hasAnimated && !notification.read ? 'animate-pulse' : ''}
                cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl
                border-b border-white/20
            `}
            onClick={() => {
                onRead(notification.id);
                setHasAnimated(true);
            }}
        >
            {/* Decorative sparkles background */}
            <div className="absolute top-0 right-0 opacity-20">
                <Sparkles className="w-20 h-20 text-white" />
            </div>

            <div className="relative z-10 flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                    {getMotivationalIcon()}
                </div>

                <div className="flex-1 min-w-0">
                    {/* Admin Badge */}
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-white/30 backdrop-blur-sm rounded-full text-[10px] font-bold text-white uppercase tracking-wide">
                            {notification.type === 'ANNOUNCEMENT' ? '📢 Announcement' : '✨ From Admin Team'}
                        </span>
                        {!notification.read && (
                            <span className="w-2 h-2 rounded-full bg-white animate-pulse shadow-lg" />
                        )}
                    </div>

                    <p className="text-white font-bold text-lg mb-1 line-clamp-2">
                        {notification.title}
                    </p>

                    <p className="text-white/90 text-sm leading-relaxed line-clamp-3">
                        {notification.message}
                    </p>

                    <p className="text-white/60 text-xs mt-3 flex items-center gap-2">
                        <span>🕐</span>
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>

                    {/* Reaction Buttons */}
                    <div className="flex gap-2 mt-4 flex-wrap">
                        <ReactionButton
                            notificationId={notification.id}
                            userId={userId}
                            type="like"
                            emoji="👍"
                            count={reactionCounts.like}
                            userReaction={userReaction}
                            onReact={handleReaction}
                        />
                        <ReactionButton
                            notificationId={notification.id}
                            userId={userId}
                            type="love"
                            emoji="❤️"
                            count={reactionCounts.love}
                            userReaction={userReaction}
                            onReact={handleReaction}
                        />
                        <ReactionButton
                            notificationId={notification.id}
                            userId={userId}
                            type="celebrate"
                            emoji="🎉"
                            count={reactionCounts.celebrate}
                            userReaction={userReaction}
                            onReact={handleReaction}
                        />
                        <ReactionButton
                            notificationId={notification.id}
                            userId={userId}
                            type="inspire"
                            emoji="⭐"
                            count={reactionCounts.inspire}
                            userReaction={userReaction}
                            onReact={handleReaction}
                        />
                    </div>
                </div>
            </div>
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
