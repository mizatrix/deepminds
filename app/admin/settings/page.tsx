"use client";

import { useState, useEffect } from "react";
import { Save, Bell, Shield, Globe, Plus, Edit2, Trash2, Check, X, Calendar, Loader2 } from "lucide-react";
import { useToast } from "@/lib/ToastContext";
import { useSettings, type SystemSettingsData, type AcademicTerm } from "@/lib/SettingsContext";
import { useSession } from "next-auth/react";

export default function SettingsPage() {
    const { showToast } = useToast();
    const { settings: contextSettings, loading: contextLoading, updateSettings } = useSettings();
    const { data: session } = useSession();
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<SystemSettingsData | null>(null);

    // Term management state
    const [showAddTerm, setShowAddTerm] = useState(false);
    const [editingTermId, setEditingTermId] = useState<string | null>(null);
    const [newTermName, setNewTermName] = useState("");
    const [newTermStart, setNewTermStart] = useState("");
    const [newTermEnd, setNewTermEnd] = useState("");

    // Load settings from context
    useEffect(() => {
        if (contextSettings) {
            setSettings(contextSettings);
        }
    }, [contextSettings]);

    if (contextLoading || !settings) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    const handleToggle = (key: keyof SystemSettingsData) => {
        const newSettings = { ...settings, [key]: !settings[key as keyof SystemSettingsData] };
        setSettings(newSettings as SystemSettingsData);
    };

    const handleChange = (key: keyof SystemSettingsData, value: string) => {
        setSettings({ ...settings, [key]: value } as SystemSettingsData);
    };

    const handleSaveSettings = async () => {
        setSaving(true);
        try {
            const success = await updateSettings(settings);
            if (success) {
                showToast("System settings saved to database!", "success");
            } else {
                showToast("Failed to save settings", "error");
            }
        } catch (error) {
            showToast("Error saving settings", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleAddTerm = () => {
        if (!newTermName.trim()) {
            showToast("Please enter a term name", "error");
            return;
        }

        const newTerm: AcademicTerm = {
            id: `term_${Date.now()}`,
            name: newTermName,
            startDate: newTermStart,
            endDate: newTermEnd,
            isActive: false,
            createdAt: new Date().toISOString()
        };

        setSettings(prev => prev ? {
            ...prev,
            terms: [...prev.terms, newTerm]
        } : prev);

        setNewTermName("");
        setNewTermStart("");
        setNewTermEnd("");
        setShowAddTerm(false);
        showToast(`Term "${newTermName}" added! Remember to save.`, "success");
    };

    const handleUpdateTerm = (termId: string) => {
        const term = settings.terms.find(t => t.id === termId);
        if (!term) return;

        setSettings(prev => prev ? {
            ...prev,
            terms: prev.terms.map(t =>
                t.id === termId
                    ? { ...t, name: newTermName || t.name, startDate: newTermStart || t.startDate, endDate: newTermEnd || t.endDate }
                    : t
            )
        } : prev);

        setEditingTermId(null);
        setNewTermName("");
        setNewTermStart("");
        setNewTermEnd("");
        showToast("Term updated! Remember to save.", "success");
    };

    const handleDeleteTerm = (termId: string) => {
        const term = settings.terms.find(t => t.id === termId);
        if (!term) return;

        if (term.isActive) {
            showToast("Cannot delete the active term. Set another term as active first.", "error");
            return;
        }

        if (!confirm(`Delete term "${term.name}"? This cannot be undone.`)) return;

        setSettings(prev => prev ? {
            ...prev,
            terms: prev.terms.filter(t => t.id !== termId)
        } : prev);

        showToast(`Term "${term.name}" deleted. Remember to save.`, "success");
    };

    const handleSetActiveTerm = (termId: string) => {
        setSettings(prev => prev ? {
            ...prev,
            terms: prev.terms.map(t => ({ ...t, isActive: t.id === termId }))
        } : prev);

        const term = settings.terms.find(t => t.id === termId);
        showToast(`"${term?.name}" is now the active term. Remember to save.`, "success");
    };

    const startEditing = (term: AcademicTerm) => {
        setEditingTermId(term.id);
        setNewTermName(term.name);
        setNewTermStart(term.startDate || "");
        setNewTermEnd(term.endDate || "");
    };

    const cancelEditing = () => {
        setEditingTermId(null);
        setNewTermName("");
        setNewTermStart("");
        setNewTermEnd("");
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">System Settings</h1>
                <p className="text-slate-500 dark:text-slate-400">Manage global configurations (stored in database).</p>
            </div>

            {/* General Settings */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-lg">
                        <Globe className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">General Information</h2>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Portal Name</label>
                    <input
                        type="text"
                        value={settings.portalName}
                        onChange={(e) => handleChange("portalName", e.target.value)}
                        className="w-full max-w-md px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                    <p className="text-xs text-slate-400">This name appears in the navbar and home page</p>
                </div>
            </div>

            {/* Academic Terms Management */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/20 text-green-600 rounded-lg">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Academic Terms</h2>
                            <p className="text-sm text-slate-500">Manage semesters and academic periods</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowAddTerm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-sm font-bold"
                    >
                        <Plus className="w-4 h-4" />
                        Add Term
                    </button>
                </div>

                {/* Add New Term Form */}
                {showAddTerm && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-200 dark:border-green-800 space-y-4">
                        <h3 className="font-bold text-green-800 dark:text-green-300">Add New Term</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Term Name *</label>
                                <input
                                    type="text"
                                    placeholder="e.g., Fall 2025"
                                    value={newTermName}
                                    onChange={(e) => setNewTermName(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Start Date (optional)</label>
                                <input
                                    type="date"
                                    value={newTermStart}
                                    onChange={(e) => setNewTermStart(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">End Date (optional)</label>
                                <input
                                    type="date"
                                    value={newTermEnd}
                                    onChange={(e) => setNewTermEnd(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => { setShowAddTerm(false); setNewTermName(""); setNewTermStart(""); setNewTermEnd(""); }}
                                className="px-4 py-2 text-slate-600 hover:text-slate-900 text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddTerm}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-bold"
                            >
                                Add Term
                            </button>
                        </div>
                    </div>
                )}

                {/* Terms List */}
                <div className="space-y-3">
                    {settings.terms.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            No terms defined yet. Click "Add Term" to create one.
                        </div>
                    ) : (
                        settings.terms.map(term => (
                            <div
                                key={term.id}
                                className={`p-4 rounded-xl border transition-all ${term.isActive
                                    ? 'bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800'
                                    : 'bg-slate-50 dark:bg-slate-950/50 border-slate-100 dark:border-slate-800'
                                    }`}
                            >
                                {editingTermId === term.id ? (
                                    <div className="space-y-3">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <input
                                                type="text"
                                                value={newTermName}
                                                onChange={(e) => setNewTermName(e.target.value)}
                                                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                                                placeholder="Term name"
                                            />
                                            <input
                                                type="date"
                                                value={newTermStart}
                                                onChange={(e) => setNewTermStart(e.target.value)}
                                                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                                            />
                                            <input
                                                type="date"
                                                value={newTermEnd}
                                                onChange={(e) => setNewTermEnd(e.target.value)}
                                                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                                            />
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={cancelEditing}
                                                className="p-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleUpdateTerm(term.id)}
                                                className="p-2 text-green-600 hover:text-green-700 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => handleSetActiveTerm(term.id)}
                                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${term.isActive
                                                    ? 'border-purple-600 bg-purple-600'
                                                    : 'border-slate-300 dark:border-slate-600 hover:border-purple-400'
                                                    }`}
                                            >
                                                {term.isActive && <Check className="w-3 h-3 text-white" />}
                                            </button>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-900 dark:text-white">{term.name}</span>
                                                    {term.isActive && (
                                                        <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full font-bold">
                                                            Active
                                                        </span>
                                                    )}
                                                </div>
                                                {(term.startDate || term.endDate) && (
                                                    <p className="text-sm text-slate-500">
                                                        {term.startDate && new Date(term.startDate).toLocaleDateString()}
                                                        {term.startDate && term.endDate && ' → '}
                                                        {term.endDate && new Date(term.endDate).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => startEditing(term)}
                                                className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteTerm(term.id)}
                                                className={`p-2 rounded-lg transition-colors ${term.isActive
                                                    ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                                                    : 'text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                                                    }`}
                                                title={term.isActive ? "Cannot delete active term" : "Delete"}
                                                disabled={term.isActive}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Access Control */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 text-purple-600 rounded-lg">
                        <Shield className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Access & Security</h2>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white">Maintenance Mode</h3>
                            <p className="text-sm text-slate-500">Disable access for all students temporarily.</p>
                        </div>
                        <button
                            onClick={() => handleToggle("maintenanceMode")}
                            className={`w-12 h-6 rounded-full transition-colors relative ${settings.maintenanceMode ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.maintenanceMode ? "left-7" : "left-1"}`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white">Allow New Registrations</h3>
                            <p className="text-sm text-slate-500">Students can sign up with university email.</p>
                        </div>
                        <button
                            onClick={() => handleToggle("allowRegistrations")}
                            className={`w-12 h-6 rounded-full transition-colors relative ${settings.allowRegistrations ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.allowRegistrations ? "left-7" : "left-1"}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Notifications */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/20 text-amber-600 rounded-lg">
                        <Bell className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Automation</h2>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white">Email Notifications</h3>
                            <p className="text-sm text-slate-500">Send emails on submission status change.</p>
                        </div>
                        <button
                            onClick={() => handleToggle("emailNotifications")}
                            className={`w-12 h-6 rounded-full transition-colors relative ${settings.emailNotifications ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.emailNotifications ? "left-7" : "left-1"}`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800">
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white">Auto-Approve Scientific</h3>
                            <p className="text-sm text-slate-500">Automatically approve recognized journal papers.</p>
                        </div>
                        <button
                            onClick={() => handleToggle("autoApproveScientific")}
                            className={`w-12 h-6 rounded-full transition-colors relative ${settings.autoApproveScientific ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.autoApproveScientific ? "left-7" : "left-1"}`} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Saving to Database...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            Save Configuration
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
