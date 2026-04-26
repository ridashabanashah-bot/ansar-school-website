import Link from "next/link";

export default function Hero({
  title,
  subtitle,
  primaryCta,
  secondaryCta
}: {
  title: string;
  subtitle?: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-50 via-white to-accent-50">
      <div
        aria-hidden
        className="absolute -right-32 -top-32 h-72 w-72 rounded-full bg-brand-200/50 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-accent-100/70 blur-3xl"
      />
      <div className="container-page relative grid gap-10 py-16 sm:py-20 lg:grid-cols-12 lg:py-28">
        <div className="lg:col-span-7">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700 ring-1 ring-brand-200">
            Padhinjarangadi · Kerala
          </span>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-700">{subtitle}</p>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">
            {primaryCta ? (
              <Link href={primaryCta.href} className="btn-primary">
                {primaryCta.label}
              </Link>
            ) : null}
            {secondaryCta ? (
              <Link href={secondaryCta.href} className="btn-secondary">
                {secondaryCta.label}
              </Link>
            ) : null}
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 shadow-xl ring-1 ring-brand-700/30">
            <div className="absolute inset-0 grid place-items-center">
              <div className="text-center text-white/95">
                <div className="font-display text-5xl font-bold tracking-wide">Ansar</div>
                <div className="mt-1 text-lg tracking-[0.3em] text-white/80">SCHOOL</div>
                <div className="mx-auto mt-6 h-px w-16 bg-white/40" />
                <div className="mt-6 text-sm uppercase tracking-[0.25em] text-white/80">Padhinjarangadi</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
