import Link from "next/link";
import { getAboutPage } from "@/lib/content";

export const revalidate = 60;
export const metadata = { title: "About" };

export default async function AboutPage() {
  const data = await getAboutPage();

  const historyParas = data.history
    ? data.history.split(/\n{2,}/).map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <>
      {/* Tall hero */}
      <section className="relative isolate overflow-hidden bg-brand-900 text-white">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(96,165,250,0.25),transparent_50%),radial-gradient(circle_at_85%_85%,rgba(252,211,77,0.18),transparent_55%)]"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-900 via-brand-800 to-brand-950"
        />
        <div className="container-page py-20 sm:py-28">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-100">
            Our school
          </div>
          <h1 className="mt-2 max-w-3xl font-display text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            {data.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
            A community built around children — academic rigor, strong values, and a campus that feels like home for every learner.
          </p>
        </div>
      </section>

      {/* Vision / mission / history */}
      <section className="container-page py-16 lg:py-20">
        <div className="grid gap-6 lg:grid-cols-3">
          {data.vision ? (
            <article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <span aria-hidden className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-50 text-brand-700 ring-1 ring-brand-700/10">
                ◎
              </span>
              <h2 className="mt-4 font-display text-xl font-semibold text-slate-900">Our vision</h2>
              <p className="mt-3 text-sm leading-6 text-slate-700">{data.vision}</p>
            </article>
          ) : null}
          {data.mission ? (
            <article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <span aria-hidden className="grid h-10 w-10 place-items-center rounded-2xl bg-warmth-100 text-accent-600 ring-1 ring-accent-500/20">
                ✦
              </span>
              <h2 className="mt-4 font-display text-xl font-semibold text-slate-900">Our mission</h2>
              <p className="mt-3 text-sm leading-6 text-slate-700">{data.mission}</p>
            </article>
          ) : null}
          {historyParas.length > 0 ? (
            <article className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
              <span aria-hidden className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-50 text-brand-700 ring-1 ring-brand-700/10">
                ⌘
              </span>
              <h2 className="mt-4 font-display text-xl font-semibold text-slate-900">Our story</h2>
              <p className="mt-3 text-sm leading-6 text-slate-700">{historyParas[0]}</p>
            </article>
          ) : null}
        </div>
      </section>

      {/* Principal's message */}
      {(data.principalMessage || data.principalName) && (
        <section className="bg-warmth-50 py-16 lg:py-20">
          <div className="container-page grid items-center gap-10 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-16">
            <div>
              <div className="aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-brand-200 via-brand-100 to-warmth-100 shadow-prominent" />
              <div className="mt-4">
                <div className="font-display text-lg font-semibold text-slate-900">
                  {data.principalName ?? "Principal"}
                </div>
                <div className="text-sm text-slate-500">Principal</div>
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">
                Message from the Principal
              </div>
              <blockquote className="mt-3 font-display text-2xl leading-relaxed text-slate-800 sm:text-3xl">
                <span aria-hidden className="mr-2 text-brand-300">“</span>
                {data.principalMessage}
              </blockquote>
              <Link
                href="/admissions"
                className="mt-7 inline-flex items-center justify-center rounded-full bg-accent-500 px-6 py-3 text-sm font-semibold text-white shadow-prominent ring-1 ring-accent-600/30 transition hover:bg-accent-600"
              >
                Begin admission →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* History timeline (if multiple paragraphs) */}
      {historyParas.length > 1 ? (
        <section className="container-page py-16 lg:py-20">
          <div className="max-w-3xl">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">
              How we got here
            </div>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              A short history of our school
            </h2>
          </div>
          <ol className="mt-10 space-y-6 border-l-2 border-brand-100 pl-6 sm:pl-8">
            {historyParas.map((p, i) => (
              <li key={`hist-${i}`} className="relative">
                <span
                  aria-hidden
                  className="absolute -left-[34px] top-1 grid h-6 w-6 place-items-center rounded-full bg-brand-700 text-xs font-bold text-white sm:-left-[42px]"
                >
                  {i + 1}
                </span>
                <p className="text-base leading-7 text-slate-700">{p}</p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </>
  );
}
