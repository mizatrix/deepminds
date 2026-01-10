import { notFound } from "next/navigation";
import { achievements } from "@/lib/data";
import AchievementCard from "@/components/AchievementCard";
import AchievementForm from "@/components/AchievementForm";
import Hero from "@/components/Hero";

const groupMap: Record<string, { title: string; categories: string[] }> = {
    scientific: { title: "Scientific & Artistic", categories: ["scientific", "artistic"] },
    training: { title: "Training & Internships", categories: ["training", "internship"] },
    competition: { title: "Competitions", categories: ["competition"] },
    award: { title: "Awards & Recognition", categories: ["award"] },
    sports: { title: "Sports Achievements", categories: ["sports"] },
};

export function generateStaticParams() {
    return Object.keys(groupMap).map((group) => ({ group }));
}

export default async function CategoryPage({ params }: { params: Promise<{ group: string }> }) {
    const { group } = await params;
    const config = groupMap[group];

    if (!config) {
        return notFound();
    }

    const filteredAchievements = achievements.filter(
        (a) => config.categories.includes(a.category) && a.status === "approved"
    );

    return (
        <div className="space-y-12">
            <section className="bg-blue-600 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-90" />
                <div className="relative z-10">
                    <h1 className="text-3xl md:text-5xl font-bold mb-4">{config.title}</h1>
                    <p className="text-blue-100 max-w-2xl text-lg">
                        Browse and submit entries for {config.title.toLowerCase()}.
                    </p>
                </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Recent Approved Entries</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredAchievements.length > 0 ? (
                            filteredAchievements.map((achievement) => (
                                <AchievementCard key={achievement.id} achievement={achievement} />
                            ))
                        ) : (
                            <div className="col-span-full p-12 text-center text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                                No achievements found in this category yet. Be the first to submit!
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="sticky top-24">
                        <AchievementForm group={group} />
                    </div>
                </div>
            </section>
        </div>
    );
}
