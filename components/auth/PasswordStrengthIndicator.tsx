'use client';

import { checkPasswordStrength } from '@/lib/auth/validation';
import { useEffect, useState } from 'react';

interface PasswordStrengthIndicatorProps {
    password: string;
}

export default function PasswordStrengthIndicator({ password }: PasswordStrengthIndicatorProps) {
    const [strength, setStrength] = useState({ score: 0, feedback: [] as string[] });

    useEffect(() => {
        if (password) {
            setStrength(checkPasswordStrength(password));
        } else {
            setStrength({ score: 0, feedback: [] });
        }
    }, [password]);

    if (!password) return null;

    const getStrengthColor = (score: number) => {
        if (score >= 80) return 'bg-green-500';
        if (score >= 60) return 'bg-yellow-500';
        if (score >= 40) return 'bg-orange-500';
        return 'bg-red-500';
    };

    const getStrengthText = (score: number) => {
        if (score >= 80) return 'Strong';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Fair';
        return 'Weak';
    };

    return (
        <div className="mt-2 space-y-2">
            <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-300 ${getStrengthColor(strength.score)}`}
                        style={{ width: `${strength.score}%` }}
                    />
                </div>
                <span className="text-sm font-medium text-gray-700">
                    {getStrengthText(strength.score)}
                </span>
            </div>

            {strength.feedback.length > 0 && (
                <ul className="text-xs text-gray-600 space-y-1">
                    {strength.feedback.map((item, index) => (
                        <li key={index} className="flex items-start gap-1">
                            <span className="text-red-500 mt-0.5">•</span>
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            )}

            {strength.score >= 80 && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                    <span>✓</span>
                    <span>Password meets all requirements</span>
                </p>
            )}
        </div>
    );
}
