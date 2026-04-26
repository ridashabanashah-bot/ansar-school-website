interface Props {
  eyebrow?: string;
  title: string;
  intro?: string;
  imageUrl?: string;
}

export default function PageHeader({ eyebrow, title, intro, imageUrl }: Props) {
  if (imageUrl) {
    return (
      <section className="relative isolate min-h-[50vh] overflow-hidden bg-brand-950 text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-950/85 via-brand-900/45 to-brand-900/15" />
        <div className="container-page flex min-h-[50vh] flex-col justify-end pb-14 pt-32 lg:pb-20">
          {eyebrow ? <div className="eyebrow text-cream-100">{eyebrow}</div> : null}
          <h1 className="mt-3 max-w-3xl font-display text-5xl font-medium leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            {title}
          </h1>
          {intro ? <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">{intro}</p> : null}
        </div>
      </section>
    );
  }
  return (
    <section className="border-b border-cream-200 bg-cream-50">
      <div className="container-page py-20 lg:py-24">
        {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
        <h1 className="mt-3 font-display text-5xl font-medium tracking-tight text-slate-900 sm:text-6xl">
          {title}
        </h1>
        {intro ? <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">{intro}</p> : null}
      </div>
    </section>
  );
}
