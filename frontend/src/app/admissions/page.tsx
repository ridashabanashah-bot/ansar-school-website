import PageHeader from "@/components/PageHeader";
import { getAdmissionsPage, getSiteSettings } from "@/lib/content";

export const revalidate = 60;
export const metadata = { title: "Admissions" };

export default async function AdmissionsPage() {
  const data = await getAdmissionsPage();
  const settings = await getSiteSettings();

  return (
    <>
      <PageHeader eyebrow="Join us" title={data.title} intro={data.intro} />

      {data.process && data.process.length > 0 ? (
        <section className="container-page py-16">
          <h2 className="font-display text-2xl font-semibold text-slate-900">How to apply</h2>
          <ol className="mt-8 space-y-4">
            {data.process.map((p) => (
              <li
                key={p.step}
                className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5"
              >
                <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-brand-600 font-semibold text-white">
                  {p.step}
                </span>
                <div>
                  <div className="font-semibold text-slate-900">{p.title}</div>
                  <div className="mt-1 text-sm text-slate-600">{p.description}</div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <section className="bg-slate-50 py-16">
        <div className="container-page grid gap-10 lg:grid-cols-2">
          {data.documentsRequired && data.documentsRequired.length > 0 ? (
            <div>
              <h2 className="font-display text-2xl font-semibold text-slate-900">Documents required</h2>
              <ul className="mt-4 space-y-2 text-sm text-slate-700">
                {data.documentsRequired.map((d, i) => (
                  <li key={i} className="flex gap-2">
                    <span aria-hidden className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-brand-600" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="space-y-6">
            {data.ageEligibility ? (
              <div>
                <h2 className="font-display text-2xl font-semibold text-slate-900">Age eligibility</h2>
                <p className="mt-2 text-sm text-slate-700">{data.ageEligibility}</p>
              </div>
            ) : null}
            {data.feeNote ? (
              <div>
                <h2 className="font-display text-2xl font-semibold text-slate-900">Fees</h2>
                <p className="mt-2 text-sm text-slate-700">{data.feeNote}</p>
              </div>
            ) : null}
            <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">
              <h3 className="font-display text-lg font-semibold text-slate-900">Questions?</h3>
              <p className="mt-2 text-sm text-slate-600">Reach the school office:</p>
              <p className="mt-3 text-sm">
                {settings.contactPhone ? (
                  <a className="font-semibold text-brand-700 hover:underline" href={`tel:${settings.contactPhone.replace(/\s/g, "")}`}>
                    {settings.contactPhone}
                  </a>
                ) : null}
                {settings.contactEmail ? (
                  <>
                    <br />
                    <a className="font-semibold text-brand-700 hover:underline" href={`mailto:${settings.contactEmail}`}>
                      {settings.contactEmail}
                    </a>
                  </>
                ) : null}
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
