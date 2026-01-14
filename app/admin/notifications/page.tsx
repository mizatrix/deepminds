'use client';

import { useState } from 'react';
import { Sparkles, Users, Target, Send, AlertCircle, CheckCircle2, Calendar } from 'lucide-react';
import { MOTIVATIONAL_TEMPLATES, type AudienceFilter, sendTemplateNotification } from '@/lib/actions/motivational-notifications';
import { createScheduledNotification } from '@/lib/actions/scheduled-notifications';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function AdminNotificationsPage() {
    const { data: session } = useSession();
    const [selectedTemplate, setSelectedTemplate] = useState(MOTIVATIONAL_TEMPLATES[0].id);
    const [customTitle, setCustomTitle] = useState('');
    const [customMessage, setCustomMessage] = useState('');
    const [selectedAudience, setSelectedAudience] = useState<AudienceFilter>('all');
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<{ sent: number; failed: number } | null>(null);
    const [useCustom, setUseCustom] = useState(false);

    // Scheduling state
    const [sendNow, setSendNow] = useState(true);
    const [scheduledDate, setScheduledDate] = useState<Date | null>(null);

    const currentTemplate = MOTIVATIONAL_TEMPLATES.find(t => t.id === selectedTemplate);

    const handleSend = async () => {
        setSending(true);
        setResult(null);

        try {
            const title = useCustom ? customTitle : currentTemplate?.title || '';
            const message = useCustom ? customMessage : currentTemplate?.message || '';

            if (sendNow) {
                // Send immediately
                const outcome = await sendTemplateNotification(
                    selectedTemplate,
                    selectedAudience,
                    useCustom ? { title, message } : undefined
                );
                setResult(outcome);
            } else {
                // Schedule for later
                if (!scheduledDate) {
                    alert('Please select a date and time');
                    setSending(false);
                    return;
                }

                await createScheduledNotification(
                    title,
                    message,
                    'MOTIVATIONAL',
                    currentTemplate?.priority || 'NORMAL',
                    selectedAudience,
                    scheduledDate,
                    session?.user?.email || 'admin'
                );

                setResult({ sent: 1, failed: 0 });
                alert(`Notification scheduled for ${scheduledDate.toLocaleString()}`);
            }
        } catch (error) {
            console.error('Failed to send notifications:', error);
            alert('Failed to process notification. Please try again.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">
                            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                Motivational Notifications
                            </span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">Send inspiring messages to your students</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Composer Section */}
                <div className="space-y-6">
                    {/* Template Selection */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-purple-600" />
                            Select Template
                        </h2>
                        <div className="space-y-2">
                            {MOTIVATIONAL_TEMPLATES.map((template) => (
                                <button
                                    key={template.id}
                                    onClick={() => {
                                        setSelectedTemplate(template.id);
                                        setCustomTitle(template.title);
                                        setCustomMessage(template.message);
                                    }}
                                    className={`w-full text-left p-4 rounded-xl transition-all ${selectedTemplate === template.id
                                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                                        : 'bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{template.emoji}</span>
                                        <div className="flex-1">
                                            <p className={`font-semibold text-sm ${selectedTemplate === template.id ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                                                {template.title}
                                            </p>
                                            <p className={`text-xs mt-0.5 ${selectedTemplate === template.id ? 'text-white/80' : 'text-slate-500'}`}>
                                                {template.category} • {template.priority} priority
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Audience Selection */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-600" />
                            Select Audience
                        </h2>
                        <select
                            value={selectedAudience}
                            onChange={(e) => setSelectedAudience(e.target.value as AudienceFilter)}
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        >
                            <option value="all">📢 All Students</option>
                            <option value="top_performers">🏆 Top Performers (Top 20%)</option>
                            <option value="new_students">👋 New Students (Last 30 days)</option>
                            <option value="inactive">⏰ Inactive Students (No submissions)</option>
                            <option value="high_achievers">⭐ High Achievers (5+ approved)</option>
                        </select>
                    </div>
                </div>

                {/* Preview & Customize Section */}
                <div className="space-y-6">
                    {/* Customize Toggle */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={useCustom}
                                onChange={(e) => setUseCustom(e.target.checked)}
                                className="w-5 h-5 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="font-semibold text-slate-900 dark:text-white">Customize Message</span>
                        </label>
                    </div>

                    {/* Preview or Custom Editor */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Target className="w-5 h-5 text-green-600" />
                            {useCustom ? 'Customize' : 'Preview'}
                        </h2>

                        {useCustom ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        value={customTitle}
                                        onChange={(e) => setCustomTitle(e.target.value)}
                                        placeholder="Enter notification title..."
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                        Message
                                    </label>
                                    <textarea
                                        value={customMessage}
                                        onChange={(e) => setCustomMessage(e.target.value)}
                                        placeholder="Enter your motivational message..."
                                        rows={5}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                                    />
                                    <p className="text-xs text-slate-500 mt-2">
                                        💡 Tip: Use {'{'}{'{'} totalPoints {'}'}{'}'}  for community total points
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="p-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl text-white">
                                    <p className="font-bold text-lg mb-2">
                                        {currentTemplate?.emoji} {currentTemplate?.title}
                                    </p>
                                    <p className="text-white/90 text-sm">
                                        {currentTemplate?.message}
                                    </p>
                                    <div className="mt-3 flex items-center gap-2">
                                        <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold">
                                            {currentTemplate?.priority} Priority
                                        </span>
                                        <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold">
                                            ✨ From Admin Team
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Send Now or Schedule */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-indigo-600" />
                            When to Send
                        </h2>

                        <div className="space-y-4">
                            {/* Send Now/Schedule Toggle */}
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setSendNow(true)}
                                    className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${sendNow
                                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                        }`}
                                >
                                    📤 Send Now
                                </button>
                                <button
                                    onClick={() => {
                                        setSendNow(false);
                                        if (!scheduledDate) {
                                            // Set default to 1 hour from now
                                            const defaultDate = new Date();
                                            defaultDate.setHours(defaultDate.getHours() + 1);
                                            setScheduledDate(defaultDate);
                                        }
                                    }}
                                    className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${!sendNow
                                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                        }`}
                                >
                                    ⏰ Schedule
                                </button>
                            </div>

                            {/* Date Picker (only show when scheduling) */}
                            {!sendNow && (
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                        Select Date & Time
                                    </label>
                                    <DatePicker
                                        selected={scheduledDate}
                                        onChange={(date) => setScheduledDate(date)}
                                        showTimeSelect
                                        dateFormat="MMMM d, yyyy h:mm aa"
                                        minDate={new Date()}
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        placeholderText="Select date and time..."
                                    />
                                    {scheduledDate && (
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                                            📅 Will be sent on {scheduledDate.toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Send Button */}
                    <button
                        onClick={handleSend}
                        disabled={sending || (!useCustom && !currentTemplate) || (useCustom && (!customTitle || !customMessage))}
                        className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-2xl hover:shadow-xl hover:shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {sending ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                Send Notification
                            </>
                        )}
                    </button>

                    {/* Result Display */}
                    {result && (
                        <div className={`p-4 rounded-xl border ${result.failed > 0
                            ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                            : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                            }`}>
                            <div className="flex items-start gap-3">
                                {result.failed > 0 ? (
                                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                                ) : (
                                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                                )}
                                <div>
                                    <p className={`font-bold text-sm ${result.failed > 0
                                        ? 'text-yellow-900 dark:text-yellow-100'
                                        : 'text-green-900 dark:text-green-100'
                                        }`}>
                                        {result.failed > 0 ? 'Partially Sent' : 'Successfully Sent!'}
                                    </p>
                                    <p className={`text-xs mt-1 ${result.failed > 0
                                        ? 'text-yellow-700 dark:text-yellow-300'
                                        : 'text-green-700 dark:text-green-300'
                                        }`}>
                                        ✅ {result.sent} sent successfully
                                        {result.failed > 0 && ` • ❌ ${result.failed} failed`}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Back to Dashboard */}
            <div className="mt-8 text-center">
                <Link
                    href="/dashboard"
                    className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium text-sm"
                >
                    ← Back to Dashboard
                </Link>
            </div>
        </div>
    );
}
