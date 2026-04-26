import Link from "next/link";
import { strapiMediaUrl } from "@/lib/strapi";
import type { StrapiImage } from "@/lib/types";

interface Props {
  title: string;
  classes?: string;
  body: string;
  image?: StrapiImage | null;
  fallbackImageUrl?: string;
  href?: string;
}

export default function ProgramCard({ title, classes, body, image, fallbackImageUrl, href = "/academics" }: Props) {
  const url = strapiMediaUrl(image?.url ?? null) ?? fallbackImageUrl ?? null;
  return (
    <article className="card flex h-full flex-col">
      <div className="relative aspect-[4/3] overflow-hidden bg-cream-100">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={image?.alternativeText ?? title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="grid h-full w-full place-items-center font-display text-5xl text-cream-200">
            {title.charAt(0)}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6 text-center">
        {classes ? (
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700">
            {classes}
          </div>
        ) : null}
        <h3 className="mt-2 font-display text-2xl font-medium tracking-tight text-slate-900">{title}</h3>
        <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">{body}</p>
        <Link
          href={href}
          className="mt-5 inline-flex w-fit items-center self-center text-sm font-semibold text-brand-700 underline decoration-brand-200 underline-offset-4 transition hover:decoration-brand-700"
        >
          Learn more →
        </Link>
      </div>
    </article>
  );
}
