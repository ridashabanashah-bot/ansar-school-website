import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { getPages } from "@/lib/content";
import { pagePath } from "@/lib/sections";

export const revalidate = 60;
export const metadata = { title: "Policies" };

export default async function PoliciesIndexPage() {
  const pages = await getPages("policy");

  return (
    <>
      <PageHeader
        eyebrow="School policies"
        title="Policies"
        intro="Privacy, terms, refund, and cancellation policies."
      />

      <section className="container-page py-12 lg:py-16">
        {pages.length === 0 ? (
          <div className="rounded-xl bg-slate-50 p-6 text-sm text-slate-600">
            Policy pages will appear here once they are published in the CMS.
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pages.map((p) => (
              <li key={p.id}>
                <Link
                  href={pagePath(p.section, p.slug)}
                  className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-brand-300 hover:shadow-sm"
                >
                  <div className="font-display text-lg font-semibold text-slate-900">{p.title}</div>
                  <div className="mt-3 text-sm font-semibold text-brand-700">Read →</div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
