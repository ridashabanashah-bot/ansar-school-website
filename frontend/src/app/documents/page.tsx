import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { getDocuments } from "@/lib/content";
import { strapiMediaUrl } from "@/lib/strapi";
import type { DocumentCategory, DocumentEntry } from "@/lib/types";

export const revalidate = 60;
export const metadata = { title: "Documents" };

const CATEGORY_ORDER: DocumentCategory[] = ["certificate", "policy", "fees", "calendar", "sample-tc", "other"];

const CATEGORY_LABEL: Record<DocumentCategory, string> = {
  certificate: "Certificates",
  policy: "Policies",
  fees: "Fee structure",
  calendar: "Academic calendar",
  "sample-tc": "Sample transfer certificates",
  other: "Other documents"
};

const CATEGORY_DESCRIPTION: Record<DocumentCategory, string> = {
  certificate: "Affiliation, recognition, and statutory certificates submitted to the CBSE.",
  policy: "School policies on privacy, terms, refund, and cancellation.",
  fees: "Current and previous fee structures.",
  calendar: "Annual academic calendar and year plan.",
  "sample-tc": "Sample transfer certificates issued in past years.",
  other: "Other downloadable documents."
};

function formatBytes(size?: number): string | null {
  if (!size || size <= 0) return null;
  const kb = size;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function groupByCategory(docs: DocumentEntry[]): Record<DocumentCategory, DocumentEntry[]> {
  const out: Record<DocumentCategory, DocumentEntry[]> = {
    certificate: [], policy: [], fees: [], calendar: [], "sample-tc": [], other: []
  };
  for (const d of docs) {
    out[d.category].push(d);
  }
  return out;
}

export default async function DocumentsIndexPage() {
  const docs = await getDocuments();
  const grouped = groupByCategory(docs);

  return (
    <>
      <PageHeader
        eyebrow="Downloads"
        title="Documents"
        intro="Official certificates, policies, fee structures, and sample documents — all in one place."
      />

      <section className="container-page py-12 lg:py-16">
        {docs.length === 0 ? (
          <div className="rounded-xl bg-slate-50 p-6 text-sm text-slate-600">
            Documents will appear here once they are uploaded through the CMS.
          </div>
        ) : (
          <div className="space-y-12">
            {CATEGORY_ORDER.map((cat) => {
              const items = grouped[cat];
              if (!items || items.length === 0) return null;
              return (
                <div key={cat}>
                  <h2 className="font-display text-2xl font-semibold tracking-tight text-slate-900">
                    {CATEGORY_LABEL[cat]}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">{CATEGORY_DESCRIPTION[cat]}</p>
                  <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((d) => {
                      const fileUrl = strapiMediaUrl(d.file?.url);
                      const size = formatBytes(d.file?.size);
                      return (
                        <li
                          key={d.id}
                          className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-brand-300 hover:shadow-sm"
                        >
                          <div className="flex items-start gap-3">
                            <span
                              aria-hidden
                              className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700"
                            >
                              PDF
                            </span>
                            <div className="flex-1">
                              <div className="font-semibold text-slate-900">{d.title}</div>
                              {size ? (
                                <div className="mt-0.5 text-xs text-slate-500">{size}</div>
                              ) : null}
                            </div>
                          </div>
                          {d.description ? (
                            <p className="mt-3 text-sm text-slate-600">{d.description}</p>
                          ) : null}
                          <div className="mt-4 flex items-center justify-between text-sm">
                            <Link
                              href={`/documents/${d.slug}`}
                              className="font-semibold text-brand-700 hover:underline"
                            >
                              View →
                            </Link>
                            {fileUrl ? (
                              <a
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-600 hover:text-brand-700"
                              >
                                Download
                              </a>
                            ) : null}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
