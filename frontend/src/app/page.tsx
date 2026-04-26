import Link from "next/link";
import Hero from "@/components/Hero";
import SectionHeading from "@/components/SectionHeading";
import { getHomePage, getNews } from "@/lib/content";

export const revalidate = 60;

export default async function HomePage() {
  const home = await getHomePage();
  const news = await getNews(3);

  return (
    <>
      <Hero
        title={home.heroTitle}
        subtitle={home.heroSubtitle}
        primaryCta={{ label: "Apply for admission", href: "/admissions" }}
        secondaryCta={{ label: "Learn about us", href: "/about" }}
      />

      {(home.introHeading || home.introBody) && (
        <section className="container-page py-16 sm:py-20">
          <SectionHeading
            eyebrow="Welcome"
            title={home.introHeading ?? "About our school"}
            subtitle={home.introBody}
          />
        </section>
      )}

      {home.highlights && home.highlights.length > 0 && (
        <section className="bg-slate-50 py-16 sm:py-20">
          <div className="container-page">
            <SectionHeading eyebrow="Why Ansar" title="What sets us apart" align="center" />
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {home.highlights.map((h, i) => (
                <article
                  key={i}
                  className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-100 text-brand-700">
                    <span className="font-display text-lg font-bold">{i + 1}</span>
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold text-slate-900">{h.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{h.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {news.length > 0 && (
        <section className="container-page py-16 sm:py-20">
          <div className="flex items-end justify-between gap-6">
            <SectionHeading eyebrow="Latest" title="News & updates" />
            <Link href="/news" className="hidden text-sm font-semibold text-brand-700 hover:underline sm:block">
              View all news →
            </Link>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {news.map((n) => (
              <article
                key={n.id}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-brand-300"
              >
                <time className="text-xs uppercase tracking-wider text-slate-500">
                  {n.publishedDate ? new Date(n.publishedDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : ""}
                </time>
                <h3 className="mt-2 font-display text-xl font-semibold text-slate-900">{n.title}</h3>
                {n.excerpt ? <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{n.excerpt}</p> : null}
                <Link href={`/news/${n.slug}`} className="mt-4 text-sm font-semibold text-brand-700 hover:underline">
                  Read more →
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="bg-brand-700 text-white">
        <div className="container-page grid gap-6 py-16 sm:grid-cols-3 sm:items-center sm:py-20">
          <div className="sm:col-span-2">
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">
              {home.ctaTitle ?? "Admissions are open"}
            </h2>
            <p className="mt-3 max-w-2xl text-brand-100">
              {home.ctaBody ?? "Visit the campus and learn how to enroll your child."}
            </p>
          </div>
          <div className="sm:text-right">
            <Link
              href={home.ctaButtonHref ?? "/admissions"}
              className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-brand-800 shadow hover:bg-brand-50"
            >
              {home.ctaButtonLabel ?? "Start admission"}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
