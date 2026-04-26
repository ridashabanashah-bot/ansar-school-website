import Markdown from "@/components/Markdown";
import SectionLinkGrid from "@/components/SectionLinkGrid";
import { getPageBySlug } from "@/lib/content";
import { FALLBACK_HERO_PHOTOS } from "@/lib/fallbackPhotos";

export const revalidate = 60;
export const metadata = {
  title: "Life at Ansar",
  description: "Daily life, sports, arts, and celebrations at Ansar School Padhinjarangadi."
};

export default async function LifePage() {
  const overview = await getPageBySlug("overview");
  const heroUrl = FALLBACK_HERO_PHOTOS[3] ?? FALLBACK_HERO_PHOTOS[0];

  return (
    <>
      <section className="relative isolate min-h-[55vh] overflow-hidden bg-brand-950 text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={heroUrl} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-950/85 via-brand-900/45 to-brand-900/15" />
        <div className="container-page flex min-h-[55vh] flex-col justify-end pb-16 pt-32 lg:pb-24">
          <div className="eyebrow text-cream-100">Day to day</div>
          <h1 className="mt-3 max-w-3xl font-display text-5xl font-medium leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            Life at Ansar
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
            The rhythm of every day — and the small traditions that shape it.
          </p>
        </div>
      </section>

      {overview && overview.body ? (
        <section className="bg-cream-50 section-pad">
          <div className="container-page mx-auto max-w-3xl">
            <Markdown source={overview.body} mode="markdown" />
          </div>
        </section>
      ) : null}

      <SectionLinkGrid eyebrow="Day to day" title="Inside our school" section="life" />
    </>
  );
}
