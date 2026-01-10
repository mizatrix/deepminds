import { ACHIEVEMENT_CATEGORIES } from '@/lib/categories';

const RECENT_SEARCHES_KEY = 'msa_grad_recent_searches';
const MAX_RECENT_SEARCHES = 5;

export interface SearchResult {
    id: string;
    type: 'category' | 'submission' | 'action';
    title: string;
    subtitle?: string;
    icon?: string;
    href: string;
}

export interface SubmissionForSearch {
    id: string;
    title: string;
    category: string;
    status: string;
    studentName?: string;
    studentEmail?: string;
}

class SearchService {
    // Search categories
    searchCategories(query: string): SearchResult[] {
        if (!query.trim()) return [];

        const lowerQuery = query.toLowerCase();
        return ACHIEVEMENT_CATEGORIES
            .filter(cat =>
                cat.name.toLowerCase().includes(lowerQuery) ||
                cat.description.toLowerCase().includes(lowerQuery)
            )
            .map(cat => ({
                id: `cat-${cat.id}`,
                type: 'category' as const,
                title: cat.name,
                subtitle: cat.description,
                icon: cat.icon,
                href: `/#categories`
            }));
    }

    // Search submissions from localStorage
    searchSubmissions(query: string, userEmail?: string): SearchResult[] {
        if (!query.trim() || typeof window === 'undefined') return [];

        const lowerQuery = query.toLowerCase();
        const submissions: SubmissionForSearch[] = JSON.parse(
            localStorage.getItem('submissions') || '[]'
        );

        // Filter by user if provided
        const filtered = userEmail
            ? submissions.filter((s: { studentEmail?: string }) => s.studentEmail === userEmail)
            : submissions;

        return filtered
            .filter((sub: SubmissionForSearch) =>
                sub.title.toLowerCase().includes(lowerQuery) ||
                sub.category.toLowerCase().includes(lowerQuery)
            )
            .slice(0, 5)
            .map((sub: SubmissionForSearch) => ({
                id: `sub-${sub.id}`,
                type: 'submission' as const,
                title: sub.title,
                subtitle: `${sub.category} • ${sub.status}`,
                href: '/student/dashboard'
            }));
    }

    // Get quick actions that match query
    getQuickActions(query: string): SearchResult[] {
        if (!query.trim()) return [];

        const lowerQuery = query.toLowerCase();
        const actions: SearchResult[] = [
            { id: 'action-dashboard', type: 'action', title: 'Go to Dashboard', subtitle: 'View your submissions and stats', href: '/student/dashboard' },
            { id: 'action-submit', type: 'action', title: 'Submit Achievement', subtitle: 'Add a new achievement', href: '/' },
            { id: 'action-profile', type: 'action', title: 'Edit Profile', subtitle: 'Update your profile information', href: '/profile' },
            { id: 'action-badges', type: 'action', title: 'View Badges', subtitle: 'See your earned badges', href: '/student/badges' },
            { id: 'action-certificates', type: 'action', title: 'View Certificates', subtitle: 'See your certificates', href: '/student/certificates' },
            { id: 'action-leaderboard', type: 'action', title: 'Leaderboard', subtitle: 'See top performers', href: '/student/leaderboard' },
            { id: 'action-notifications', type: 'action', title: 'Notifications', subtitle: 'View all notifications', href: '/student/notifications' },
        ];

        return actions.filter(action =>
            action.title.toLowerCase().includes(lowerQuery) ||
            action.subtitle?.toLowerCase().includes(lowerQuery)
        );
    }

    // Get recent searches
    getRecentSearches(): string[] {
        if (typeof window === 'undefined') return [];
        const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
        return stored ? JSON.parse(stored) : [];
    }

    // Add a search to recent searches
    addRecentSearch(query: string): void {
        if (typeof window === 'undefined' || !query.trim()) return;

        const recent = this.getRecentSearches();
        // Remove if already exists, then add to front
        const filtered = recent.filter(s => s.toLowerCase() !== query.toLowerCase());
        const updated = [query, ...filtered].slice(0, MAX_RECENT_SEARCHES);
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    }

    // Clear recent searches
    clearRecentSearches(): void {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(RECENT_SEARCHES_KEY);
    }

    // Combined search
    search(query: string, userEmail?: string): {
        categories: SearchResult[];
        submissions: SearchResult[];
        actions: SearchResult[];
    } {
        return {
            categories: this.searchCategories(query),
            submissions: this.searchSubmissions(query, userEmail),
            actions: this.getQuickActions(query)
        };
    }
}

export const searchService = new SearchService();
