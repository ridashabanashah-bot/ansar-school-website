import Link from "next/link";
import { strapiMediaUrl } from "@/lib/strapi";
import type { StrapiImage } from "@/lib/types";

interface Props {
  title: string;
  classes?: string;
  body: string;
  image?: StrapiImage | null;
  href?: string;
}

export default function ProgramCard({ title, classes, body, image, href = "/academics" }: Props) {
  const url = strapiMediaUrl(image?.url ?? null);
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-prominent">
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-brand-100 via-brand-50 to-warmth-50">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt={image?.alternativeText ?? title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full w-full place-items-center">
            <span aria-hidden className="text-5xl font-display font-semibold text-brand-300">
              {title.charAt(0)}
            </span>
          </div>
        )}
        {classes ? (
          <div className="absolute bottom-3 left-3 inline-flex items-center rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-brand-700 shadow-sm ring-1 ring-brand-700/10">
            {classes}
          </div>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-semibold text-slate-900">{title}</h3>
        <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{body}</p>
        <Link
          href={href}
          className="mt-4 inline-flex w-fit items-center text-sm font-semibold text-brand-700 transition hover:text-brand-800"
        >
          Learn more →
        </Link>
      </div>
    </article>
  );
}
