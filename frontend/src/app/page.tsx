import Link from "next/link";
import HeroCarousel from "@/components/HeroCarousel";
import StatsStrip from "@/components/StatsStrip";
import ProgramCard from "@/components/ProgramCard";
import TestimonialCarousel from "@/components/TestimonialCarousel";
import CTABanner from "@/components/CTABanner";
import { getAcademicsPage, getEvents, getHomePage, getNews } from "@/lib/content";
import { strapiMediaUrl } from "@/lib/strapi";
import {
  FALLBACK_ABOUT_COLLAGE,
  FALLBACK_CTA_PHOTO,
  FALLBACK_HERO_PHOTOS,
  FALLBACK_NEWS_PHOTOS,
  FALLBACK_PROGRAM_PHOTOS
} from "@/lib/fallbackPhotos";

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
        fallbackCtaLabel={home.ctaButtonLabel ?? "Apply for admission"}
        fallbackCtaHref={home.ctaButtonHref ?? "/admissions"}
        fallbackImageUrls={FALLBACK_HERO_PHOTOS}
      />

      {/* About snapshot — cream surface, photo collage right */}
      <section className="bg-cream-50">
        <div className="container-page section-pad grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_480px] lg:gap-20">
          <div className="max-w-xl">
            <div className="eyebrow">Who we are</div>
            <h2 className="mt-3 font-display text-4xl font-medium leading-tight tracking-tight text-slate-900 sm:text-5xl">
              {home.introHeading ?? "A school that grows with the child"}
            </h2>
            {home.introBody ? (
              <p className="mt-6 text-base leading-8 text-slate-600 sm:text-lg">{home.introBody}</p>
            ) : null}
            <Link href="/about" className="btn-primary mt-8">
              About our school →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={FALLBACK_ABOUT_COLLAGE[0]}
              alt=""
              className="row-span-2 h-full w-full rounded-xl object-cover ring-1 ring-black/5"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={FALLBACK_ABOUT_COLLAGE[1]}
              alt=""
              className="h-full w-full rounded-xl object-cover ring-1 ring-black/5"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={FALLBACK_ABOUT_COLLAGE[2]}
              alt=""
              className="h-full w-full rounded-xl object-cover ring-1 ring-black/5"
            />
          </div>
        </div>
      </section>

      <StatsStrip stats={home.stats ?? []} />

      {/* Programs */}
      {academics.programs && academics.programs.length > 0 ? (
        <section className="container-page section-pad">
          <div className="mx-auto max-w-2xl text-center">
            <div className="eyebrow">Curriculum</div>
            <h2 className="mt-3 font-display text-4xl font-medium tracking-tight text-slate-900 sm:text-5xl">
              {home.programsHeading ?? "Programs at Ansar"}
            </h2>
            {home.programsBody ? (
              <p className="mt-4 text-base leading-7 text-slate-600">{home.programsBody}</p>
            ) : null}
          </div>
          <div className="mx-auto mt-14 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {academics.programs.slice(0, 3).map((p, i) => (
              <ProgramCard
                key={p.name}
                title={p.name}
                classes={p.classes}
                body={p.description}
                fallbackImageUrl={FALLBACK_PROGRAM_PHOTOS[i % FALLBACK_PROGRAM_PHOTOS.length]}
                href="/academics"
              />
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/academics" className="text-sm font-semibold text-brand-700 underline decoration-brand-200 underline-offset-4 hover:decoration-brand-700">
              View all programs →
            </Link>
          </div>
        </section>
      ) : null}

      {/* Why Ansar — 2x3, no badges, brand-line-above-title */}
      {home.whyUs && home.whyUs.length > 0 ? (
        <section className="bg-cream-50 section-pad">
          <div className="container-page">
            <div className="mx-auto max-w-2xl text-center">
              <div className="eyebrow">Why Ansar</div>
              <h2 className="mt-3 font-display text-4xl font-medium tracking-tight text-slate-900 sm:text-5xl">
                What sets us apart
              </h2>
            </div>
            <div className="mx-auto mt-14 grid max-w-5xl gap-x-12 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
              {home.whyUs.slice(0, 6).map((h, i) => (
                <article key={`why-${i}`} className="text-left">
                  <span aria-hidden className="mb-3 block h-px w-10 bg-brand-700" />
                  <h3 className="font-display text-xl font-medium tracking-tight text-slate-900">
                    {h.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{h.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* News & events */}
      {news.length > 0 || events.length > 0 ? (
        <section className="container-page section-pad">
          <div className="flex items-end justify-between gap-6">
            <div>
              <div className="eyebrow">What&apos;s happening</div>
              <h2 className="mt-3 font-display text-4xl font-medium tracking-tight text-slate-900 sm:text-5xl">
                News & events
              </h2>
            </div>
            <Link href="/news" className="hidden text-sm font-semibold text-brand-700 underline decoration-brand-200 underline-offset-4 hover:decoration-brand-700 sm:inline">
              View all →
            </Link>
          </div>
          <div className="mt-14 grid gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="grid gap-8 sm:grid-cols-3">
                {news.slice(0, 3).map((n, i) => {
                  const cover = strapiMediaUrl(n.coverImage?.url ?? null) ?? FALLBACK_NEWS_PHOTOS[i % FALLBACK_NEWS_PHOTOS.length];
                  return (
                    <article key={n.id} className="card flex flex-col">
                      <div className="aspect-[4/3] overflow-hidden bg-cream-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={cover} alt={n.title} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <time className="text-xs uppercase tracking-wider text-slate-500">
                          {formatDate(n.publishedDate)}
                        </time>
                        <h3 className="mt-2 font-display text-lg font-medium tracking-tight text-slate-900">{n.title}</h3>
                        {n.excerpt ? <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{n.excerpt}</p> : null}
                        <Link href={`/news/${n.slug}`} className="mt-4 inline-flex items-center text-sm font-semibold text-brand-700 underline decoration-brand-200 underline-offset-4 hover:decoration-brand-700">
                          Read more →
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
            <aside>
              <h3 className="eyebrow">Upcoming events</h3>
              <ul className="mt-5 space-y-4">
                {events.length === 0 ? (
                  <li className="text-sm text-slate-500">
                    No upcoming events scheduled. Check back soon.
                  </li>
                ) : (
                  events.slice(0, 5).map((e) => (
                    <li
                      key={e.id}
                      className="flex gap-4 border-b border-cream-200 pb-4 last:border-b-0 last:pb-0"
                    >
                      <div className="flex-none text-center">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-700">
                          {new Date(e.startDate).toLocaleDateString("en-IN", { month: "short" })}
                        </div>
                        <div className="font-display text-3xl font-medium tracking-tight text-slate-900">
                          {new Date(e.startDate).toLocaleDateString("en-IN", { day: "numeric" })}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-slate-900">{e.title}</div>
                        {e.description ? (
                          <div className="mt-0.5 text-sm leading-6 text-slate-600">{e.description}</div>
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
        <section className="bg-cream-100 section-pad">
          <div className="container-page">
            <div className="mx-auto max-w-2xl text-center">
              <div className="eyebrow">Voices from our community</div>
            </div>
            <div className="mx-auto mt-12 max-w-3xl">
              <TestimonialCarousel testimonials={home.testimonials} />
            </div>
          </div>
        </section>
      ) : null}

      <CTABanner banner={home.ctaBanner ?? null} fallbackImageUrl={FALLBACK_CTA_PHOTO} />
    </>
  );
}
