'use client';

import { useState, useEffect } from 'react';
import { Bot, Plus, Play, Pause, Trash2, Clock, CheckCircle2, XCircle, Calendar } from 'lucide-react';
import { getTriggers, createTrigger, toggleTrigger, deleteTrigger, executeTrigger, getTriggerExecutions, COMMON_TRIGGERS, type NotificationTrigger } from '@/lib/actions/triggers';
import { MOTIVATIONAL_TEMPLATES } from '@/lib/actions/motivational-notifications';
import Link from 'next/link';

export default function AdminTriggersPage() {
    const [triggers, setTriggers] = useState<NotificationTrigger[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [executing, setExecuting] = useState<string | null>(null);

    useEffect(() => {
        loadTriggers();
    }, []);

    const loadTriggers = async () => {
        try {
            const data = await getTriggers();
            setTriggers(data);
        } catch (error) {
            console.error('Failed to load triggers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (id: string, enabled: boolean) => {
        await toggleTrigger(id, !enabled);
        loadTriggers();
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this trigger?')) {
            await deleteTrigger(id);
            loadTriggers();
        }
    };

    const handleExecute = async (id: string) => {
        setExecuting(id);
        try {
            const result = await executeTrigger(id);
            alert(`Trigger executed! Sent: ${result.sent}, Failed: ${result.failed}`);
            loadTriggers();
        } catch (error) {
            alert('Failed to execute trigger');
        } finally {
            setExecuting(null);
        }
    };

    const handleCreateFromTemplate = async (template: typeof COMMON_TRIGGERS[0]) => {
        await createTrigger(
            template.name,
            template.type,
            template.schedule || null,
            template.templateId,
            template.audience
        );
        loadTriggers();
        setShowCreateModal(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                            <Bot className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">
                                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    Automated Triggers
                                </span>
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400">
                                Set up automatic notification schedules
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Create Trigger
                    </button>
                </div>
            </div>

            {/* Triggers List */}
            {triggers.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                    <Bot className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400 mb-4">No triggers created yet</p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                    >
                        Create Your First Trigger
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {triggers.map((trigger) => (
                        <div
                            key={trigger.id}
                            className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                            {trigger.name}
                                        </h3>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${trigger.enabled
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                            }`}>
                                            {trigger.enabled ? 'Active' : 'Disabled'}
                                        </span>
                                    </div>

                                    <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                        {trigger.schedule && (
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                <code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                                    {trigger.schedule}
                                                </code>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            Template: {trigger.templateId} • Audience: {trigger.audience}
                                        </div>
                                        {trigger.lastRun && (
                                            <p className="text-xs">
                                                Last run: {new Date(trigger.lastRun).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleExecute(trigger.id)}
                                        disabled={executing === trigger.id}
                                        className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50"
                                        title="Test run now"
                                    >
                                        {executing === trigger.id ? (
                                            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <Play className="w-5 h-5" />
                                        )}
                                    </button>

                                    <button
                                        onClick={() => handleToggle(trigger.id, trigger.enabled)}
                                        className={`p-2 rounded-xl transition-colors ${trigger.enabled
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                                            }`}
                                        title={trigger.enabled ? 'Disable' : 'Enable'}
                                    >
                                        {trigger.enabled ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                                    </button>

                                    <button
                                        onClick={() => handleDelete(trigger.id)}
                                        className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-4">Create Trigger from Template</h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">
                            Choose a pre-configured trigger template
                        </p>

                        <div className="space-y-3 mb-6">
                            {COMMON_TRIGGERS.map((template, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleCreateFromTemplate(template)}
                                    className="w-full text-left p-4 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                >
                                    <div className="font-semibold text-slate-900 dark:text-white mb-1">
                                        {template.name}
                                    </div>
                                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                        {template.description}
                                    </div>
                                    <code className="text-xs bg-white dark:bg-slate-900 px-2 py-1 rounded">
                                        {template.schedule}
                                    </code>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setShowCreateModal(false)}
                            className="w-full px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Back Link */}
            <div className="mt-8 text-center">
                <Link
                    href="/admin/notifications"
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium text-sm"
                >
                    ← Back to Notifications
                </Link>
            </div>
        </div>
    );
}
