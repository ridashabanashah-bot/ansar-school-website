import Link from "next/link";
import type { NavItem, SiteSettings } from "@/lib/types";

const FALLBACK_NAV: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Academics", href: "/academics" },
  { label: "Admissions", href: "/admissions" },
  { label: "News", href: "/news" },
  { label: "Gallery", href: "/gallery" },
  { label: "Documents", href: "/documents" },
  { label: "Contact", href: "/contact" }
];

function cleanNavList(items: NavItem[] | undefined): NavItem[] {
  if (!items || items.length === 0) return [];
  return items
    .map((it) => ({
      label: (it.label ?? "").trim().replace(/\s+/g, " "),
      href: (it.href ?? "").trim(),
      children: cleanNavList(it.children)
    }))
    .filter((it) => it.label.length > 0 && it.href.length > 0);
}

function isExternal(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

function NavLeaf({ item, className }: { item: NavItem; className?: string }) {
  const cls =
    className ??
    "rounded-full px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-brand-50 hover:text-brand-700";
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
        className="rounded-full px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-brand-50 hover:text-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        aria-haspopup="menu"
        aria-expanded="false"
      >
        {item.label}
        <span aria-hidden className="ml-1 text-xs">▾</span>
      </button>
      <div
        role="menu"
        className="invisible absolute left-0 top-full z-40 mt-1 min-w-[14rem] origin-top-left rounded-xl border border-slate-200 bg-white p-2 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
      >
        <ul className="flex flex-col">
          {children.map((c) => (
            <li key={`${c.href}-${c.label}`}>
              <NavLeaf
                item={c}
                className="block rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-700"
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SocialIcon({ href, label, children }: { href?: string; label: string; children: React.ReactNode }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="grid h-7 w-7 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/25"
    >
      {children}
    </a>
  );
}

export default function Header({ settings }: { settings: SiteSettings }) {
  const nav = (() => {
    const fromCms = cleanNavList(settings.navigation);
    return fromCms.length > 0 ? fromCms : FALLBACK_NAV;
  })();
  const phoneText = settings.contactPhone?.trim();
  const emailText = settings.contactEmail?.trim();
  const phoneHref = phoneText ? `tel:${phoneText.replace(/\s/g, "")}` : undefined;
  const emailHref = emailText ? `mailto:${emailText}` : undefined;

  return (
    <header className="sticky top-0 z-30 shadow-sm">
      {/* Utility bar */}
      <div className="hidden bg-brand-800 text-white lg:block">
        <div className="container-page flex h-9 items-center justify-between text-xs">
          <div className="flex items-center gap-5">
            {phoneHref ? (
              <a href={phoneHref} className="flex items-center gap-1.5 hover:text-brand-100">
                <span aria-hidden>📞</span>
                <span>{phoneText}</span>
              </a>
            ) : null}
            {emailHref ? (
              <a href={emailHref} className="flex items-center gap-1.5 hover:text-brand-100">
                <span aria-hidden>✉</span>
                <span>{emailText}</span>
              </a>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            <SocialIcon href={settings.facebookUrl} label="Facebook">
              <span aria-hidden className="text-[10px] font-bold">f</span>
            </SocialIcon>
            <SocialIcon href={settings.instagramUrl} label="Instagram">
              <span aria-hidden className="text-[10px] font-bold">IG</span>
            </SocialIcon>
            <SocialIcon href={settings.youtubeUrl} label="YouTube">
              <span aria-hidden className="text-[10px] font-bold">▶</span>
            </SocialIcon>
            <Link
              href="/admissions"
              className="ml-2 inline-flex items-center rounded-full bg-accent-500 px-3 py-1 text-xs font-semibold text-white shadow-sm ring-1 ring-accent-600/20 transition hover:bg-accent-600"
            >
              Apply now →
            </Link>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between gap-4 lg:h-20">
          <Link href="/" className="flex items-center gap-3">
            <span aria-hidden className="grid h-10 w-10 place-items-center rounded-full bg-brand-700 font-bold text-white shadow-prominent">
              A
            </span>
            <span className="flex flex-col leading-tight">
              <span className="font-display text-base font-semibold text-slate-900 sm:text-lg">
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
            <Link
              href="/admissions"
              className="inline-flex items-center justify-center rounded-full bg-accent-500 px-5 py-2.5 text-sm font-semibold text-white shadow-prominent ring-1 ring-accent-600/20 transition hover:bg-accent-600"
            >
              Apply now
            </Link>
          </div>

          <details className="relative lg:hidden">
            <summary
              aria-label="Toggle menu"
              className="grid h-10 w-10 cursor-pointer list-none place-items-center rounded-md border border-slate-300 text-slate-700"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </summary>
            <div className="absolute right-0 top-full z-40 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
              <ul className="flex flex-col">
                {nav.map((item) => (
                  <li key={`${item.label}-${item.href}-mob`}>
                    {item.children && item.children.length > 0 ? (
                      <details>
                        <summary className="cursor-pointer rounded-md px-3 py-2 text-base font-medium text-slate-800 hover:bg-brand-50">
                          {item.label}
                        </summary>
                        <ul className="ml-3 border-l border-slate-200 pl-3">
                          {item.children.map((c) => (
                            <li key={`${c.label}-${c.href}-mob-c`}>
                              <NavLeaf
                                item={c}
                                className="block rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-700"
                              />
                            </li>
                          ))}
                        </ul>
                      </details>
                    ) : (
                      <NavLeaf
                        item={item}
                        className="block rounded-md px-3 py-2 text-base text-slate-700 hover:bg-brand-50 hover:text-brand-700"
                      />
                    )}
                  </li>
                ))}
                <li className="mt-2">
                  <Link
                    href="/admissions"
                    className="inline-flex w-full items-center justify-center rounded-full bg-accent-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm ring-1 ring-accent-600/20"
                  >
                    Apply now
                  </Link>
                </li>
              </ul>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
