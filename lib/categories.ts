export const ACHIEVEMENT_CATEGORIES = [
    {
        id: 'SCIENTIFIC',
        name: 'Scientific Research',
        description: 'Research papers, publications, and scientific contributions',
        icon: '🔬',
        color: 'blue',
        gradient: 'from-blue-500 to-cyan-500',
    },
    {
        id: 'ARTISTIC',
        name: 'Artistic Excellence',
        description: 'Creative works, performances, and artistic achievements',
        icon: '🎨',
        color: 'purple',
        gradient: 'from-purple-500 to-pink-500',
    },
    {
        id: 'COMPETITION',
        name: 'Competitions',
        description: 'Awards and recognitions from competitive events',
        icon: '🏆',
        color: 'amber',
        gradient: 'from-amber-500 to-orange-500',
    },
    {
        id: 'HACKATHONS',
        name: 'Hackathons',
        description: 'Coding competitions and innovation challenges',
        icon: '💻',
        color: 'green',
        gradient: 'from-green-500 to-emerald-500',
    },
    {
        id: 'AWARDS',
        name: 'Awards & Honors',
        description: 'Academic and professional recognitions',
        icon: '⭐',
        color: 'yellow',
        gradient: 'from-yellow-500 to-amber-500',
    },
    {
        id: 'SPORTS',
        name: 'Sports',
        description: 'Athletic achievements and sports competitions',
        icon: '⚽',
        color: 'red',
        gradient: 'from-red-500 to-rose-500',
    },
    {
        id: 'INTERNSHIPS',
        name: 'Internships',
        description: 'Professional internship experiences',
        icon: '💼',
        color: 'indigo',
        gradient: 'from-indigo-500 to-blue-500',
    },
    {
        id: 'VOLUNTEERING',
        name: 'Volunteering',
        description: 'Community service and volunteer work',
        icon: '🤝',
        color: 'teal',
        gradient: 'from-teal-500 to-cyan-500',
    },
    {
        id: 'ENTREPRENEURSHIP',
        name: 'Entrepreneurship',
        description: 'Startups, business ventures, and innovation',
        icon: '🚀',
        color: 'violet',
        gradient: 'from-violet-500 to-purple-500',
    },
    {
        id: 'GLOBAL EXCHANGE',
        name: 'Global Exchange',
        description: 'International programs and cultural exchanges',
        icon: '🌍',
        color: 'sky',
        gradient: 'from-sky-500 to-blue-500',
    },
    {
        id: 'SPECIAL TRAINING',
        name: 'Special Training',
        description: 'Specialized courses and certifications',
        icon: '📚',
        color: 'emerald',
        gradient: 'from-emerald-500 to-green-500',
    },
    {
        id: 'OTHER',
        name: 'Other',
        description: 'Miscellaneous achievements',
        icon: '✨',
        color: 'slate',
        gradient: 'from-slate-500 to-gray-500',
    },
] as const;

export type CategoryId = typeof ACHIEVEMENT_CATEGORIES[number]['id'];

export function getCategoryById(id: string) {
    return ACHIEVEMENT_CATEGORIES.find(cat => cat.id === id);
}

export function getCategoryColor(id: string) {
    const category = getCategoryById(id);
    return category?.color || 'slate';
}

export function getCategoryGradient(id: string) {
    const category = getCategoryById(id);
    return category?.gradient || 'from-slate-500 to-gray-500';
}
