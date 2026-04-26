import Link from "next/link";
import { strapiMediaUrl } from "@/lib/strapi";
import type { CtaBanner } from "@/lib/types";

interface Props {
  banner: CtaBanner | null | undefined;
  fallbackImageUrl?: string;
}

export default function CTABanner({ banner, fallbackImageUrl }: Props) {
  if (!banner || !banner.title) return null;
  const url = strapiMediaUrl(banner.image?.url ?? null) ?? fallbackImageUrl ?? null;

  return (
    <section className="relative isolate overflow-hidden bg-brand-950 text-white">
      {url ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-40" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-950/85 via-brand-900/65 to-brand-900/30" />
        </>
      ) : null}
      <div className="container-page py-24 lg:py-32">
        <div className="max-w-2xl">
          <div className="eyebrow text-cream-100">Take the next step</div>
          <h2 className="mt-3 font-display text-4xl font-medium tracking-tight sm:text-5xl">
            {banner.title}
          </h2>
          {banner.body ? (
            <p className="mt-5 text-base leading-7 text-slate-100 sm:text-lg">{banner.body}</p>
          ) : null}
          {banner.buttonLabel && banner.buttonHref ? (
            <Link
              href={banner.buttonHref}
              className="mt-8 inline-flex items-center justify-center rounded-md bg-white px-7 py-3 text-sm font-semibold text-brand-900 transition-all hover:-translate-y-0.5 hover:bg-cream-50"
            >
              {banner.buttonLabel} →
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
