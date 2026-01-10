import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";

export default function Hero() {
    return (
        <section className="relative overflow-hidden rounded-3xl bg-blue-600 dark:bg-blue-950 text-white shadow-2xl mb-12">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-700 dark:from-blue-900 dark:to-indigo-950 opacity-90" />
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white/10 dark:bg-white/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative px-8 py-16 md:py-24 md:px-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="max-w-2xl space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/30 text-blue-50 text-sm font-medium border border-blue-400/20">
                        <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                        <span>Celebrating Student Success</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                        Document Your <br />
                        <span className="text-blue-100">Academic Excellence</span>
                    </h1>
                    <p className="text-lg md:text-xl text-blue-100/90 leading-relaxed max-w-lg">
                        A centralized platform to showcase your scientific research, sports achievements, competitions, and more.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                        <Link
                            href="/login"
                            className="w-full sm:w-auto px-8 py-4 bg-white text-blue-600 rounded-full font-bold hover:bg-blue-50 transition-colors shadow-lg flex items-center justify-center gap-2"
                        >
                            Get Started <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link
                            href="#latest"
                            className="w-full sm:w-auto px-8 py-4 bg-blue-700/50 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors backdrop-blur-sm flex items-center justify-center"
                        >
                            Browse Latest
                        </Link>
                    </div>
                </div>

                {/* Decorative Grid/Graphic */}
                <div className="hidden md:block relative w-64 h-64 lg:w-80 lg:h-80 opacity-90">
                    <div className="grid grid-cols-2 gap-4 rotate-12">
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl shadow-inner border border-white/20 h-32 w-32 animate-pulse" style={{ animationDuration: '3s' }}></div>
                        <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl shadow-inner border border-white/20 h-32 w-32 mt-8"></div>
                        <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl shadow-inner border border-white/20 h-32 w-32 -mt-8"></div>
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl shadow-inner border border-white/20 h-32 w-32 animate-pulse" style={{ animationDuration: '4s' }}></div>
                    </div>
                </div>
            </div>
        </section>
    );
}
