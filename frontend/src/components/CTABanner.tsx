import Link from "next/link";
import { strapiMediaUrl } from "@/lib/strapi";
import type { CtaBanner } from "@/lib/types";

interface Props {
  banner: CtaBanner | null | undefined;
}

export default function CTABanner({ banner }: Props) {
  if (!banner || !banner.title) return null;
  const url = strapiMediaUrl(banner.image?.url ?? null);

  return (
    <section className="container-page py-12 lg:py-16">
      <div className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900 px-6 py-12 shadow-prominent sm:px-12 sm:py-16">
        {url ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt=""
              className="absolute inset-0 -z-10 h-full w-full object-cover opacity-25"
            />
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-900/85 via-brand-800/70 to-brand-700/55" />
          </>
        ) : null}
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="text-white">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-100">
              Take the next step
            </div>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {banner.title}
            </h2>
            {banner.body ? (
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-100">{banner.body}</p>
            ) : null}
          </div>
          {banner.buttonLabel && banner.buttonHref ? (
            <Link
              href={banner.buttonHref}
              className="inline-flex items-center justify-center rounded-full bg-accent-500 px-7 py-3.5 text-sm font-semibold text-white shadow-prominent ring-1 ring-accent-600/30 transition hover:bg-accent-600"
            >
              {banner.buttonLabel} →
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
