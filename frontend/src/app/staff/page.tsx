import PageHeader from "@/components/PageHeader";
import { getStaff } from "@/lib/content";
import { strapiMediaUrl } from "@/lib/strapi";

export const revalidate = 60;
export const metadata = { title: "Staff" };

export default async function StaffPage() {
  const staff = await getStaff();

  return (
    <>
      <PageHeader eyebrow="Our people" title="Staff & faculty" intro="The teachers and staff who make Ansar what it is." />

      <section className="container-page py-12">
        {staff.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
            <h2 className="font-display text-xl font-semibold text-slate-900">Directory coming soon</h2>
            <p className="mt-2 text-sm text-slate-600">Staff profiles will appear here once added in the CMS.</p>
          </div>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {staff.map((s) => {
              const photo = strapiMediaUrl(s.photo?.url);
              return (
                <li key={s.id} className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
                  <div className="mx-auto h-24 w-24 overflow-hidden rounded-full bg-gradient-to-br from-brand-200 to-brand-500 ring-1 ring-brand-300/40">
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photo} alt={s.photo?.alternativeText ?? s.name} className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="mt-4 font-display text-lg font-semibold text-slate-900">{s.name}</div>
                  <div className="text-sm text-brand-700">{s.role}</div>
                  {s.bio ? <p className="mt-3 text-sm text-slate-600">{s.bio}</p> : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
