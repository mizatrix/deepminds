"use client";

import { useState, useEffect } from "react";
import { Trophy, Medal, Star, Crown, Search, TrendingUp, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { calculateLeaderboard, LeaderboardEntry } from "@/lib/leaderboard/service";

// Initial empty state
const initialData: LeaderboardEntry[] = [
];

export default function LeaderboardPage() {
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(initialData);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    // Load real leaderboard data
    useEffect(() => {
        async function loadLeaderboard() {
            try {
                const data = await calculateLeaderboard();
                setLeaderboardData(data);
            } catch (error) {
                console.error('Error loading leaderboard:', error);
            } finally {
                setIsLoading(false);
            }
        }
        loadLeaderboard();
    }, []);

    // Filter by search query
    const filteredData = leaderboardData.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Get top 3 for podium
    const top3 = filteredData.slice(0, 3);
    const hasTop3 = top3.length === 3;

    return (
        <div className="container mx-auto px-4 py-12 pb-24">
            {/* Header */}
            <div className="text-center mb-16 space-y-4">
                <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight">
                    Hall of <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-amber-600">Fame</span>
                </h1>
                <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                    Celebrating the most exceptional achievers across the university.
                </p>
            </div>

            {/* Top 3 Podium */}
            {hasTop3 ? (
                <div className="flex flex-col md:flex-row justify-center items-end gap-6 mb-16 max-w-4xl mx-auto">
                    {/* 2nd Place */}
                    <div className="order-2 md:order-1 flex-1 w-full flex flex-col items-center">
                        <div className="relative mb-4">
                            <div className="w-24 h-24 rounded-full border-4 border-slate-300 overflow-hidden shadow-xl">
                                <img src={top3[1].avatar} alt={top3[1].name} className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-400 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg flex items-center gap-1">
                                <Medal className="w-3 h-3" /> 2nd
                            </div>
                        </div>
                        <div className="text-center p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg w-full">
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg">{top3[1].name}</h3>
                            <p className="text-xs text-slate-500 mb-2">{top3[1].faculty}</p>
                            <p className="font-black text-2xl text-slate-400">{top3[1].points} pts</p>
                        </div>
                    </div>

                    {/* 1st Place */}
                    <div className="order-1 md:order-2 flex-1 w-full flex flex-col items-center">
                        <div className="relative mb-6">
                            <Crown className="w-12 h-12 text-yellow-500 absolute -top-14 left-1/2 -translate-x-1/2 animate-bounce" />
                            <div className="w-32 h-32 rounded-full border-4 border-yellow-500 overflow-hidden shadow-2xl shadow-yellow-500/20">
                                <img src={top3[0].avatar} alt={top3[0].name} className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-6 py-1.5 rounded-full font-bold shadow-xl flex items-center gap-2">
                                <Trophy className="w-4 h-4" /> 1st
                            </div>
                        </div>
                        <div className="text-center p-8 bg-gradient-to-b from-yellow-50 to-white dark:from-yellow-900/10 dark:to-slate-900 rounded-[2rem] border-2 border-yellow-500/30 shadow-2xl shadow-yellow-500/10 w-full transform -translate-y-4">
                            <h3 className="font-bold text-slate-900 dark:text-white text-xl">{top3[0].name}</h3>
                            <p className="text-sm text-slate-500 mb-3">{top3[0].faculty}</p>
                            <p className="font-black text-4xl text-yellow-600 dark:text-yellow-500">{top3[0].points} pts</p>
                        </div>
                    </div>

                    {/* 3rd Place */}
                    <div className="order-3 flex-1 w-full flex flex-col items-center">
                        <div className="relative mb-4">
                            <div className="w-24 h-24 rounded-full border-4 border-amber-700 overflow-hidden shadow-xl">
                                <img src={top3[2].avatar} alt={top3[2].name} className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-700 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg flex items-center gap-1">
                                <Medal className="w-3 h-3" /> 3rd
                            </div>
                        </div>
                        <div className="text-center p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg w-full">
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg">{top3[2].name}</h3>
                            <p className="text-xs text-slate-500 mb-2">{top3[2].faculty}</p>
                            <p className="font-black text-2xl text-amber-700">{top3[2].points} pts</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-12 mb-16">
                    <Trophy className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400">No rankings yet. Submit achievements to appear on the leaderboard!</p>
                </div>
            )}

            {/* Filters & List */}
            <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-blue-600" />
                        <h3 className="font-bold text-slate-900 dark:text-white">Computer Science Rankings</h3>
                    </div>

                    <div className="relative w-full md:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search students..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full md:w-64 pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                        />
                    </div>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredData.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">
                            No students found matching "{searchQuery}"
                        </div>
                    ) : filteredData.slice(3).length === 0 ? (
                        <div className="p-12 text-center text-slate-500">
                            Only top 3 students shown above
                        </div>
                    ) : (
                        filteredData.slice(3).map((student) => (
                            <div key={student.rank} className="p-4 md:p-6 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <span className="font-black text-lg text-slate-300 w-8 text-center">#{student.rank}</span>

                                <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
                                    <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                                </div>

                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-900 dark:text-white text-lg">{student.name}</h4>
                                    <p className="text-sm text-slate-500">{student.faculty}</p>
                                </div>

                                <div className="text-right">
                                    <span className="block font-black text-xl text-blue-600 dark:text-blue-400">{student.points}</span>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Points</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
