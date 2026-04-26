import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import Markdown from "@/components/Markdown";
import { getPages, getPageBySlug, getSiteSettings } from "@/lib/content";
import { strapiMediaUrl } from "@/lib/strapi";
import { SECTION_LABEL, SECTION_TO_SEGMENT, segmentToSection } from "@/lib/sections";
import type { PageSection, StrapiFile } from "@/lib/types";

export const revalidate = 60;

interface RouteParams {
  section: string;
  slug: string;
}

export async function generateStaticParams(): Promise<RouteParams[]> {
  const pages = await getPages();
  return pages.map((p) => ({
    section: SECTION_TO_SEGMENT[p.section] ?? "pages",
    slug: p.slug
  }));
}

export async function generateMetadata({ params }: { params: RouteParams }): Promise<Metadata> {
  const section = segmentToSection(params.section);
  if (!section) return { title: "Not found" };
  const [page, settings] = await Promise.all([getPageBySlug(params.slug), getSiteSettings()]);
  if (!page || page.section !== section) return { title: "Not found" };
  const seoTitle = page.seo?.metaTitle ?? page.title;
  const seoDescription = page.seo?.metaDescription ?? settings.tagline ?? undefined;
  const shareImageUrl = strapiMediaUrl(page.seo?.shareImage?.url) ?? strapiMediaUrl(page.heroImage?.url) ?? undefined;
  return {
    title: seoTitle,
    description: seoDescription,
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      images: shareImageUrl ? [{ url: shareImageUrl }] : undefined,
      type: "article"
    }
  };
}

function formatBytes(size?: number): string | null {
  if (!size || size <= 0) return null;
  // Strapi reports size in KB.
  const kb = size;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export default async function ContentPage({ params }: { params: RouteParams }) {
  const section: PageSection | null = segmentToSection(params.section);
  if (!section) notFound();

  const page = await getPageBySlug(params.slug);
  if (!page || page.section !== section) notFound();

  const heroUrl = strapiMediaUrl(page.heroImage?.url ?? null);
  const heroAlt = page.heroImage?.alternativeText ?? page.title;
  const sectionLabel = SECTION_LABEL[section];
  const useRawHtml = (!page.body || page.body.trim().length === 0) && page.rawHtml && page.rawHtml.trim().length > 0;
  const attachments: StrapiFile[] = page.attachments ?? [];

  return (
    <>
      {heroUrl ? (
        <section className="relative isolate overflow-hidden bg-slate-900 text-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroUrl}
            alt={heroAlt}
            className="absolute inset-0 -z-10 h-full w-full object-cover opacity-50"
          />
          <div className="container-page py-20 sm:py-24">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-200">
              {sectionLabel}
            </div>
            <h1 className="mt-2 max-w-3xl font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              {page.title}
            </h1>
          </div>
        </section>
      ) : (
        <PageHeader eyebrow={sectionLabel} title={page.title} />
      )}

      <article className="container-page py-12 lg:py-16">
        <Link
          href={`/${SECTION_TO_SEGMENT[section]}`}
          className="text-sm font-semibold text-brand-700 hover:underline"
        >
          ← Back to {sectionLabel.toLowerCase()}
        </Link>

        <div className="mt-6 grid gap-12 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="max-w-3xl">
            {useRawHtml && page.rawHtml ? (
              <>
                <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  This page is shown using its original layout from the legacy site.
                  An editor will rewrite it into the new format.
                </div>
                <Markdown source={page.rawHtml} mode="html" />
              </>
            ) : page.body ? (
              <Markdown source={page.body} mode="markdown" />
            ) : (
              <p className="text-slate-600">Content for this page will be added soon.</p>
            )}
          </div>

          <aside className="space-y-8">
            {attachments.length > 0 ? (
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                  Related documents
                </h2>
                <ul className="mt-3 space-y-2">
                  {attachments.map((f, idx) => {
                    const url = strapiMediaUrl(f.url);
                    if (!url) return null;
                    const size = formatBytes(f.size);
                    return (
                      <li key={`${f.url}-${idx}`}>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm transition hover:border-brand-300 hover:bg-brand-50"
                        >
                          <span aria-hidden className="mt-0.5 text-brand-700">↓</span>
                          <span className="flex-1">
                            <span className="block font-medium text-slate-900">{f.name}</span>
                            {size ? <span className="block text-xs text-slate-500">{size}</span> : null}
                          </span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}

            {page.sourceUrl ? (
              <div className="text-xs text-slate-500">
                Original page:{" "}
                <a
                  href={page.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-700 hover:underline"
                >
                  {page.sourceUrl}
                </a>
              </div>
            ) : null}
          </aside>
        </div>
      </article>
    </>
  );
}
