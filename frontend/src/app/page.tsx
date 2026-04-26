import Link from "next/link";
import HeroCarousel from "@/components/HeroCarousel";
import StatsStrip from "@/components/StatsStrip";
import ProgramCard from "@/components/ProgramCard";
import TestimonialCarousel from "@/components/TestimonialCarousel";
import CTABanner from "@/components/CTABanner";
import { getAcademicsPage, getEvents, getHomePage, getNews } from "@/lib/content";

export const revalidate = 60;

function formatDate(s?: string): string {
  if (!s) return "";
  return new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

export default async function HomePage() {
  const [home, news, events, academics] = await Promise.all([
    getHomePage(),
    getNews(4),
    getEvents(),
    getAcademicsPage()
  ]);

  return (
    <>
      <HeroCarousel
        slides={home.heroSlides ?? []}
        fallbackTitle={home.heroTitle}
        fallbackSubtitle={home.heroSubtitle}
        fallbackCtaLabel={home.ctaButtonLabel}
        fallbackCtaHref={home.ctaButtonHref}
      />

      {/* About snapshot */}
      <section className="bg-warmth-50">
        <div className="container-page grid gap-10 py-16 lg:grid-cols-2 lg:gap-16 lg:py-20">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">
              Who we are
            </div>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              {home.introHeading ?? "A school that grows with the child"}
            </h2>
            {home.introBody ? (
              <p className="mt-5 text-base leading-7 text-slate-700 sm:text-lg">{home.introBody}</p>
            ) : null}
            <Link
              href="/about"
              className="mt-7 inline-flex items-center justify-center rounded-full bg-brand-700 px-6 py-3 text-sm font-semibold text-white shadow-prominent ring-1 ring-brand-800/20 transition hover:bg-brand-800"
            >
              About our school →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-gradient-to-br from-brand-200 via-brand-100 to-warmth-100" />
            <div className="mt-8 grid grid-rows-2 gap-4">
              <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-accent-100 to-warmth-100" />
              <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-50 to-brand-200" />
            </div>
          </div>
        </div>
      </section>

      <StatsStrip stats={home.stats ?? []} />

      {/* Programs */}
      {academics.programs && academics.programs.length > 0 ? (
        <section className="container-page py-16 lg:py-20">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">
                Curriculum
              </div>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                {home.programsHeading ?? "Our programs"}
              </h2>
              {home.programsBody ? (
                <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">{home.programsBody}</p>
              ) : null}
            </div>
            <Link href="/academics" className="text-sm font-semibold text-brand-700 hover:underline">
              View all programs →
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {academics.programs.map((p) => (
              <ProgramCard
                key={p.name}
                title={p.name}
                classes={p.classes}
                body={p.description}
                href="/academics"
              />
            ))}
          </div>
        </section>
      ) : null}

      {/* Why us */}
      {home.whyUs && home.whyUs.length > 0 ? (
        <section className="bg-warmth-50 py-16 lg:py-20">
          <div className="container-page">
            <div className="max-w-3xl">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">
                Why Ansar
              </div>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                What sets us apart
              </h2>
              <p className="mt-3 text-base leading-7 text-slate-600">
                A school built around the child — strong academics, caring faculty, and a campus that feels like home.
              </p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {home.whyUs.slice(0, 6).map((h, i) => (
                <article
                  key={`why-${i}`}
                  className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-brand-300 hover:shadow-md"
                >
                  <span
                    aria-hidden
                    className="grid h-12 w-12 flex-none place-items-center rounded-2xl bg-brand-50 text-brand-700 ring-1 ring-brand-700/10"
                  >
                    <span className="font-display text-lg font-bold">{(i + 1).toString().padStart(2, "0")}</span>
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-slate-900">{h.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{h.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* News & events */}
      {news.length > 0 || events.length > 0 ? (
        <section className="container-page py-16 lg:py-20">
          <div className="flex items-end justify-between gap-6">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">
                What&apos;s happening
              </div>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                News & events
              </h2>
            </div>
            <Link href="/news" className="hidden text-sm font-semibold text-brand-700 hover:underline sm:inline">
              View all →
            </Link>
          </div>
          <div className="mt-10 grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="grid gap-6 sm:grid-cols-2">
                {news.slice(0, 4).map((n) => (
                  <article
                    key={n.id}
                    className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-brand-300 hover:shadow-md"
                  >
                    <div className="aspect-[16/9] bg-gradient-to-br from-brand-200 to-warmth-100" aria-hidden />
                    <div className="flex flex-1 flex-col p-5">
                      <time className="text-xs uppercase tracking-wider text-brand-700">
                        {formatDate(n.publishedDate)}
                      </time>
                      <h3 className="mt-2 font-display text-lg font-semibold text-slate-900">{n.title}</h3>
                      {n.excerpt ? <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{n.excerpt}</p> : null}
                      <Link
                        href={`/news/${n.slug}`}
                        className="mt-4 inline-flex items-center text-sm font-semibold text-brand-700 hover:underline"
                      >
                        Read more →
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
            <aside>
              <h3 className="font-display text-xl font-semibold text-slate-900">Upcoming events</h3>
              <ul className="mt-4 space-y-3">
                {events.length === 0 ? (
                  <li className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                    No upcoming events scheduled. Check back soon.
                  </li>
                ) : (
                  events.slice(0, 5).map((e) => (
                    <li
                      key={e.id}
                      className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-brand-300"
                    >
                      <div className="grid h-14 w-14 flex-none place-items-center rounded-xl bg-brand-50 text-brand-700">
                        <div className="text-center leading-tight">
                          <div className="text-[10px] font-semibold uppercase tracking-wider">
                            {new Date(e.startDate).toLocaleDateString("en-IN", { month: "short" })}
                          </div>
                          <div className="font-display text-xl font-semibold">
                            {new Date(e.startDate).toLocaleDateString("en-IN", { day: "numeric" })}
                          </div>
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900">{e.title}</div>
                        {e.description ? (
                          <div className="mt-0.5 truncate text-sm text-slate-600">{e.description}</div>
                        ) : null}
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </aside>
          </div>
        </section>
      ) : null}

      {/* Testimonials */}
      {home.testimonials && home.testimonials.length > 0 ? (
        <section className="bg-brand-50 py-16 lg:py-20">
          <div className="container-page">
            <div className="mx-auto max-w-3xl text-center">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">
                Voices from our community
              </div>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                What students and parents say
              </h2>
            </div>
            <div className="mx-auto mt-10 max-w-3xl">
              <TestimonialCarousel testimonials={home.testimonials} />
            </div>
          </div>
        </section>
      ) : null}

      <CTABanner banner={home.ctaBanner ?? null} />
    </>
  );
}
