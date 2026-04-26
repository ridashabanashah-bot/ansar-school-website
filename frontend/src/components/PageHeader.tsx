export default function PageHeader({ eyebrow, title, intro }: { eyebrow?: string; title: string; intro?: string }) {
  return (
    <section className="border-b border-slate-200 bg-gradient-to-b from-brand-50/50 to-white">
      <div className="container-page py-12 sm:py-16">
        {eyebrow ? (
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">{eyebrow}</div>
        ) : null}
        <h1 className="font-display text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">{title}</h1>
        {intro ? <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-700">{intro}</p> : null}
      </div>
    </section>
  );
}
