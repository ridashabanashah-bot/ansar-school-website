import Link from "next/link";
import { strapiMediaUrl } from "@/lib/strapi";
import type { NavItem, SiteSettings } from "@/lib/types";

const FALLBACK_NAV: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Academics", href: "/academics" },
  { label: "Admissions", href: "/admissions" },
  { label: "News", href: "/news" },
  { label: "Gallery", href: "/gallery" },
  { label: "Staff", href: "/staff" },
  { label: "Documents", href: "/documents" },
  { label: "Contact", href: "/contact" }
];

function cleanNav(items: NavItem[] | undefined): NavItem[] {
  if (!items || items.length === 0) return [];
  return items
    .map((it) => ({
      label: (it.label ?? "").trim().replace(/\s+/g, " "),
      href: (it.href ?? "").trim(),
      children: cleanNav(it.children)
    }))
    .filter((it) => it.label.length > 0 && it.href.length > 0);
}

function isExternal(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

function NavLeaf({ item, className }: { item: NavItem; className?: string }) {
  const cls =
    className ??
    "rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition hover:text-brand-700";
  if (isExternal(item.href) || item.href.endsWith(".pdf")) {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer" className={cls}>
        {item.label}
      </a>
    );
  }
  if (item.href === "#" || item.href === "") {
    return <span className={cls}>{item.label}</span>;
  }
  return (
    <Link href={item.href} className={cls}>
      {item.label}
    </Link>
  );
}

function NavWithChildren({ item }: { item: NavItem }) {
  const children = item.children ?? [];
  return (
    <div className="group relative">
      <button
        type="button"
        className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition hover:text-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
        aria-haspopup="menu"
        aria-expanded="false"
      >
        {item.label}
        <span aria-hidden className="ml-1 text-xs">▾</span>
      </button>
      <div
        role="menu"
        className="invisible absolute left-0 top-full z-40 mt-1 min-w-[14rem] origin-top-left rounded-lg border border-cream-200 bg-white p-2 opacity-0 shadow-prominent ring-1 ring-black/5 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
      >
        <ul className="flex flex-col">
          {children.map((c) => (
            <li key={`${c.href}-${c.label}`}>
              <NavLeaf
                item={c}
                className="block rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-cream-50 hover:text-brand-700"
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function Header({ settings }: { settings: SiteSettings }) {
  const nav = (() => {
    const fromCms = cleanNav(settings.navigation);
    return fromCms.length > 0 ? fromCms : FALLBACK_NAV;
  })();
  const cmsLogo = strapiMediaUrl(settings.logo?.url ?? null);
  const logoUrl = cmsLogo ?? "/logo.png";

  return (
    <header className="sticky top-0 z-30 border-b border-cream-200 bg-cream-50/95 backdrop-blur">
      <div className="container-page flex h-20 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoUrl}
            alt={settings.schoolName}
            className="h-12 w-12 rounded-full object-contain"
          />
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="font-display text-base font-medium tracking-tight text-slate-900 sm:text-lg">
              {settings.schoolName}
            </span>
            {settings.tagline ? (
              <span className="text-xs text-slate-500">{settings.tagline}</span>
            ) : null}
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {nav.map((item) =>
            item.children && item.children.length > 0 ? (
              <NavWithChildren key={`${item.label}-${item.href}`} item={item} />
            ) : (
              <NavLeaf key={`${item.label}-${item.href}`} item={item} />
            )
          )}
        </nav>

        <div className="hidden lg:block">
          <Link href="/admissions" className="btn-primary">
            Apply now
          </Link>
        </div>

        <details className="relative lg:hidden">
          <summary
            aria-label="Toggle menu"
            className="grid h-10 w-10 cursor-pointer list-none place-items-center rounded-md border border-cream-200 text-slate-700"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </summary>
          <div className="absolute right-0 top-full z-40 mt-2 w-72 rounded-lg border border-cream-200 bg-white p-3 shadow-prominent ring-1 ring-black/5">
            <ul className="flex flex-col">
              {nav.map((item) => (
                <li key={`${item.label}-${item.href}-mob`}>
                  {item.children && item.children.length > 0 ? (
                    <details>
                      <summary className="cursor-pointer rounded-md px-3 py-2 text-base font-medium text-slate-800 hover:bg-cream-50">
                        {item.label}
                      </summary>
                      <ul className="ml-3 border-l border-cream-200 pl-3">
                        {item.children.map((c) => (
                          <li key={`${c.label}-${c.href}-mob-c`}>
                            <NavLeaf
                              item={c}
                              className="block rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-cream-50 hover:text-brand-700"
                            />
                          </li>
                        ))}
                      </ul>
                    </details>
                  ) : (
                    <NavLeaf
                      item={item}
                      className="block rounded-md px-3 py-2 text-base text-slate-700 hover:bg-cream-50 hover:text-brand-700"
                    />
                  )}
                </li>
              ))}
              <li className="mt-2">
                <Link href="/admissions" className="btn-primary w-full">
                  Apply now
                </Link>
              </li>
            </ul>
          </div>
        </details>
      </div>
    </header>
  );
}
