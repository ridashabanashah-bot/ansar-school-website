import Link from "next/link";
import ProgramCard from "@/components/ProgramCard";
import SectionLinkGrid from "@/components/SectionLinkGrid";
import { getAcademicsPage } from "@/lib/content";
import { FALLBACK_ACADEMICS_HERO, FALLBACK_FACILITY_PHOTOS, FALLBACK_PROGRAM_PHOTOS } from "@/lib/fallbackPhotos";

export const revalidate = 60;
export const metadata = { title: "Academics" };

function facilityPhoto(name: string): string {
  if (FALLBACK_FACILITY_PHOTOS[name]) return FALLBACK_FACILITY_PHOTOS[name];
  // loose match
  const key = Object.keys(FALLBACK_FACILITY_PHOTOS).find((k) => name.toLowerCase().includes(k.toLowerCase()));
  return key ? FALLBACK_FACILITY_PHOTOS[key] : "/photos/facilities/library.webp";
}

export default async function AcademicsPage() {
  const data = await getAcademicsPage();

  return (
    <>
      <section className="relative isolate min-h-[55vh] overflow-hidden bg-brand-950 text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={FALLBACK_ACADEMICS_HERO} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-950/85 via-brand-900/45 to-brand-900/15" />
        <div className="container-page flex min-h-[55vh] flex-col justify-end pb-16 pt-32 lg:pb-24">
          <div className="eyebrow text-cream-100">Curriculum</div>
          <h1 className="mt-3 max-w-3xl font-display text-5xl font-medium leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            {data.title}
          </h1>
          {data.intro ? (
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">{data.intro}</p>
          ) : null}
        </div>
      </section>

      {/* Programs grid */}
      {data.programs && data.programs.length > 0 ? (
        <section className="container-page section-pad">
          <div className="mx-auto max-w-2xl text-center">
            <div className="eyebrow">Programs</div>
            <h2 className="mt-3 font-display text-4xl font-medium tracking-tight text-slate-900 sm:text-5xl">
              From early years through high school
            </h2>
          </div>
          <div className="mx-auto mt-14 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {data.programs.map((p, i) => (
              <ProgramCard
                key={p.name}
                title={p.name}
                classes={p.classes}
                body={p.description}
                fallbackImageUrl={FALLBACK_PROGRAM_PHOTOS[i % FALLBACK_PROGRAM_PHOTOS.length]}
                href="/admissions"
              />
            ))}
          </div>
        </section>
      ) : null}

      {/* Facilities — 2-col list with thumbnail per item */}
      {data.facilities && data.facilities.length > 0 ? (
        <section className="bg-cream-50 section-pad">
          <div className="container-page">
            <div className="mx-auto max-w-2xl text-center">
              <div className="eyebrow">Campus</div>
              <h2 className="mt-3 font-display text-4xl font-medium tracking-tight text-slate-900 sm:text-5xl">
                Facilities your child will use
              </h2>
            </div>
            <ul className="mx-auto mt-14 grid max-w-5xl gap-8 md:grid-cols-2">
              {data.facilities.map((f) => (
                <li key={f.name} className="flex gap-5">
                  <div className="aspect-square h-28 w-28 flex-none overflow-hidden rounded-xl ring-1 ring-cream-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={facilityPhoto(f.name)} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-medium tracking-tight text-slate-900">{f.name}</h3>
                    <p className="mt-1 text-sm leading-7 text-slate-600">{f.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <SectionLinkGrid eyebrow="Dive deeper" title="Academic resources" section="academics" />

      {/* Inline CTA */}
      <section className="container-page section-pad">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
          <div className="eyebrow">Next step</div>
          <h3 className="font-display text-3xl font-medium tracking-tight text-slate-900 sm:text-4xl">
            Want the full curriculum overview?
          </h3>
          <p className="text-slate-600">Our admissions team will walk you through it.</p>
          <Link href="/admissions" className="btn-primary mt-2">
            Talk to admissions
          </Link>
        </div>
      </section>
    </>
  );
}
