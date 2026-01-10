'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, ArrowRight, Folder, FileText, Zap, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { searchService, SearchResult } from '@/lib/search/service';

interface GlobalSearchProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<{ categories: SearchResult[]; submissions: SearchResult[]; actions: SearchResult[] }>({
        categories: [],
        submissions: [],
        actions: []
    });
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [mounted, setMounted] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Load recent searches when opening
    useEffect(() => {
        if (isOpen) {
            setRecentSearches(searchService.getRecentSearches());
            setQuery('');
            setResults({ categories: [], submissions: [], actions: [] });
            setSelectedIndex(0);
            // Focus input after animation
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Search when query changes
    useEffect(() => {
        if (query.trim()) {
            const userEmail = typeof window !== 'undefined' ? localStorage.getItem('userEmail') || undefined : undefined;
            const searchResults = searchService.search(query, userEmail);
            setResults(searchResults);
            setSelectedIndex(0);
        } else {
            setResults({ categories: [], submissions: [], actions: [] });
        }
    }, [query]);

    // Build flat list of all results for keyboard navigation
    const allResults = [
        ...results.actions,
        ...results.categories,
        ...results.submissions
    ];

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, allResults.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter' && allResults[selectedIndex]) {
            e.preventDefault();
            handleSelect(allResults[selectedIndex]);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            onClose();
        }
    }, [allResults, selectedIndex, onClose]);

    const handleSelect = (result: SearchResult) => {
        if (query.trim()) {
            searchService.addRecentSearch(query);
        }
        router.push(result.href);
        onClose();
    };

    const handleRecentSearch = (search: string) => {
        setQuery(search);
    };

    const handleClearRecent = () => {
        searchService.clearRecentSearches();
        setRecentSearches([]);
    };

    const getResultIcon = (type: SearchResult['type']) => {
        switch (type) {
            case 'category':
                return <Folder className="w-4 h-4 text-purple-500" />;
            case 'submission':
                return <FileText className="w-4 h-4 text-blue-500" />;
            case 'action':
                return <Zap className="w-4 h-4 text-amber-500" />;
        }
    };

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-[101] px-4"
                    >
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                            {/* Search Input */}
                            <div className="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-800">
                                <Search className="w-5 h-5 text-slate-400" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Search categories, submissions, or actions..."
                                    className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 outline-none text-base"
                                />
                                {query && (
                                    <button
                                        onClick={() => setQuery('')}
                                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                    >
                                        <X className="w-4 h-4 text-slate-400" />
                                    </button>
                                )}
                                <div className="hidden sm:flex items-center gap-1 text-xs text-slate-400 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1">
                                    <span>ESC</span>
                                </div>
                            </div>

                            {/* Results */}
                            <div className="max-h-[60vh] overflow-y-auto">
                                {/* Recent Searches */}
                                {!query && recentSearches.length > 0 && (
                                    <div className="p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-bold uppercase text-slate-400">Recent Searches</span>
                                            <button
                                                onClick={handleClearRecent}
                                                className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                                Clear
                                            </button>
                                        </div>
                                        <div className="space-y-1">
                                            {recentSearches.map((search, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => handleRecentSearch(search)}
                                                    className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
                                                >
                                                    <Clock className="w-4 h-4 text-slate-400" />
                                                    {search}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* No Query State */}
                                {!query && recentSearches.length === 0 && (
                                    <div className="p-8 text-center">
                                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <Search className="w-6 h-6 text-slate-400" />
                                        </div>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                                            Start typing to search...
                                        </p>
                                    </div>
                                )}

                                {/* Search Results */}
                                {query && (
                                    <div className="p-2">
                                        {/* Quick Actions */}
                                        {results.actions.length > 0 && (
                                            <div className="mb-4">
                                                <span className="block px-3 py-2 text-xs font-bold uppercase text-slate-400">
                                                    Quick Actions
                                                </span>
                                                {results.actions.map((result, i) => {
                                                    const globalIndex = i;
                                                    return (
                                                        <button
                                                            key={result.id}
                                                            onClick={() => handleSelect(result)}
                                                            className={`w-full flex items-center gap-3 px-3 py-3 text-left rounded-xl transition-colors ${selectedIndex === globalIndex
                                                                    ? 'bg-purple-50 dark:bg-purple-900/20'
                                                                    : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                                                                }`}
                                                        >
                                                            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                                                {getResultIcon(result.type)}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                                    {result.title}
                                                                </p>
                                                                {result.subtitle && (
                                                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                                        {result.subtitle}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <ArrowRight className="w-4 h-4 text-slate-300" />
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* Categories */}
                                        {results.categories.length > 0 && (
                                            <div className="mb-4">
                                                <span className="block px-3 py-2 text-xs font-bold uppercase text-slate-400">
                                                    Categories
                                                </span>
                                                {results.categories.map((result, i) => {
                                                    const globalIndex = results.actions.length + i;
                                                    return (
                                                        <button
                                                            key={result.id}
                                                            onClick={() => handleSelect(result)}
                                                            className={`w-full flex items-center gap-3 px-3 py-3 text-left rounded-xl transition-colors ${selectedIndex === globalIndex
                                                                    ? 'bg-purple-50 dark:bg-purple-900/20'
                                                                    : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                                                                }`}
                                                        >
                                                            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-lg">
                                                                {result.icon}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                                    {result.title}
                                                                </p>
                                                                {result.subtitle && (
                                                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                                        {result.subtitle}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <ArrowRight className="w-4 h-4 text-slate-300" />
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* Submissions */}
                                        {results.submissions.length > 0 && (
                                            <div>
                                                <span className="block px-3 py-2 text-xs font-bold uppercase text-slate-400">
                                                    Your Submissions
                                                </span>
                                                {results.submissions.map((result, i) => {
                                                    const globalIndex = results.actions.length + results.categories.length + i;
                                                    return (
                                                        <button
                                                            key={result.id}
                                                            onClick={() => handleSelect(result)}
                                                            className={`w-full flex items-center gap-3 px-3 py-3 text-left rounded-xl transition-colors ${selectedIndex === globalIndex
                                                                    ? 'bg-purple-50 dark:bg-purple-900/20'
                                                                    : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                                                                }`}
                                                        >
                                                            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                                                {getResultIcon(result.type)}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-slate-900 dark:text-white">
                                                                    {result.title}
                                                                </p>
                                                                {result.subtitle && (
                                                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                                        {result.subtitle}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <ArrowRight className="w-4 h-4 text-slate-300" />
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* No Results */}
                                        {allResults.length === 0 && (
                                            <div className="p-8 text-center">
                                                <p className="text-slate-500 dark:text-slate-400 text-sm">
                                                    No results found for "{query}"
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1">
                                        <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">↑</kbd>
                                        <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">↓</kbd>
                                        to navigate
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">↵</kbd>
                                        to select
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}
