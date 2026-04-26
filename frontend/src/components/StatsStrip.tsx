import type { Stat } from "@/lib/types";

export default function StatsStrip({ stats }: { stats: Stat[] }) {
  if (!stats || stats.length === 0) return null;
  return (
    <section className="border-y border-cream-200 bg-cream-100">
      <div className="container-page grid grid-cols-2 gap-y-12 py-20 md:grid-cols-4 md:gap-0 lg:py-24">
        {stats.slice(0, 4).map((s, i) => (
          <div
            key={`stat-${i}`}
            className={`flex flex-col items-center text-center md:px-6 ${i > 0 ? "md:border-l md:border-cream-200" : ""}`}
          >
            <div className="font-display text-5xl font-medium tracking-tight text-slate-900 sm:text-6xl">
              {s.value}
            </div>
            <div className="mt-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
