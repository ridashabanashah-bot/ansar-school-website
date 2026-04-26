import PageHeader from "@/components/PageHeader";
import { getSiteSettings } from "@/lib/content";

export const revalidate = 60;
export const metadata = { title: "Contact" };

export default async function ContactPage() {
  const s = await getSiteSettings();
  const addressLines: string[] = [];
  if (s.addressLine1) addressLines.push(s.addressLine1);
  if (s.addressLine2) addressLines.push(s.addressLine2);
  if (addressLines.length === 0 && s.address) {
    addressLines.push(...s.address.split(/\n+/).map((l) => l.trim()).filter(Boolean));
  }

  return (
    <>
      <PageHeader eyebrow="Get in touch" title="Contact us" intro="Visit the campus, call, or send us a message." />

      <section className="container-page section-pad">
        <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="space-y-8">
            <div>
              <h2 className="eyebrow">Address</h2>
              <div className="mt-3 text-base leading-8 text-slate-700">
                {addressLines.length > 0
                  ? addressLines.map((l, i) => <div key={`addr-${i}`}>{l}</div>)
                  : <div>—</div>}
              </div>
            </div>
            <div>
              <h2 className="eyebrow">Phone</h2>
              <p className="mt-3 text-base leading-7 text-slate-700">
                {s.contactPhone ? (
                  <a className="text-brand-700 underline decoration-brand-200 underline-offset-4 hover:decoration-brand-700" href={`tel:${s.contactPhone.replace(/\s/g, "")}`}>
                    {s.contactPhone}
                  </a>
                ) : (
                  "—"
                )}
              </p>
            </div>
            <div>
              <h2 className="eyebrow">Email</h2>
              <p className="mt-3 text-base leading-7 text-slate-700">
                {s.contactEmail ? (
                  <a className="text-brand-700 underline decoration-brand-200 underline-offset-4 hover:decoration-brand-700" href={`mailto:${s.contactEmail}`}>
                    {s.contactEmail}
                  </a>
                ) : (
                  "—"
                )}
              </p>
            </div>
            {s.officeHours ? (
              <div>
                <h2 className="eyebrow">Office hours</h2>
                <p className="mt-3 text-base leading-7 text-slate-700">{s.officeHours}</p>
              </div>
            ) : null}
          </div>

          <div className="overflow-hidden rounded-xl border border-cream-200 bg-cream-50">
            {s.mapEmbedUrl ? (
              <iframe
                src={s.mapEmbedUrl}
                title="School location map"
                className="aspect-square w-full lg:aspect-[4/5]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            ) : (
              <div className="grid aspect-square place-items-center text-sm text-slate-500 lg:aspect-[4/5]">
                Map will appear here once a Google Maps embed URL is added in the CMS.
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
