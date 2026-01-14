'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Bell, Mail, Clock, Save, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function StudentSettingsPage() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const [emailNotifications, setEmailNotifications] = useState(true);
    const [emailDigestFrequency, setEmailDigestFrequency] = useState<'instant' | 'daily' | 'weekly' | 'never'>('instant');

    useEffect(() => {
        // Fetch user preferences
        const fetchPreferences = async () => {
            try {
                const response = await fetch('/api/user/preferences');
                if (response.ok) {
                    const data = await response.json();
                    setEmailNotifications(data.emailNotifications ?? true);
                    setEmailDigestFrequency(data.emailDigestFrequency ?? 'instant');
                }
            } catch (error) {
                console.error('Failed to load preferences:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPreferences();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);

        try {
            const response = await fetch('/api/user/preferences', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    emailNotifications,
                    emailDigestFrequency
                })
            });

            if (response.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }
        } catch (error) {
            console.error('Failed to save preferences:', error);
            alert('Failed to save preferences. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">
                    <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Notification Settings
                    </span>
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Manage how you receive notifications and updates
                </p>
            </div>

            <div className="space-y-6">
                {/* Email Notifications */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                            <Mail className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h2 className="font-bold text-lg mb-2">Email Notifications</h2>
                            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                                Receive notifications via email in addition to in-app notifications
                            </p>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={emailNotifications}
                                    onChange={(e) => setEmailNotifications(e.target.checked)}
                                    className="w-5 h-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                                />
                                <span className="font-medium text-slate-900 dark:text-white">
                                    Enable email notifications
                                </span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Email Frequency */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                            <Clock className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                            <h2 className="font-bold text-lg mb-2">Email Frequency</h2>
                            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
                                Choose how often you want to receive email notifications
                            </p>

                            <div className="space-y-3">
                                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <input
                                        type="radio"
                                        name="frequency"
                                        value="instant"
                                        checked={emailDigestFrequency === 'instant'}
                                        onChange={() => setEmailDigestFrequency('instant')}
                                        disabled={!emailNotifications}
                                        className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium text-slate-900 dark:text-white">Instant</p>
                                        <p className="text-xs text-slate-500">Receive emails immediately as notifications arrive</p>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <input
                                        type="radio"
                                        name="frequency"
                                        value="daily"
                                        checked={emailDigestFrequency === 'daily'}
                                        onChange={() => setEmailDigestFrequency('daily')}
                                        disabled={!emailNotifications}
                                        className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium text-slate-900 dark:text-white">Daily Digest</p>
                                        <p className="text-xs text-slate-500">Receive a summary email once per day</p>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <input
                                        type="radio"
                                        name="frequency"
                                        value="weekly"
                                        checked={emailDigestFrequency === 'weekly'}
                                        onChange={() => setEmailDigestFrequency('weekly')}
                                        disabled={!emailNotifications}
                                        className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium text-slate-900 dark:text-white">Weekly Digest</p>
                                        <p className="text-xs text-slate-500">Receive a summary email once per week</p>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <input
                                        type="radio"
                                        name="frequency"
                                        value="never"
                                        checked={emailDigestFrequency === 'never'}
                                        onChange={() => setEmailDigestFrequency('never')}
                                        disabled={!emailNotifications}
                                        className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                                    />
                                    <div className="flex-1">
                                        <p className="font-medium text-slate-900 dark:text-white">Never</p>
                                        <p className="text-xs text-slate-500">Don't send emails (in-app only)</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* In-App Notifications Info */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-3xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-4">
                        <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                            <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                                In-App Notifications
                            </p>
                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                You'll always receive in-app notifications regardless of your email settings.
                                Check the bell icon in the header to see your latest updates.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleSave}
                        disabled={saving || saved}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-2xl hover:shadow-xl hover:shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : saved ? (
                            <>
                                <CheckCircle2 className="w-5 h-5" />
                                Saved!
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Save Preferences
                            </>
                        )}
                    </button>

                    <Link
                        href="/student/notifications"
                        className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium text-sm"
                    >
                        View Notifications →
                    </Link>
                </div>
            </div>
        </div>
    );
}
