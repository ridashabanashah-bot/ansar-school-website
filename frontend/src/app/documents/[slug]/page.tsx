import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getDocumentBySlug, getDocuments } from "@/lib/content";
import { strapiMediaUrl } from "@/lib/strapi";

export const revalidate = 60;

interface RouteParams {
  slug: string;
}

export async function generateStaticParams(): Promise<RouteParams[]> {
  const docs = await getDocuments();
  return docs.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: RouteParams }): Promise<Metadata> {
  const doc = await getDocumentBySlug(params.slug);
  if (!doc) return { title: "Not found" };
  return { title: doc.title, description: doc.description };
}

function formatBytes(size?: number): string | null {
  if (!size || size <= 0) return null;
  const kb = size;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export default async function DocumentDetailPage({ params }: { params: RouteParams }) {
  const doc = await getDocumentBySlug(params.slug);
  if (!doc) notFound();

  const fileUrl = strapiMediaUrl(doc.file?.url);
  const size = formatBytes(doc.file?.size);
  const showEmbed = doc.category !== "sample-tc" && fileUrl !== null;

  return (
    <article className="container-page py-12 lg:py-16">
      <Link href="/documents" className="text-sm font-semibold text-brand-700 hover:underline">
        ← Back to documents
      </Link>

      <header className="mt-6 max-w-3xl">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">
          {doc.category.replace("-", " ")}
        </div>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
          {doc.title}
        </h1>
        {doc.description ? (
          <p className="mt-4 text-lg leading-7 text-slate-600">{doc.description}</p>
        ) : null}
      </header>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        {fileUrl ? (
          <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
            Download {size ? <span className="ml-2 text-xs opacity-90">({size})</span> : null}
          </a>
        ) : (
          <span className="text-sm text-slate-500">File is not yet uploaded.</span>
        )}
        {doc.issuedDate ? (
          <span className="text-sm text-slate-500">
            Issued: {new Date(doc.issuedDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </span>
        ) : null}
      </div>

      {showEmbed && fileUrl ? (
        <div className="mt-10 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          <iframe
            src={fileUrl}
            title={`${doc.title} — preview`}
            className="h-[80vh] w-full"
          />
        </div>
      ) : null}
    </article>
  );
}
