"use client";

import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, MapPin, Phone, Mail, GraduationCap } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-20">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-12 mb-16">

                    {/* Brand & Description */}
                    <div className="space-y-4 text-center lg:text-left">
                        <Link href="/" className="flex items-center gap-2 justify-center lg:justify-start">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white">
                                <GraduationCap className="w-5 h-5" />
                            </div>
                            <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                                CS <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Excellence</span>
                            </span>
                        </Link>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                            Celebrating the achievements of our outstanding Computer Science students. CS Excellence recognizes and rewards academic and extracurricular accomplishments.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="text-center lg:text-left">
                        <h3 className="font-bold mb-4"><span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Quick Links</span></h3>
                        <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                            <li><Link href="/" className="hover:text-purple-600 transition-colors inline-block">Home</Link></li>
                            <li><Link href="/student/dashboard" className="hover:text-purple-600 transition-colors inline-block">My Dashboard</Link></li>
                            <li><Link href="/student/leaderboard" className="hover:text-purple-600 transition-colors inline-block">Leaderboard</Link></li>
                            <li><Link href="/student/badges" className="hover:text-purple-600 transition-colors inline-block">Badges Gallery</Link></li>
                            <li><Link href="/student/certificates" className="hover:text-purple-600 transition-colors inline-block">Certificates</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="text-center lg:text-left">
                        <h3 className="font-bold mb-4"><span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Stay Updated</span></h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                            Get the latest achievements and updates delivered to your inbox.
                        </p>
                        <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full px-4 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                required
                            />
                            <button
                                type="submit"
                                className="w-full px-4 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:shadow-lg hover:scale-105 transition-all"
                            >
                                Subscribe
                            </button>
                        </form>
                        <p className="text-xs text-slate-400 mt-3">
                            We respect your privacy. Unsubscribe anytime.
                        </p>
                    </div>

                    {/* Contact */}
                    <div className="text-center lg:text-left">
                        <h3 className="font-bold mb-4"><span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Contact Us</span></h3>
                        <ul className="space-y-4 text-sm text-slate-500 dark:text-slate-400">
                            <li className="flex items-start gap-3 justify-center lg:justify-start">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                                    <MapPin className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-left">
                                    26 July Mehwar Road, 6th October City, Egypt
                                </span>
                            </li>
                            <li className="flex items-center gap-3 justify-center lg:justify-start">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shrink-0">
                                    <Phone className="w-5 h-5 text-white" />
                                </div>
                                <a href="tel:+201289777684" className="hover:text-purple-600 transition-colors">
                                    +20 128 977 7684
                                </a>
                            </li>
                            <li className="flex items-center gap-3 justify-center lg:justify-start">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shrink-0">
                                    <Mail className="w-5 h-5 text-white" />
                                </div>
                                <a href="mailto:csexcellence@msa.edu.eg" className="hover:text-purple-600 transition-colors">csexcellence@msa.edu.eg</a>
                            </li>
                        </ul>
                    </div>

                </div>

                <div className="border-t border-slate-200 dark:border-slate-800 mt-16 pt-10 text-center text-sm text-slate-400">
                    <p>© {new Date().getFullYear()} CS Excellence. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
