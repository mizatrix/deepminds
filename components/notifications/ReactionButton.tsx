'use client';

import { useState, useEffect } from 'react';
import { type ReactionType } from '@/lib/actions/notification-reactions';

interface ReactionButtonProps {
    notificationId: string;
    userId: string;
    type: ReactionType;
    emoji: string;
    count: number;
    userReaction: ReactionType | null;
    onReact: (type: ReactionType) => void;
}

export default function ReactionButton({
    notificationId,
    userId,
    type,
    emoji,
    count,
    userReaction,
    onReact
}: ReactionButtonProps) {
    const isActive = userReaction === type;
    const [isAnimating, setIsAnimating] = useState(false);

    const handleClick = () => {
        setIsAnimating(true);
        onReact(type);
        setTimeout(() => setIsAnimating(false), 300);
    };

    return (
        <button
            onClick={handleClick}
            className={`
                group relative px-3 py-2 rounded-xl font-medium text-sm transition-all
                ${isActive
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg scale-105'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }
                ${isAnimating ? 'animate-bounce' : ''}
            `}
        >
            <div className="flex items-center gap-2">
                <span className={`text-lg transition-transform ${isAnimating ? 'scale-125' : ''}`}>
                    {emoji}
                </span>
                {count > 0 && (
                    <span className={`font-bold ${isActive ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                        {count}
                    </span>
                )}
            </div>

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 dark:bg-slate-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                {type.charAt(0).toUpperCase() + type.slice(1)}
            </div>
        </button>
    );
}
