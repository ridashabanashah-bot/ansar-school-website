import type { Stat } from "@/lib/types";

export default function StatsStrip({ stats }: { stats: Stat[] }) {
  if (!stats || stats.length === 0) return null;
  return (
    <section className="relative isolate overflow-hidden bg-brand-700 text-white">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_15%,rgba(255,255,255,0.18),transparent_45%),radial-gradient(circle_at_85%_85%,rgba(255,255,255,0.12),transparent_50%)]"
      />
      <div className="container-page grid grid-cols-2 gap-8 py-12 sm:py-14 md:grid-cols-3 lg:grid-cols-6 lg:gap-6">
        {stats.slice(0, 6).map((s, i) => (
          <div key={`stat-${i}`} className="flex flex-col items-center text-center">
            {s.icon ? (
              <span aria-hidden className="mb-2 text-2xl">
                {s.icon}
              </span>
            ) : null}
            <div className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              {s.value}
            </div>
            <div className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-brand-100 sm:text-sm">
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
