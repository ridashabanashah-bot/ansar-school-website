"use client";

import { useCallback, useEffect, useState } from "react";
import { strapiMediaUrl } from "@/lib/strapi";
import type { Testimonial } from "@/lib/types";

interface Props {
  testimonials: Testimonial[];
}

const AUTO_MS = 7000;

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
      <article className="rounded-3xl border border-slate-200 bg-white p-8 shadow-prominent sm:p-10">
        <span aria-hidden className="block font-display text-6xl leading-none text-brand-200">“</span>
        <blockquote className="mt-2 text-lg leading-8 text-slate-800 sm:text-xl">
          {t.quote}
        </blockquote>
        <div className="mt-6 flex items-center gap-4">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt={t.author}
              className="h-12 w-12 rounded-full object-cover ring-2 ring-brand-100"
            />
          ) : (
            <span aria-hidden className="grid h-12 w-12 place-items-center rounded-full bg-brand-100 font-display text-base font-semibold text-brand-700">
              {t.author.charAt(0)}
            </span>
          )}
          <div>
            <div className="font-semibold text-slate-900">{t.author}</div>
            {t.role ? <div className="text-sm text-slate-500">{t.role}</div> : null}
          </div>
        </div>
      </article>
      {total > 1 ? (
        <div className="mt-5 flex items-center justify-center gap-2">
          {testimonials.map((_, idx) => (
            <button
              key={`tdot-${idx}`}
              type="button"
              aria-label={`Show testimonial ${idx + 1}`}
              onClick={() => setActive(idx)}
              className={`h-1.5 rounded-full transition-all ${idx === active ? "w-10 bg-brand-700" : "w-4 bg-slate-300 hover:bg-slate-400"}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
