import PageHeader from "@/components/PageHeader";
import { getAcademicsPage } from "@/lib/content";

export const revalidate = 60;
export const metadata = { title: "Academics" };

export default async function AcademicsPage() {
  const data = await getAcademicsPage();

  return (
    <>
      <PageHeader eyebrow="Curriculum" title={data.title} intro={data.intro} />

      {data.programs && data.programs.length > 0 ? (
        <section className="container-page py-16">
          <h2 className="font-display text-2xl font-semibold text-slate-900">Programs</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.programs.map((p) => (
              <article key={p.name} className="rounded-2xl border border-slate-200 bg-white p-6">
                {p.classes ? (
                  <div className="text-xs font-semibold uppercase tracking-wider text-brand-700">{p.classes}</div>
                ) : null}
                <h3 className="mt-2 font-display text-xl font-semibold text-slate-900">{p.name}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{p.description}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {data.facilities && data.facilities.length > 0 ? (
        <section className="bg-slate-50 py-16">
          <div className="container-page">
            <h2 className="font-display text-2xl font-semibold text-slate-900">Facilities</h2>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {data.facilities.map((f) => (
                <li key={f.name} className="rounded-xl bg-white p-5 ring-1 ring-slate-200">
                  <div className="font-semibold text-slate-900">{f.name}</div>
                  <div className="mt-1 text-sm text-slate-600">{f.description}</div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </>
  );
}
