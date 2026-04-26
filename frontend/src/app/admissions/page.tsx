import Link from "next/link";
import { getAdmissionsPage, getSiteSettings } from "@/lib/content";
import { FALLBACK_ADMISSIONS_HERO } from "@/lib/fallbackPhotos";
import { strapiMediaUrl } from "@/lib/strapi";

export const revalidate = 60;
export const metadata = { title: "Admissions" };

export default async function AdmissionsPage() {
  const [data, settings] = await Promise.all([getAdmissionsPage(), getSiteSettings()]);
  const formUrl = strapiMediaUrl(data.applicationFormUrl ?? null) ?? data.applicationFormUrl ?? null;

  return (
    <>
      <section className="relative isolate min-h-[55vh] overflow-hidden bg-brand-950 text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={FALLBACK_ADMISSIONS_HERO} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-950/85 via-brand-900/45 to-brand-900/15" />
        <div className="container-page flex min-h-[55vh] flex-col justify-end pb-16 pt-32 lg:pb-24">
          <div className="eyebrow text-cream-100">Join our community</div>
          <h1 className="mt-3 max-w-3xl font-display text-5xl font-medium leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            {data.title}
          </h1>
          {data.intro ? (
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">{data.intro}</p>
          ) : null}
          <div className="mt-7 flex flex-wrap gap-3">
            {settings.contactPhone ? (
              <a
                href={`tel:${settings.contactPhone.replace(/\s/g, "")}`}
                className="inline-flex items-center justify-center rounded-md bg-white px-7 py-3 text-sm font-semibold text-brand-900 transition-all hover:-translate-y-0.5"
              >
                Call admissions
              </a>
            ) : null}
            {settings.contactEmail ? (
              <a
                href={`mailto:${settings.contactEmail}`}
                className="inline-flex items-center justify-center rounded-md border border-white/40 px-7 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-white/10"
              >
                Email us
              </a>
            ) : null}
          </div>
        </div>
      </section>

      {/* Process — clean numbered list, no boxes */}
      {data.process && data.process.length > 0 ? (
        <section className="bg-cream-50 section-pad">
          <div className="container-page mx-auto max-w-3xl">
            <div className="eyebrow">How to apply</div>
            <h2 className="mt-3 font-display text-4xl font-medium tracking-tight text-slate-900 sm:text-5xl">
              The admission journey
            </h2>
            <ol className="mt-12 space-y-10">
              {data.process.map((p) => (
                <li key={p.step} className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-6">
                  <div className="font-display text-4xl font-medium tracking-tight text-brand-700">
                    {p.step.toString().padStart(2, "0")}
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-medium tracking-tight text-slate-900">{p.title}</h3>
                    <p className="mt-2 text-base leading-8 text-slate-600">{p.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      {/* Documents + age + fees */}
      <section className="section-pad">
        <div className="container-page mx-auto grid max-w-5xl gap-12 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div>
            {data.documentsRequired && data.documentsRequired.length > 0 ? (
              <div>
                <div className="eyebrow">Documents required</div>
                <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-slate-900 sm:text-4xl">
                  Bring these on the day of admission
                </h2>
                <ul className="mt-8 space-y-3">
                  {data.documentsRequired.map((d, i) => (
                    <li key={`doc-${i}`} className="flex items-start gap-3 text-base leading-8 text-slate-700">
                      <span aria-hidden className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-brand-700" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
                {formUrl ? (
                  <a
                    href={formUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary mt-8"
                  >
                    Download application form
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>

          <aside className="space-y-8">
            {data.ageEligibility ? (
              <div>
                <h3 className="eyebrow">Age eligibility</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{data.ageEligibility}</p>
              </div>
            ) : null}
            {data.feeNote ? (
              <div>
                <h3 className="eyebrow">Fees</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{data.feeNote}</p>
              </div>
            ) : null}
            <div className="rounded-xl border border-cream-200 bg-cream-50 p-6">
              <h3 className="eyebrow">Have a question?</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">Our admissions team will help.</p>
              <div className="mt-3 space-y-1.5 text-sm">
                {settings.contactPhone ? (
                  <a className="block text-brand-700 hover:underline" href={`tel:${settings.contactPhone.replace(/\s/g, "")}`}>
                    {settings.contactPhone}
                  </a>
                ) : null}
                {settings.contactEmail ? (
                  <a className="block text-brand-700 hover:underline" href={`mailto:${settings.contactEmail}`}>
                    {settings.contactEmail}
                  </a>
                ) : null}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
