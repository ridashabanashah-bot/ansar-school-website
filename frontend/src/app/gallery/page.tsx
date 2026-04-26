import PageHeader from "@/components/PageHeader";
import { getGallery } from "@/lib/content";
import { strapiMediaUrl } from "@/lib/strapi";

export const revalidate = 60;
export const metadata = { title: "Gallery" };

export default async function GalleryPage() {
  const items = await getGallery();

  return (
    <>
      <PageHeader eyebrow="Photo gallery" title="Life at our school" intro="Snapshots from classes, events, and celebrations." />

      <section className="container-page py-12">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
            <h2 className="font-display text-xl font-semibold text-slate-900">Gallery coming soon</h2>
            <p className="mt-2 text-sm text-slate-600">
              Photos will appear here once they are uploaded through the CMS.
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => {
              const src = strapiMediaUrl(item.image?.url) ?? "";
              return (
                <li key={item.id} className="overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={item.image?.alternativeText ?? item.title ?? "Gallery image"}
                    className="aspect-square h-full w-full object-cover transition hover:scale-105"
                    loading="lazy"
                  />
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
