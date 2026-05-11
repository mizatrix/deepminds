'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { GraduationCap, ShieldCheck, Trophy, Sparkles } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';

function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\\/+^])/g, '\\$1') + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
}

function clearCookie(name: string) {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=; Max-Age=0; path=/`;
}

function SignInContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');
    const callbackUrl = searchParams.get('callbackUrl') || '/';
    const [rejectedEmail, setRejectedEmail] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (error) {
            const e = getCookie('auth_rejected_email');
            if (e) {
                setRejectedEmail(e);
                clearCookie('auth_rejected_email');
            }
        }
    }, [error]);

    const errorMessage = (() => {
        if (!error) return '';
        if (error === 'AccessDenied' || error === 'OAuthAccountNotLinked') {
            if (rejectedEmail) {
                return `${rejectedEmail} isn’t an MSA account. Please sign in with your @msa.edu.eg email.`;
            }
            return 'Only @msa.edu.eg accounts are allowed.';
        }
        return 'Sign-in failed. Please try again.';
    })();

    const handleSignIn = () => {
        setLoading(true);
        signIn('google', { callbackUrl });
    };

    return (
        <div className="min-h-[calc(100vh-80px)] grid lg:grid-cols-2">
            {/* Left: brand / value panel — desktop only */}
            <div className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-12 text-white flex-col justify-between">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 0, transparent 50%), radial-gradient(circle at 80% 80%, white 0, transparent 50%)' }} />
                <div className="relative">
                    <div className="inline-flex items-center gap-2">
                        <GraduationCap className="w-8 h-8" />
                        <span className="font-bold text-lg">CS Excellence</span>
                    </div>
                </div>

                <div className="relative space-y-8">
                    <div>
                        <h2 className="text-4xl font-bold leading-tight">
                            Track your journey to <br /> CS Excellence.
                        </h2>
                        <p className="mt-4 text-white/80 text-lg">
                            The MSA Computer Science portal for assignments, leaderboards, and recognition.
                        </p>
                    </div>

                    <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                            <Trophy className="w-5 h-5 mt-0.5 text-yellow-300 shrink-0" />
                            <span className="text-white/90">Climb the leaderboard with every submission</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <Sparkles className="w-5 h-5 mt-0.5 text-pink-200 shrink-0" />
                            <span className="text-white/90">Get evaluated across MSA categories of excellence</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <ShieldCheck className="w-5 h-5 mt-0.5 text-emerald-300 shrink-0" />
                            <span className="text-white/90">Secure access tied to your MSA Google account</span>
                        </li>
                    </ul>
                </div>

                <div className="relative text-sm text-white/60">
                    MSA University · Faculty of Computer Science
                </div>
            </div>

            {/* Right: auth card */}
            <div className="flex items-center justify-center p-6 sm:p-12 bg-slate-50 dark:bg-slate-950">
                <div className="w-full max-w-sm">
                    <div className="lg:hidden flex justify-center mb-6">
                        <div className="inline-flex items-center gap-2 text-blue-600">
                            <GraduationCap className="w-9 h-9" />
                        </div>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50 text-center lg:text-left">
                        Sign in to CS Excellence
                    </h1>
                    <p className="mt-2 text-slate-600 dark:text-slate-400 text-center lg:text-left">
                        Use your MSA Google account to continue.
                    </p>

                    {errorMessage && (
                        <div
                            role="alert"
                            className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
                        >
                            <p className="text-sm text-red-700 dark:text-red-300">{errorMessage}</p>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={handleSignIn}
                        disabled={loading}
                        className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm font-semibold text-slate-800 dark:text-slate-100 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                    >
                        <FcGoogle className="h-5 w-5" />
                        {loading ? 'Redirecting to Google…' : 'Continue with Google'}
                    </button>

                    <p className="mt-3 text-xs text-center text-slate-600 dark:text-slate-400">
                        Only <span className="font-semibold">@msa.edu.eg</span> accounts can sign in.
                    </p>
                </div>
            </div>
        </div>
    );
}

function SignInLoading() {
    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6">
            <div className="w-full max-w-sm space-y-4">
                <div className="h-9 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse mt-6" />
            </div>
        </div>
    );
}

export default function SignInPage() {
    return (
        <Suspense fallback={<SignInLoading />}>
            <SignInContent />
        </Suspense>
    );
}
