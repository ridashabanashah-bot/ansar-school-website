import PageHeader from "@/components/PageHeader";
import { getSiteSettings } from "@/lib/content";

export const revalidate = 60;
export const metadata = { title: "Contact" };

export default async function ContactPage() {
  const s = await getSiteSettings();

  return (
    <>
      <PageHeader eyebrow="Get in touch" title="Contact us" intro="Visit us, call, or send us a message." />

      <section className="container-page py-12">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-xl font-semibold text-slate-900">Address</h2>
              <p className="mt-2 whitespace-pre-line text-slate-700">{s.address}</p>
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-slate-900">Phone</h2>
              <p className="mt-2 text-slate-700">
                {s.contactPhone ? (
                  <a className="text-brand-700 hover:underline" href={`tel:${s.contactPhone.replace(/\s/g, "")}`}>
                    {s.contactPhone}
                  </a>
                ) : (
                  "—"
                )}
              </p>
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-slate-900">Email</h2>
              <p className="mt-2 text-slate-700">
                {s.contactEmail ? (
                  <a className="text-brand-700 hover:underline" href={`mailto:${s.contactEmail}`}>
                    {s.contactEmail}
                  </a>
                ) : (
                  "—"
                )}
              </p>
            </div>
          </div>

          <div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              {s.mapEmbedUrl ? (
                <iframe
                  src={s.mapEmbedUrl}
                  title="School location map"
                  className="aspect-video w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <div className="grid aspect-video place-items-center text-sm text-slate-500">
                  Map will appear here once a Google Maps embed URL is added in the CMS.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
