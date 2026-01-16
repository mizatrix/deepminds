'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';
import SocialLoginButtons from '@/components/auth/SocialLoginButtons';
import { createEnhancedAuditLog } from '@/lib/audit-service';
import { getSettings } from '@/lib/settings-store';

export default function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';
    const registered = searchParams.get('registered') === 'true';

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [registrationAllowed, setRegistrationAllowed] = useState(true);
    const [showPassword, setShowPassword] = useState(false);

    // Check if registrations are allowed
    useEffect(() => {
        const settings = getSettings();
        setRegistrationAllowed(settings.allowRegistrations);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await signIn('credentials', {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            if (result?.error) {
                setError('Invalid email or password');
            } else if (result?.ok) {
                // Fetch the session to get user role
                const response = await fetch('/api/auth/session');
                const session = await response.json();

                // Log the login event
                await createEnhancedAuditLog({
                    userEmail: session?.user?.email || formData.email,
                    userName: session?.user?.name || 'Unknown',
                    userRole: session?.user?.role === 'ADMIN' ? 'ADMIN' : 'STUDENT',
                    action: 'login',
                    targetType: 'system',
                    details: 'User logged in successfully'
                });

                // Redirect based on user role
                if (session?.user?.role === 'ADMIN') {
                    router.push('/admin/dashboard');
                } else {
                    router.push('/student/dashboard');
                }
                router.refresh();
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden p-8">
            {/* Header */}
            <div className="text-center mb-8">
                <Link href="/" className="inline-flex items-center gap-2 text-blue-600 mb-4">
                    <GraduationCap className="w-10 h-10" />
                </Link>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Welcome Back</h1>
                <p className="text-slate-500 dark:text-slate-400">Sign in to your account to continue.</p>
            </div>

            {/* Success Message */}
            {registered && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <p className="text-sm text-green-600 text-center">
                        Account created successfully! Please sign in.
                    </p>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl">
                    <p className="text-sm text-red-600 dark:text-red-400 text-center">{error}</p>
                </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Email Address
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-950 dark:text-slate-100 placeholder:text-slate-400"
                        placeholder="student@example.com"
                    />
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Password
                    </label>
                    <div className="relative">
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-950 dark:text-slate-100 placeholder:text-slate-400"
                            placeholder="••••••••••••"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? (
                                <EyeOff className="w-5 h-5" />
                            ) : (
                                <Eye className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <input
                            type="checkbox"
                            className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 bg-white dark:bg-slate-900"
                        />
                        Remember me
                    </label>
                    <Link href="#" className="text-blue-600 hover:underline">Forgot password?</Link>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-md text-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? 'Signing In...' : 'Sign In'}
                </button>
            </form>

            {/* Social Login */}
            <div className="mt-6">
                <SocialLoginButtons callbackUrl={callbackUrl} />
            </div>

            {/* Register Link */}
            {registrationAllowed && (
                <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    Don't have an account?{' '}
                    <Link
                        href="/register"
                        className="text-blue-600 font-bold hover:underline"
                    >
                        Create Account
                    </Link>
                </div>
            )}


        </div>
    );
}
