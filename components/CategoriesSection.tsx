"use client";

import Link from "next/link";
import { Microscope, Palette, Trophy, Briefcase, Heart, Dumbbell, Star, Rocket, Globe, GraduationCap, Sparkles, Code } from "lucide-react";
import { motion } from "framer-motion";

const categories = [
    {
        id: "SCIENTIFIC",
        title: "Scientific",
        icon: Microscope,
        description: "Research papers, publications, and academic discoveries.",
        color: "text-cyan-500",
        bg: "bg-cyan-50 dark:bg-cyan-900/20",
        border: "border-cyan-200 dark:border-cyan-800"
    },
    {
        id: "ARTISTIC",
        title: "Artistic",
        icon: Palette,
        description: "Creative arts, music, digital design, and exhibitions.",
        color: "text-purple-500",
        bg: "bg-purple-50 dark:bg-purple-900/20",
        border: "border-purple-200 dark:border-purple-800"
    },
    {
        id: "SPECIAL TRAINING",
        title: "Special Training",
        icon: GraduationCap,
        description: "Workshops, courses, certifications, and skill development.",
        color: "text-teal-500",
        bg: "bg-teal-50 dark:bg-teal-900/20",
        border: "border-teal-200 dark:border-teal-800"
    },
    {
        id: "COMPETITION",
        title: "Competitions",
        icon: Trophy,
        description: "Case studies, contests, and competitive challenges.",
        color: "text-yellow-500",
        bg: "bg-yellow-50 dark:bg-yellow-900/20",
        border: "border-yellow-200 dark:border-yellow-800"
    },
    {
        id: "HACKATHONS",
        title: "Hackathons",
        icon: Code,
        description: "Coding marathons, innovation challenges, and tech competitions.",
        color: "text-violet-500",
        bg: "bg-violet-50 dark:bg-violet-900/20",
        border: "border-violet-200 dark:border-violet-800"
    },
    {
        id: "AWARDS",
        title: "Awards",
        icon: Star,
        description: "Honors, recognitions, scholarships, and prestigious academic awards.",
        color: "text-amber-500",
        bg: "bg-amber-50 dark:bg-amber-900/20",
        border: "border-amber-200 dark:border-amber-800"
    },
    {
        id: "SPORTS",
        title: "Sports",
        icon: Dumbbell,
        description: "University teams, national championships, and athletic awards.",
        color: "text-orange-500",
        bg: "bg-orange-50 dark:bg-orange-900/20",
        border: "border-orange-200 dark:border-orange-800"
    },
    {
        id: "INTERNSHIPS",
        title: "Internships",
        icon: Briefcase,
        description: "Professional experience and training at top-tier companies.",
        color: "text-blue-500",
        bg: "bg-blue-50 dark:bg-blue-900/20",
        border: "border-blue-200 dark:border-blue-800"
    },
    {
        id: "VOLUNTEERING",
        title: "Volunteering",
        icon: Heart,
        description: "Community service, charity work, and social impact.",
        color: "text-red-500",
        bg: "bg-red-50 dark:bg-red-900/20",
        border: "border-red-200 dark:border-red-800"
    },
    {
        id: "ENTREPRENEURSHIP",
        title: "Entrepreneurship",
        icon: Rocket,
        description: "Startups, business ventures, and innovation projects.",
        color: "text-emerald-500",
        bg: "bg-emerald-50 dark:bg-emerald-900/20",
        border: "border-emerald-200 dark:border-emerald-800"
    },
    {
        id: "GLOBAL EXCHANGE",
        title: "Global Exchange",
        icon: Globe,
        description: "International student exchange programs and conferences.",
        color: "text-indigo-500",
        bg: "bg-indigo-50 dark:bg-indigo-900/20",
        border: "border-indigo-200 dark:border-indigo-800"
    },
    {
        id: "OTHER",
        title: "Other",
        icon: Sparkles,
        description: "Miscellaneous achievements, unique contributions, and accomplishments.",
        color: "text-pink-500",
        bg: "bg-pink-50 dark:bg-pink-900/20",
        border: "border-pink-200 dark:border-pink-800"
    }
];


export default function CategoriesSection() {
    return (
        <section id="categories" className="py-20 scroll-mt-24">
            <div className="text-center mb-16 space-y-4">
                <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white">
                    Explore <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Categories</span>
                </h2>
                <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                    Discover the many ways currently recognized for excellence awards at CS Excellence.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {categories.map((cat, i) => (
                    <Link key={cat.id} href={`/categories/${cat.id}`}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className={`p-6 rounded-[2rem] bg-white dark:bg-slate-900 border ${cat.border} shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 group cursor-pointer`}
                        >
                            <div className={`w-14 h-14 rounded-2xl ${cat.bg} ${cat.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                <cat.icon className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{cat.title}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                {cat.description}
                            </p>
                        </motion.div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
