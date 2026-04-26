import Link from "next/link";
import type { NavItem, SiteSettings } from "@/lib/types";

const FALLBACK_FOOTER_NAV: NavItem[] = [
  { label: "About", href: "/about" },
  { label: "Admissions", href: "/admissions" },
  { label: "News & events", href: "/news" },
  { label: "Documents", href: "/documents" },
  { label: "Contact", href: "/contact" }
];

function cleanFlat(items: NavItem[] | undefined): NavItem[] {
  if (!items || items.length === 0) return [];
  return items
    .map((it) => ({
      label: (it.label ?? "").trim().replace(/\s+/g, " "),
      href: (it.href ?? "").trim()
    }))
    .filter((it) => it.label.length > 0 && it.href.length > 0 && it.href !== "#");
}

function isExternal(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

function FooterLink({ item }: { item: NavItem }) {
  const cls = "hover:text-brand-700";
  if (isExternal(item.href) || item.href.endsWith(".pdf")) {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer" className={cls}>
        {item.label}
      </a>
    );
  }
  return (
    <Link href={item.href} className={cls}>
      {item.label}
    </Link>
  );
}

export default function Footer({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear();
  const links = cleanFlat(settings.footerNavigation);
  const exploreLinks = links.length > 0 ? links : FALLBACK_FOOTER_NAV;

  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-50">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="font-display text-lg font-semibold text-slate-900">{settings.schoolName}</div>
          {settings.tagline ? <p className="mt-2 text-sm text-slate-600">{settings.tagline}</p> : null}
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Visit</h3>
          {settings.address ? (
            <p className="mt-3 whitespace-pre-line text-sm text-slate-700">{settings.address}</p>
          ) : null}
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Contact</h3>
          <ul className="mt-3 space-y-1 text-sm text-slate-700">
            {settings.contactPhone ? (
              <li>
                <a href={`tel:${settings.contactPhone.replace(/\s/g, "")}`} className="hover:text-brand-700">
                  {settings.contactPhone}
                </a>
              </li>
            ) : null}
            {settings.contactEmail ? (
              <li>
                <a href={`mailto:${settings.contactEmail}`} className="hover:text-brand-700">
                  {settings.contactEmail}
                </a>
              </li>
            ) : null}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Explore</h3>
          <ul className="mt-3 space-y-1 text-sm text-slate-700">
            {exploreLinks.slice(0, 12).map((item) => (
              <li key={`${item.label}-${item.href}`}>
                <FooterLink item={item} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-200 py-4">
        <div className="container-page flex flex-col items-center justify-between gap-2 text-xs text-slate-500 sm:flex-row">
          <span>
            © {year} {settings.schoolName}. All rights reserved.
          </span>
          <span>Padhinjarangadi, Kerala, India</span>
        </div>
      </div>
    </footer>
  );
}
