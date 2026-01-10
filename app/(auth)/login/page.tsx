'use client';

import { Suspense } from 'react';
import LoginForm from '@/components/auth/LoginForm';

// Loading Component
function LoginLoading() {
    return (
        <div className="flex min-h-[80vh] items-center justify-center">
            <div className="w-full max-w-md h-[600px] bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 animate-pulse p-8">
                <div className="h-20 w-20 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto mb-8"></div>
                <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded mx-auto mb-4"></div>
                <div className="h-4 w-64 bg-slate-200 dark:bg-slate-800 rounded mx-auto mb-8"></div>
                <div className="space-y-4">
                    <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                    <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                    <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="flex min-h-[80vh] items-center justify-center">
            <Suspense fallback={<LoginLoading />}>
                <LoginForm />
            </Suspense>
        </div>
    );
}
