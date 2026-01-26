"use client";

import { useState, useEffect } from "react";
import { useRole } from "@/lib/RoleContext";
import { usePortalName } from "@/lib/SettingsContext";
import StudentSubmissionForm from "@/components/AchievementSubmissionForm";
import BackgroundGradient from "@/components/BackgroundGradient";
import DataWall from "@/components/DataWall";
import CategoriesSection from "@/components/CategoriesSection";
import { motion } from "framer-motion";
import { Sparkles, Shield, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { isAdmin, isAuthenticated } = useRole();
  const portalName = usePortalName();
  const [isInitialMount, setIsInitialMount] = useState(true);

  useEffect(() => {
    setIsInitialMount(false);
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-160px)] pt-8">
      <BackgroundGradient />

      <motion.div
        key="student-home"
        initial={isInitialMount ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12 pb-20"
      >
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest shadow-lg shadow-blue-500/10 mb-4">
            <Sparkles className="w-4 h-4" />
            {portalName}
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight mb-4">
            Your Journey <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Matters!</span>
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400">
            {isAdmin && isAuthenticated
              ? "Welcome, Admin! Use the Admin Panel to manage submissions and users."
              : <>Ready to impress? Add your <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Achievement(s)</span> now</>
            }
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-16">
          {/* Left: Submission Form OR Admin Message */}
          <div className="w-full">
            {isAdmin && isAuthenticated ? (
              /* Admin Welcome Card */
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-800">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                    Welcome, Administrator
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 mb-6">
                    As an admin, you manage and review student achievements.
                    Use the Admin Panel to access your management tools.
                  </p>
                  <Link
                    href="/admin/dashboard"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all"
                  >
                    Go to Admin Panel
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Link href="/admin/submissions" className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-center">
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">Review Submissions</p>
                    </Link>
                    <Link href="/admin/analytics" className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-center">
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">View Analytics</p>
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <StudentSubmissionForm />
            )}
          </div>

          {/* Right: Data Wall (Sticky) */}
          <div className="hidden lg:block w-full h-[600px] sticky top-24">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-purple-500/5 rounded-3xl" />
            <DataWall />
          </div>
        </div>

        <CategoriesSection />
      </motion.div>
    </div>
  );
}
