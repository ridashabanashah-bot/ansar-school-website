import Link from "next/link";
import { getAboutPage } from "@/lib/content";
import { strapiMediaUrl } from "@/lib/strapi";
import { FALLBACK_ABOUT_HERO, FALLBACK_PRINCIPAL_PHOTO } from "@/lib/fallbackPhotos";

export const revalidate = 60;
export const metadata = { title: "About" };

export default async function AboutPage() {
  const data = await getAboutPage();
  const historyParas = data.history
    ? data.history.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean)
    : [];
  const principalPhoto = strapiMediaUrl(data.principalPhoto?.url ?? null) ?? FALLBACK_PRINCIPAL_PHOTO;

  return (
    <>
      {/* Tall hero with campus photo + school name overlaid */}
      <section className="relative isolate min-h-[60vh] overflow-hidden bg-brand-950 text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={FALLBACK_ABOUT_HERO} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-950/85 via-brand-900/45 to-brand-900/15" />
        <div className="container-page flex min-h-[60vh] flex-col justify-end pb-16 pt-32 lg:pb-24">
          <div className="eyebrow text-cream-100">Our school</div>
          <h1 className="mt-3 max-w-3xl font-display text-5xl font-medium leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            {data.title}
          </h1>
        </div>
      </section>

      {/* Vision / mission / history — single elegant column */}
      <section className="bg-cream-50">
        <div className="container-page section-pad">
          <div className="mx-auto max-w-3xl space-y-14">
            {data.vision ? (
              <div>
                <div className="eyebrow">Our vision</div>
                <p className="mt-4 font-display text-2xl leading-relaxed tracking-tight text-slate-800 sm:text-3xl">
                  {data.vision}
                </p>
              </div>
            ) : null}
            {data.mission ? (
              <div>
                <div className="eyebrow">Our mission</div>
                <p className="mt-4 text-base leading-8 text-slate-700 sm:text-lg">
                  {data.mission}
                </p>
              </div>
            ) : null}
            {historyParas.length > 0 ? (
              <div>
                <div className="eyebrow">Our story</div>
                <div className="mt-4 space-y-4 text-base leading-8 text-slate-700 sm:text-lg">
                  {historyParas.map((p, i) => (
                    <p key={`history-${i}`}>{p}</p>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* Principal's desk */}
      {(data.principalMessage || data.principalName) && (
        <section className="section-pad">
          <div className="container-page mx-auto grid max-w-5xl items-start gap-12 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-16">
            <div>
              <div className="aspect-[3/4] overflow-hidden rounded-xl ring-1 ring-cream-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={principalPhoto} alt={data.principalName ?? "Principal"} className="h-full w-full object-cover" />
              </div>
              <div className="mt-5">
                <div className="font-display text-xl font-medium tracking-tight text-slate-900">
                  {data.principalName ?? "Principal"}
                </div>
                <div className="mt-1 text-sm text-slate-500">Principal</div>
                <div className="mt-3 font-display text-2xl italic text-slate-700">— ✑</div>
              </div>
            </div>
            <div>
              <div className="eyebrow">A note from the principal</div>
              <blockquote className="mt-4 font-display text-2xl leading-relaxed tracking-tight text-slate-800 sm:text-3xl">
                <span aria-hidden className="mr-2 align-top text-brand-300">“</span>
                {data.principalMessage}
              </blockquote>
              <Link href="/admissions" className="btn-primary mt-8">
                Begin admission
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Year timeline */}
      {historyParas.length > 1 ? (
        <section className="bg-cream-50 section-pad">
          <div className="container-page mx-auto max-w-3xl">
            <div className="eyebrow">Milestones</div>
            <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-slate-900 sm:text-4xl">
              How we got here
            </h2>
            <ol className="mt-12 space-y-10 border-l border-cream-200 pl-8">
              {historyParas.map((p, i) => (
                <li key={`hist-${i}`} className="relative">
                  <span aria-hidden className="absolute -left-[37px] top-1 grid h-4 w-4 place-items-center rounded-full bg-brand-700 ring-4 ring-cream-50" />
                  <p className="text-base leading-8 text-slate-700">{p}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}
    </>
  );
}
