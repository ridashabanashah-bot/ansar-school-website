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

      <section className="container-page section-pad">
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-cream-200 bg-cream-50 p-12 text-center">
            <h2 className="font-display text-2xl font-medium tracking-tight text-slate-900">Gallery coming soon</h2>
            <p className="mt-2 text-sm text-slate-600">
              Photos will appear here once they are uploaded through the CMS.
            </p>
          </div>
        ) : (
          // Tasteful masonry via CSS columns; break-inside avoid keeps each
          // image whole, varying heights make the grid feel curated.
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
            {items.map((item) => {
              const src = strapiMediaUrl(item.image?.url) ?? "";
              return (
                <figure
                  key={item.id}
                  className="mb-4 break-inside-avoid overflow-hidden rounded-xl ring-1 ring-cream-200"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={item.image?.alternativeText ?? item.title ?? "Gallery image"}
                    className="w-full"
                    loading="lazy"
                  />
                  {item.caption ? (
                    <figcaption className="bg-white px-4 py-3 text-xs text-slate-500">
                      {item.caption}
                    </figcaption>
                  ) : null}
                </figure>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
