"use client";

import { useCallback, useEffect, useState } from "react";
import { strapiMediaUrl } from "@/lib/strapi";
import type { Testimonial } from "@/lib/types";

interface Props {
  testimonials: Testimonial[];
}

const AUTO_MS = 9000;

export default function TestimonialCarousel({ testimonials }: Props) {
  const total = testimonials.length;
  const [active, setActive] = useState(0);
  const next = useCallback(() => setActive((i) => (i + 1) % Math.max(total, 1)), [total]);

  useEffect(() => {
    if (total <= 1) return;
    const id = setInterval(next, AUTO_MS);
    return () => clearInterval(id);
  }, [next, total]);

  if (total === 0) return null;
  const t = testimonials[active];
  const photoUrl = strapiMediaUrl(t.photo?.url);

  return (
    <div className="relative">
      <div className="mx-auto max-w-3xl text-center">
        <span aria-hidden className="block font-display text-7xl leading-none text-brand-200">
          “
        </span>
        <blockquote className="-mt-2 font-display text-2xl leading-relaxed text-slate-800 sm:text-3xl">
          {t.quote}
        </blockquote>
        <div className="mt-8 flex flex-col items-center gap-3">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt={t.author}
              className="h-14 w-14 rounded-full object-cover ring-1 ring-cream-200"
            />
          ) : null}
          <div>
            <div className="font-medium text-slate-900">{t.author}</div>
            {t.role ? <div className="text-sm text-slate-500">{t.role}</div> : null}
          </div>
        </div>
      </div>
      {total > 1 ? (
        <div className="mt-8 flex items-center justify-center gap-2">
          {testimonials.map((_, idx) => (
            <button
              key={`tdot-${idx}`}
              type="button"
              aria-label={`Show testimonial ${idx + 1}`}
              onClick={() => setActive(idx)}
              className={`h-1 rounded-full transition-all ${idx === active ? "w-10 bg-brand-700" : "w-3 bg-cream-200 hover:bg-brand-300"}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
