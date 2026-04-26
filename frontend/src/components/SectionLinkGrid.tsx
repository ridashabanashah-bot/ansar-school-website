import Link from "next/link";
import { getPages } from "@/lib/content";
import { pagePath } from "@/lib/sections";
import type { PageSection } from "@/lib/types";

interface Props {
  eyebrow: string;
  title: string;
  section: PageSection | string;
}

function plainText(md: string | undefined): string {
  if (!md) return "";
  return md
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // images
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // links → label
    .replace(/^#{1,6}\s+.+$/gm, "") // headings
    .replace(/[*_`>~-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 60 ? cut.slice(0, lastSpace) : cut) + "…";
}

export default async function SectionLinkGrid({ eyebrow, title, section }: Props) {
  const pages = await getPages(section);
  if (pages.length === 0) return null;

  return (
    <section className="container-page section-pad">
      <div className="mx-auto max-w-2xl text-center">
        <div className="eyebrow">{eyebrow}</div>
        <h2 className="mt-3 font-display text-4xl font-medium tracking-tight text-slate-900 sm:text-5xl">
          {title}
        </h2>
      </div>
      <ul className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {pages.map((p) => {
          const lead = truncate(plainText(p.body), 120);
          const href = pagePath(p.section, p.slug);
          return (
            <li key={p.id}>
              <Link
                href={href}
                className="card flex h-full flex-col p-6"
              >
                <h3 className="font-display text-xl font-medium tracking-tight text-slate-900">
                  {p.title}
                </h3>
                {lead ? (
                  <p className="mt-2 flex-1 text-sm leading-7 text-slate-600">{lead}</p>
                ) : null}
                <span className="mt-4 inline-flex items-center text-sm font-semibold text-brand-700 underline decoration-brand-200 underline-offset-4">
                  Read more →
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
