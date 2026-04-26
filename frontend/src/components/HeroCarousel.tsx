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
}

const AUTO_ADVANCE_MS = 6000;

export default function HeroCarousel({ slides, fallbackTitle, fallbackSubtitle, fallbackCtaLabel, fallbackCtaHref }: Props) {
  const effective: HeroSlide[] = slides.length > 0
    ? slides
    : [{
        image: { url: "" },
        heading: fallbackTitle,
        subheading: fallbackSubtitle,
        ctaLabel: fallbackCtaLabel ?? "Start admission",
        ctaHref: fallbackCtaHref ?? "/admissions"
      }];

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
    <section className="relative isolate min-h-[520px] overflow-hidden bg-brand-900 text-white sm:min-h-[600px] lg:min-h-[640px]">
      {effective.map((slide, idx) => {
        const url = strapiMediaUrl(slide.image?.url);
        const isActive = idx === active;
        return (
          <div
            key={`slide-${idx}`}
            aria-hidden={!isActive}
            className={`absolute inset-0 transition-opacity duration-700 ${isActive ? "opacity-100" : "pointer-events-none opacity-0"}`}
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
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-950/85 via-brand-900/55 to-brand-900/10" />
          </div>
        );
      })}

      <div className="container-page relative flex min-h-[520px] flex-col justify-end py-14 sm:min-h-[600px] sm:py-20 lg:min-h-[640px]">
        <div className="max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-100 ring-1 ring-white/20 backdrop-blur">
            Empowering students since 1986
          </div>
          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            {effective[active]?.heading ?? fallbackTitle}
          </h1>
          {effective[active]?.subheading || fallbackSubtitle ? (
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-200 sm:text-lg">
              {effective[active]?.subheading ?? fallbackSubtitle}
            </p>
          ) : null}
          <div className="mt-7 flex flex-wrap gap-3">
            {effective[active]?.ctaLabel && effective[active]?.ctaHref ? (
              <Link
                href={effective[active].ctaHref ?? "/admissions"}
                className="inline-flex items-center justify-center rounded-full bg-accent-500 px-6 py-3 text-sm font-semibold text-white shadow-prominent ring-1 ring-accent-600/30 transition hover:bg-accent-600"
              >
                {effective[active].ctaLabel}
              </Link>
            ) : null}
            <Link
              href="/about"
              className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
            >
              Discover our school
            </Link>
          </div>
        </div>

        {/* Controls */}
        {total > 1 ? (
          <div className="mt-10 flex items-center gap-4">
            <div className="flex items-center gap-2">
              {effective.map((_, idx) => (
                <button
                  key={`dot-${idx}`}
                  type="button"
                  aria-label={`Go to slide ${idx + 1}`}
                  onClick={() => setActive(idx)}
                  className={`h-1.5 rounded-full transition-all ${idx === active ? "w-10 bg-white" : "w-4 bg-white/40 hover:bg-white/70"}`}
                />
              ))}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                aria-label="Previous slide"
                onClick={prev}
                className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/30 backdrop-blur transition hover:bg-white/20"
              >
                ←
              </button>
              <button
                type="button"
                aria-label="Next slide"
                onClick={next}
                className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/30 backdrop-blur transition hover:bg-white/20"
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
