"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { strapiMediaUrl } from "@/lib/strapi";
import type { HeroSlide } from "@/lib/types";

interface Props {
  slides: HeroSlide[];
  fallbackTitle: string;
  fallbackSubtitle?: string;
  fallbackCtaLabel?: string;
  fallbackCtaHref?: string;
  /** Optional decorative photos used when CMS has no slides yet. */
  fallbackImageUrls?: string[];
}

const AUTO_ADVANCE_MS = 8000;

export default function HeroCarousel({
  slides,
  fallbackTitle,
  fallbackSubtitle,
  fallbackCtaLabel,
  fallbackCtaHref,
  fallbackImageUrls = []
}: Props) {
  const effective: HeroSlide[] = slides.length > 0
    ? slides
    : (fallbackImageUrls.length > 0 ? fallbackImageUrls : [""]).map((u) => ({
        image: { url: u },
        heading: fallbackTitle,
        subheading: fallbackSubtitle,
        ctaLabel: fallbackCtaLabel ?? "Apply for admission",
        ctaHref: fallbackCtaHref ?? "/admissions"
      }));

  const [active, setActive] = useState(0);
  const total = effective.length;
  const next = useCallback(() => setActive((i) => (i + 1) % total), [total]);
  const prev = useCallback(() => setActive((i) => (i - 1 + total) % total), [total]);

  useEffect(() => {
    if (total <= 1) return;
    const id = setInterval(next, AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [next, total]);

  return (
    <section
      className="group/hero relative isolate min-h-[70vh] overflow-hidden bg-brand-950 text-white sm:min-h-[78vh] lg:min-h-[80vh]"
    >
      {effective.map((slide, idx) => {
        const url = strapiMediaUrl(slide.image?.url) ?? slide.image?.url ?? null;
        const isActive = idx === active;
        return (
          <div
            key={`slide-${idx}`}
            aria-hidden={!isActive}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isActive ? "opacity-100" : "pointer-events-none opacity-0"}`}
          >
            {url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
            ) : (
              <div
                className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900"
                aria-hidden
              />
            )}
            {/* Bottom-up dark gradient for text legibility */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-950/85 via-brand-900/45 to-brand-900/10" />
          </div>
        );
      })}

      <div className="container-page relative flex min-h-[70vh] flex-col justify-end pb-20 pt-32 sm:min-h-[78vh] lg:min-h-[80vh] lg:pb-28">
        <div className="max-w-3xl">
          <div className="eyebrow text-cream-100">
            Established 1986 · Padhinjarangadi, Kerala
          </div>
          <h1 className="mt-3 font-display text-5xl font-medium leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            {effective[active]?.heading ?? fallbackTitle}
          </h1>
          {effective[active]?.subheading || fallbackSubtitle ? (
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-100 sm:text-lg">
              {effective[active]?.subheading ?? fallbackSubtitle}
            </p>
          ) : null}
          <div className="mt-8 flex flex-wrap gap-3">
            {effective[active]?.ctaLabel && effective[active]?.ctaHref ? (
              <Link
                href={effective[active].ctaHref ?? "/admissions"}
                className="inline-flex items-center justify-center rounded-md bg-white px-7 py-3 text-sm font-semibold text-brand-900 transition-all hover:-translate-y-0.5 hover:bg-cream-50"
              >
                {effective[active].ctaLabel}
              </Link>
            ) : null}
          </div>
        </div>

        {/* Controls — visible on hover only on lg+ */}
        {total > 1 ? (
          <div className="mt-12 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {effective.map((_, idx) => (
                <button
                  key={`dot-${idx}`}
                  type="button"
                  aria-label={`Go to slide ${idx + 1}`}
                  onClick={() => setActive(idx)}
                  className={`h-1 rounded-full transition-all ${idx === active ? "w-12 bg-white" : "w-4 bg-white/40 hover:bg-white/70"}`}
                />
              ))}
            </div>
            <div className="hidden items-center gap-2 opacity-0 transition group-hover/hero:opacity-100 lg:flex">
              <button
                type="button"
                aria-label="Previous slide"
                onClick={prev}
                className="grid h-10 w-10 place-items-center rounded-full border border-white/40 bg-white/5 text-white backdrop-blur transition hover:bg-white/15"
              >
                ←
              </button>
              <button
                type="button"
                aria-label="Next slide"
                onClick={next}
                className="grid h-10 w-10 place-items-center rounded-full border border-white/40 bg-white/5 text-white backdrop-blur transition hover:bg-white/15"
              >
                →
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
