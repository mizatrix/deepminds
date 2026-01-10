"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
    User,
    Mail,
    Phone,
    Building2,
    GraduationCap,
    Briefcase,
    Edit3,
    Save,
    X,
    Camera,
    Linkedin,
    Github,
    Twitter,
    Globe,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SkeletonProfilePage } from "@/components/ui/Skeleton";

interface ProfileData {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar?: string;
    image?: string;
    faculty?: string;
    year?: string;
    studentId?: string;
    department?: string;
    position?: string;
    phone?: string;
    bio?: string;
    linkedIn?: string;
    github?: string;
    twitter?: string;
    website?: string;
    profileCompleted: boolean;
    completionPercentage: number;
}

interface CompletionData {
    percentage: number;
    isComplete: boolean;
    missingFields: string[];
    requiredFields: string[];
}

export default function ProfilePage() {
    const { data: session } = useSession();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [completion, setCompletion] = useState<CompletionData | null>(null);
    const [formData, setFormData] = useState<Partial<ProfileData>>({});
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch("/api/profile");
            const data = await res.json();
            setProfile(data.user);
            setCompletion(data.completion);
            setFormData(data.user);
            setLoading(false);
        } catch (error) {
            console.error("Failed to fetch profile:", error);
            setLoading(false);
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
        setFormData(profile || {});
    };

    const handleCancel = () => {
        setIsEditing(false);
        setFormData(profile || {});
        setAvatarPreview(null);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            setProfile(data.user);
            setCompletion(data.completion);
            setIsEditing(false);
            setAvatarPreview(null);
        } catch (error) {
            console.error("Failed to update profile:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
                setFormData((prev) => ({ ...prev, avatar: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    if (loading) {
        return <SkeletonProfilePage />;
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-slate-500">Profile not found</p>
            </div>
        );
    }

    const isStudent = profile.role === "STUDENT";
    const displayAvatar = avatarPreview || profile.avatar || profile.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`;

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Profile Completion Banner */}
                {!completion?.isComplete && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-3xl"
                    >
                        <div className="flex items-start gap-4">
                            <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" />
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                                    Complete Your Profile ({completion?.percentage}%)
                                </h3>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 mb-3">
                                    <div
                                        className="bg-gradient-to-r from-amber-500 to-orange-500 h-3 rounded-full transition-all duration-500"
                                        style={{ width: `${completion?.percentage}%` }}
                                    />
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                    Missing fields: {completion?.missingFields.join(", ")}
                                </p>
                                {!isEditing && (
                                    <button
                                        onClick={handleEdit}
                                        className="text-sm font-bold text-amber-600 dark:text-amber-400 hover:underline"
                                    >
                                        Complete Now →
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Profile Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl mb-8"
                >
                    {/* Cover */}
                    <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600 relative">
                        <div className="absolute inset-0 bg-grid-white/10" />
                    </div>

                    {/* Avatar & Basic Info */}
                    <div className="px-8 pb-8 -mt-16 relative">
                        <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                            {/* Avatar */}
                            <div className="relative group">
                                <img
                                    src={displayAvatar}
                                    alt={profile.name}
                                    className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-900 shadow-xl"
                                />
                                {isEditing && (
                                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="w-8 h-8 text-white" />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarChange}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>

                            {/* Name & Role */}
                            <div className="flex-1 text-center md:text-left">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.name || ""}
                                        onChange={(e) => handleInputChange("name", e.target.value)}
                                        className="text-3xl font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl border-2 border-blue-500 w-full mb-2"
                                    />
                                ) : (
                                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2">
                                        {profile.name}
                                    </h1>
                                )}
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-slate-500 dark:text-slate-400">
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        <span>{profile.email}</span>
                                    </div>
                                    <span>•</span>
                                    <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-bold">
                                        {isStudent ? "Student" : "Admin"}
                                    </div>
                                </div>
                            </div>

                            {/* Edit Button */}
                            {!isEditing ? (
                                <button
                                    onClick={handleEdit}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl hover:shadow-xl hover:shadow-blue-500/30 transition-all flex items-center gap-2"
                                >
                                    <Edit3 className="w-5 h-5" />
                                    Edit Profile
                                </button>
                            ) : (
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleCancel}
                                        className="px-6 py-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
                                    >
                                        <X className="w-5 h-5" />
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-2xl hover:shadow-xl hover:shadow-green-500/30 transition-all flex items-center gap-2 disabled:opacity-50"
                                    >
                                        <Save className="w-5 h-5" />
                                        {saving ? "Saving..." : "Save Changes"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Profile Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Personal Information */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-lg"
                    >
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <User className="w-6 h-6 text-blue-600" />
                            Personal Information
                        </h2>

                        <div className="space-y-4">
                            {isStudent ? (
                                <>
                                    <ProfileField
                                        icon={Building2}
                                        label="Faculty"
                                        value={formData.faculty}
                                        isEditing={isEditing}
                                        onChange={(v) => handleInputChange("faculty", v)}
                                        placeholder="e.g., Computer Science"
                                    />
                                    <ProfileField
                                        icon={GraduationCap}
                                        label="Academic Year"
                                        value={formData.year}
                                        isEditing={isEditing}
                                        onChange={(v) => handleInputChange("year", v)}
                                        placeholder="e.g., 2nd Year"
                                    />
                                    <ProfileField
                                        icon={User}
                                        label="Student ID"
                                        value={formData.studentId}
                                        isEditing={isEditing}
                                        onChange={(v) => handleInputChange("studentId", v)}
                                        placeholder="e.g., 2023001"
                                    />
                                </>
                            ) : (
                                <>
                                    <ProfileField
                                        icon={Building2}
                                        label="Department"
                                        value={formData.department}
                                        isEditing={isEditing}
                                        onChange={(v) => handleInputChange("department", v)}
                                        placeholder="e.g., Computer Science"
                                    />
                                    <ProfileField
                                        icon={Briefcase}
                                        label="Position"
                                        value={formData.position}
                                        isEditing={isEditing}
                                        onChange={(v) => handleInputChange("position", v)}
                                        placeholder="e.g., Professor"
                                    />
                                </>
                            )}
                            <ProfileField
                                icon={Phone}
                                label="Phone"
                                value={formData.phone}
                                isEditing={isEditing}
                                onChange={(v) => handleInputChange("phone", v)}
                                placeholder="+20 123 456 7890"
                            />
                        </div>
                    </motion.div>

                    {/* About & Social Links */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-8"
                    >
                        {/* Bio */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-lg">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">
                                About
                            </h2>
                            {isEditing ? (
                                <textarea
                                    value={formData.bio || ""}
                                    onChange={(e) => handleInputChange("bio", e.target.value)}
                                    placeholder="Tell us about yourself... (max 500 characters)"
                                    maxLength={500}
                                    rows={5}
                                    className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3 rounded-xl border-2 border-blue-500 resize-none"
                                />
                            ) : (
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                    {profile.bio || "No bio added yet."}
                                </p>
                            )}
                        </div>

                        {/* Social Links */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-lg">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">
                                Social Links
                            </h2>
                            <div className="space-y-4">
                                <SocialField
                                    icon={Linkedin}
                                    label="LinkedIn"
                                    value={formData.linkedIn}
                                    isEditing={isEditing}
                                    onChange={(v) => handleInputChange("linkedIn", v)}
                                    placeholder="https://linkedin.com/in/username"
                                />
                                <SocialField
                                    icon={Github}
                                    label="GitHub"
                                    value={formData.github}
                                    isEditing={isEditing}
                                    onChange={(v) => handleInputChange("github", v)}
                                    placeholder="https://github.com/username"
                                />
                                <SocialField
                                    icon={Twitter}
                                    label="Twitter"
                                    value={formData.twitter}
                                    isEditing={isEditing}
                                    onChange={(v) => handleInputChange("twitter", v)}
                                    placeholder="https://twitter.com/username"
                                />
                                <SocialField
                                    icon={Globe}
                                    label="Website"
                                    value={formData.website}
                                    isEditing={isEditing}
                                    onChange={(v) => handleInputChange("website", v)}
                                    placeholder="https://yourwebsite.com"
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

// Helper Components
interface ProfileFieldProps {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value?: string;
    isEditing: boolean;
    onChange: (value: string) => void;
    placeholder?: string;
}

function ProfileField({
    icon: Icon,
    label,
    value,
    isEditing,
    onChange,
    placeholder,
}: ProfileFieldProps) {
    return (
        <div>
            <label className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-2">
                <Icon className="w-4 h-4" />
                {label}
            </label>
            {isEditing ? (
                <input
                    type="text"
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-2 rounded-xl border-2 border-transparent focus:border-blue-500 transition-colors"
                />
            ) : (
                <p className="text-slate-900 dark:text-white font-medium">
                    {value || <span className="text-slate-400">Not set</span>}
                </p>
            )}
        </div>
    );
}

interface SocialFieldProps {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value?: string;
    isEditing: boolean;
    onChange: (value: string) => void;
    placeholder?: string;
}

function SocialField({
    icon: Icon,
    label,
    value,
    isEditing,
    onChange,
    placeholder,
}: SocialFieldProps) {
    return (
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </div>
            {isEditing ? (
                <input
                    type="url"
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-2 rounded-xl border-2 border-transparent focus:border-blue-500 transition-colors text-sm"
                />
            ) : value ? (
                <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-blue-600 dark:text-blue-400 hover:underline text-sm truncate"
                >
                    {value}
                </a>
            ) : (
                <span className="flex-1 text-slate-400 text-sm">Not set</span>
            )}
        </div>
    );
}
