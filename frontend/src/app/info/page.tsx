import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { getPages } from "@/lib/content";
import { pagePath } from "@/lib/sections";

export const revalidate = 60;
export const metadata = { title: "Information" };

export default async function InfoIndexPage() {
  const pages = await getPages("info");

  return (
    <>
      <PageHeader eyebrow="General information" title="Information" intro="School-related general information pages." />

      <section className="container-page section-pad">
        {pages.length === 0 ? (
          <div className="rounded-xl border border-dashed border-cream-200 bg-cream-50 p-12 text-center text-sm text-slate-600">
            Information pages will appear here once they are published in the CMS.
          </div>
        ) : (
          <ul className="mx-auto grid max-w-3xl gap-px overflow-hidden rounded-xl border border-cream-200 bg-cream-200">
            {pages.map((p) => (
              <li key={p.id}>
                <Link
                  href={pagePath(p.section, p.slug)}
                  className="flex items-center justify-between gap-4 bg-white px-6 py-5 transition hover:bg-cream-50"
                >
                  <div className="font-display text-xl font-medium tracking-tight text-slate-900">{p.title}</div>
                  <span aria-hidden className="text-brand-700">→</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
