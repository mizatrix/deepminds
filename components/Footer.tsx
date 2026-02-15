"use client";

import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, MapPin, Mail, GraduationCap } from "lucide-react";

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
                        <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed text-justify" style={{ hyphens: 'auto', wordSpacing: '-0.5px' }}>
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
                                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                    </svg>
                                </div>
                                <a href="https://wa.me/201289777684" target="_blank" rel="noopener noreferrer" className="hover:text-purple-600 transition-colors">
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
