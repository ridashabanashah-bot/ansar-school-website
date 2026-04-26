import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { getEvents, getNews } from "@/lib/content";
import { strapiMediaUrl } from "@/lib/strapi";
import { FALLBACK_NEWS_PHOTOS } from "@/lib/fallbackPhotos";

export const revalidate = 60;
export const metadata = { title: "News & Events" };

function formatDate(s?: string): string {
  if (!s) return "";
  return new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

export default async function NewsPage() {
  const [news, events] = await Promise.all([getNews(20), getEvents()]);

  return (
    <>
      <PageHeader eyebrow="What's happening" title="News & events" intro="Stories from our classrooms and across the school." />

      <section className="container-page section-pad">
        <div className="grid gap-14 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="grid gap-8 sm:grid-cols-2">
              {news.map((n, i) => {
                const cover = strapiMediaUrl(n.coverImage?.url ?? null) ?? FALLBACK_NEWS_PHOTOS[i % FALLBACK_NEWS_PHOTOS.length];
                return (
                  <article key={n.id} className="card flex flex-col">
                    <div className="aspect-[16/10] overflow-hidden bg-cream-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={cover} alt={n.title} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <time className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        {formatDate(n.publishedDate)}
                      </time>
                      <h3 className="mt-2 font-display text-xl font-medium tracking-tight text-slate-900">{n.title}</h3>
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
            <h2 className="eyebrow">Upcoming events</h2>
            <ul className="mt-5 space-y-4">
              {events.length === 0 ? (
                <li className="text-sm text-slate-500">
                  No upcoming events scheduled. Check back soon.
                </li>
              ) : (
                events.map((e) => (
                  <li key={e.id} className="flex gap-4 border-b border-cream-200 pb-4 last:border-b-0 last:pb-0">
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
                      {e.description ? <div className="mt-0.5 text-sm leading-6 text-slate-600">{e.description}</div> : null}
                    </div>
                  </li>
                ))
              )}
            </ul>
          </aside>
        </div>
      </section>
    </>
  );
}
