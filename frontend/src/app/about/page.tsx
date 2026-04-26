import PageHeader from "@/components/PageHeader";
import { getAboutPage } from "@/lib/content";

export const revalidate = 60;

export const metadata = { title: "About" };

export default async function AboutPage() {
  const data = await getAboutPage();

  return (
    <>
      <PageHeader eyebrow="Our school" title={data.title} />

      <section className="container-page grid gap-12 py-16 lg:grid-cols-3">
        {data.vision ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="font-display text-xl font-semibold text-slate-900">Vision</h2>
            <p className="mt-3 text-slate-700">{data.vision}</p>
          </div>
        ) : null}
        {data.mission ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="font-display text-xl font-semibold text-slate-900">Mission</h2>
            <p className="mt-3 text-slate-700">{data.mission}</p>
          </div>
        ) : null}
        {data.history ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="font-display text-xl font-semibold text-slate-900">History</h2>
            <p className="mt-3 text-slate-700">{data.history}</p>
          </div>
        ) : null}
      </section>

      {(data.principalMessage || data.principalName) && (
        <section className="bg-slate-50 py-16">
          <div className="container-page grid gap-10 lg:grid-cols-3">
            <div>
              <div className="aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-brand-200 to-brand-500 shadow-inner" />
              <div className="mt-4">
                <div className="font-display text-lg font-semibold text-slate-900">{data.principalName ?? "Principal"}</div>
                <div className="text-sm text-slate-500">Principal</div>
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">Message from the Principal</div>
              <blockquote className="mt-3 font-display text-2xl leading-relaxed text-slate-800 sm:text-3xl">
                “{data.principalMessage}”
              </blockquote>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
