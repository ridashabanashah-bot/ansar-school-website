import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { getEvents, getNews } from "@/lib/content";

export const revalidate = 60;
export const metadata = { title: "News & Events" };

export default async function NewsPage() {
  const [news, events] = await Promise.all([getNews(20), getEvents()]);

  return (
    <>
      <PageHeader eyebrow="What's happening" title="News & events" />

      <section className="container-page py-12">
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="font-display text-2xl font-semibold text-slate-900">Latest news</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {news.map((n) => (
                <article key={n.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5">
                  <time className="text-xs uppercase tracking-wider text-slate-500">
                    {n.publishedDate
                      ? new Date(n.publishedDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
                      : ""}
                  </time>
                  <h3 className="mt-2 font-display text-lg font-semibold text-slate-900">{n.title}</h3>
                  {n.excerpt ? <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{n.excerpt}</p> : null}
                  <Link href={`/news/${n.slug}`} className="mt-4 text-sm font-semibold text-brand-700 hover:underline">
                    Read more →
                  </Link>
                </article>
              ))}
            </div>
          </div>

          <aside>
            <h2 className="font-display text-2xl font-semibold text-slate-900">Upcoming events</h2>
            <ul className="mt-6 space-y-4">
              {events.length === 0 ? (
                <li className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                  No upcoming events. Check back soon.
                </li>
              ) : (
                events.map((e) => (
                  <li key={e.id} className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="text-xs font-semibold uppercase tracking-wider text-brand-700">
                      {new Date(e.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </div>
                    <div className="mt-1 font-semibold text-slate-900">{e.title}</div>
                    {e.description ? <div className="mt-1 text-sm text-slate-600">{e.description}</div> : null}
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
