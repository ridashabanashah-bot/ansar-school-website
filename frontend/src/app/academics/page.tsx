import Link from "next/link";
import ProgramCard from "@/components/ProgramCard";
import { getAcademicsPage } from "@/lib/content";

export const revalidate = 60;
export const metadata = { title: "Academics" };

export default async function AcademicsPage() {
  const data = await getAcademicsPage();

  return (
    <>
      <section className="relative isolate overflow-hidden bg-brand-800 text-white">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_75%_25%,rgba(252,211,77,0.18),transparent_50%)]"
        />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900"
        />
        <div className="container-page grid gap-10 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-100">
              Curriculum
            </div>
            <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              {data.title}
            </h1>
            {data.intro ? (
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">{data.intro}</p>
            ) : null}
          </div>
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {["LP", "UP", "HS"].map((tag, i) => (
              <div
                key={tag}
                className={`flex aspect-[3/4] flex-col justify-end rounded-2xl p-4 text-white shadow-prominent ${i === 0 ? "bg-brand-600" : i === 1 ? "bg-accent-500" : "bg-brand-500"}`}
              >
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">Stage</div>
                <div className="font-display text-3xl font-semibold">{tag}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs grid */}
      {data.programs && data.programs.length > 0 ? (
        <section className="container-page py-16 lg:py-20">
          <div className="max-w-3xl">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">
              Programs
            </div>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              From early years to high school
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-600">
              A carefully sequenced curriculum that builds reading, numeracy, scientific thinking, and lifelong learning.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.programs.map((p) => (
              <ProgramCard
                key={p.name}
                title={p.name}
                classes={p.classes}
                body={p.description}
                href="/admissions"
              />
            ))}
          </div>
        </section>
      ) : null}

      {/* Facilities */}
      {data.facilities && data.facilities.length > 0 ? (
        <section className="bg-warmth-50 py-16 lg:py-20">
          <div className="container-page">
            <div className="max-w-3xl">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">
                Campus
              </div>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Facilities your child will use every day
              </h2>
            </div>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {data.facilities.map((f, i) => (
                <li
                  key={f.name}
                  className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md"
                >
                  <span
                    aria-hidden
                    className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-700/10"
                  >
                    <span className="text-sm font-bold">{(i + 1).toString().padStart(2, "0")}</span>
                  </span>
                  <div className="font-display text-base font-semibold text-slate-900">{f.name}</div>
                  <div className="mt-1 text-sm leading-6 text-slate-600">{f.description}</div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* Inline CTA */}
      <section className="container-page py-12 lg:py-16">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-brand-700 px-8 py-10 text-white shadow-prominent sm:flex-row sm:items-center sm:px-12">
          <div>
            <h3 className="font-display text-2xl font-semibold">Ready to learn more?</h3>
            <p className="mt-1 text-sm text-brand-100">Get the full curriculum overview from our admissions team.</p>
          </div>
          <Link
            href="/admissions"
            className="inline-flex items-center justify-center rounded-full bg-accent-500 px-6 py-3 text-sm font-semibold text-white shadow-prominent ring-1 ring-accent-600/30 transition hover:bg-accent-600"
          >
            Talk to admissions →
          </Link>
        </div>
      </section>
    </>
  );
}
