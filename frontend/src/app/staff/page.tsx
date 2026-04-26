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

      <section className="container-page section-pad">
        {staff.length === 0 ? (
          <div className="rounded-xl border border-dashed border-cream-200 bg-cream-50 p-12 text-center">
            <h2 className="font-display text-2xl font-medium tracking-tight text-slate-900">Directory coming soon</h2>
            <p className="mt-2 text-sm text-slate-600">Staff profiles will appear here once added in the CMS.</p>
          </div>
        ) : (
          <ul className="mx-auto grid max-w-5xl gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {staff.map((s) => {
              const photo = strapiMediaUrl(s.photo?.url);
              return (
                <li key={s.id} className="text-center">
                  <div className="mx-auto aspect-[3/4] w-full max-w-[18rem] overflow-hidden rounded-xl bg-cream-100 ring-1 ring-cream-200">
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photo} alt={s.photo?.alternativeText ?? s.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full w-full place-items-center font-display text-5xl text-cream-200">
                        {s.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="mt-5 font-display text-xl font-medium tracking-tight text-slate-900">{s.name}</div>
                  <div className="mt-1 text-sm text-slate-500">{s.role}</div>
                  {s.bio ? <p className="mx-auto mt-3 max-w-xs text-sm leading-7 text-slate-600">{s.bio}</p> : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
