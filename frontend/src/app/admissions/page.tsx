import Link from "next/link";
import { getAdmissionsPage, getSiteSettings } from "@/lib/content";

export const revalidate = 60;
export const metadata = { title: "Admissions" };

export default async function AdmissionsPage() {
  const [data, settings] = await Promise.all([getAdmissionsPage(), getSiteSettings()]);

  return (
    <>
      <section className="relative isolate overflow-hidden bg-brand-800 text-white">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950"
        />
        <div className="container-page grid gap-10 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-100">
              Join our community
            </div>
            <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              {data.title}
            </h1>
            {data.intro ? (
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">{data.intro}</p>
            ) : null}
            <div className="mt-7 flex flex-wrap gap-3">
              {settings.contactPhone ? (
                <a
                  href={`tel:${settings.contactPhone.replace(/\s/g, "")}`}
                  className="inline-flex items-center justify-center rounded-full bg-accent-500 px-6 py-3 text-sm font-semibold text-white shadow-prominent ring-1 ring-accent-600/30 transition hover:bg-accent-600"
                >
                  Call admissions
                </a>
              ) : null}
              {settings.contactEmail ? (
                <a
                  href={`mailto:${settings.contactEmail}`}
                  className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
                >
                  Email us
                </a>
              ) : null}
            </div>
          </div>
          <div>
            <div className="rounded-3xl bg-white/10 p-6 backdrop-blur ring-1 ring-white/20">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-100">Quick facts</div>
              <ul className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <li>
                  <div className="text-brand-100">Academic year</div>
                  <div className="mt-1 font-semibold">June – April</div>
                </li>
                <li>
                  <div className="text-brand-100">Curriculum</div>
                  <div className="mt-1 font-semibold">CBSE</div>
                </li>
                <li>
                  <div className="text-brand-100">Languages</div>
                  <div className="mt-1 font-semibold">English, Malayalam</div>
                </li>
                <li>
                  <div className="text-brand-100">Admission window</div>
                  <div className="mt-1 font-semibold">Feb – May</div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Process timeline */}
      {data.process && data.process.length > 0 ? (
        <section className="container-page py-16 lg:py-20">
          <div className="max-w-3xl">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">
              How to apply
            </div>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              The admission journey
            </h2>
          </div>
          <ol className="mt-12 grid gap-6 lg:grid-cols-2">
            {data.process.map((p) => (
              <li
                key={p.step}
                className="relative flex gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-brand-300 hover:shadow-md"
              >
                <span
                  aria-hidden
                  className="grid h-12 w-12 flex-none place-items-center rounded-full bg-brand-700 font-display text-lg font-semibold text-white shadow-prominent"
                >
                  {p.step}
                </span>
                <div>
                  <div className="font-display text-lg font-semibold text-slate-900">{p.title}</div>
                  <div className="mt-1 text-sm leading-6 text-slate-600">{p.description}</div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {/* Documents + age + fees */}
      <section className="bg-warmth-50 py-16 lg:py-20">
        <div className="container-page grid gap-8 lg:grid-cols-3">
          {data.documentsRequired && data.documentsRequired.length > 0 ? (
            <div className="lg:col-span-2">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">
                Documents required
              </div>
              <h2 className="mt-2 font-display text-2xl font-semibold text-slate-900 sm:text-3xl">
                Bring these on the day of admission
              </h2>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {data.documentsRequired.map((d, i) => (
                  <li
                    key={`doc-${i}`}
                    className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <span aria-hidden className="mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700">
                      ✓
                    </span>
                    <span className="text-sm leading-6 text-slate-700">{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <aside className="space-y-6">
            {data.ageEligibility ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="font-display text-lg font-semibold text-slate-900">Age eligibility</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{data.ageEligibility}</p>
              </div>
            ) : null}
            {data.feeNote ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="font-display text-lg font-semibold text-slate-900">Fees</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{data.feeNote}</p>
              </div>
            ) : null}
            <div className="rounded-2xl bg-brand-700 p-6 text-white shadow-prominent">
              <h3 className="font-display text-lg font-semibold">Have a question?</h3>
              <p className="mt-1 text-sm text-brand-100">Our admissions team will help.</p>
              <div className="mt-4 space-y-1.5 text-sm">
                {settings.contactPhone ? (
                  <a className="block hover:underline" href={`tel:${settings.contactPhone.replace(/\s/g, "")}`}>
                    📞 {settings.contactPhone}
                  </a>
                ) : null}
                {settings.contactEmail ? (
                  <a className="block hover:underline" href={`mailto:${settings.contactEmail}`}>
                    ✉ {settings.contactEmail}
                  </a>
                ) : null}
              </div>
              <Link
                href="/contact"
                className="mt-4 inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-brand-800 transition hover:bg-brand-50"
              >
                Visit page →
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
