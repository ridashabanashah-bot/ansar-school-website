import Link from "next/link";
import { strapiMediaUrl } from "@/lib/strapi";
import type { NavItem, SiteSettings } from "@/lib/types";

const FALLBACK_FOOTER_NAV: NavItem[] = [
  { label: "About", href: "/about" },
  { label: "Academics", href: "/academics" },
  { label: "Admissions", href: "/admissions" },
  { label: "News", href: "/news" },
  { label: "Gallery", href: "/gallery" },
  { label: "Staff", href: "/staff" },
  { label: "Documents", href: "/documents" },
  { label: "Contact", href: "/contact" }
];

const POLICY_LINKS: NavItem[] = [
  { label: "Privacy policy", href: "/policies/privacy_policy" },
  { label: "Terms & conditions", href: "/policies/terms_and_condition" },
  { label: "Refund policy", href: "/policies/refund_policy" }
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
  const cls = "block py-1 text-sm text-slate-600 transition hover:text-brand-700";
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

function SocialDot({ href, label, glyph }: { href?: string; label: string; glyph: string }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="grid h-9 w-9 place-items-center rounded-full border border-cream-200 bg-white text-slate-600 transition hover:border-brand-300 hover:text-brand-700"
    >
      <span aria-hidden className="text-xs font-bold">
        {glyph}
      </span>
    </a>
  );
}

export default function Footer({ settings }: { settings: SiteSettings }) {
  const year = new Date().getFullYear();
  const exploreLinks = (() => {
    const links = cleanFlat(settings.footerNavigation);
    return links.length > 0 ? links.slice(0, 8) : FALLBACK_FOOTER_NAV;
  })();
  const phoneHref = settings.contactPhone ? `tel:${settings.contactPhone.replace(/\s/g, "")}` : undefined;
  const addressLines: string[] = [];
  if (settings.addressLine1) addressLines.push(settings.addressLine1);
  if (settings.addressLine2) addressLines.push(settings.addressLine2);
  if (addressLines.length === 0 && settings.address) {
    addressLines.push(...settings.address.split(/\n+/).map((s) => s.trim()).filter(Boolean));
  }
  const blurb =
    settings.footerAboutBlurb?.trim() ||
    `${settings.schoolName} is committed to a balanced, values-led education that prepares every child for a confident future.`;
  const cmsLogo = strapiMediaUrl(settings.logo?.url ?? null);
  const logoUrl = cmsLogo ?? "/logo.png";

  return (
    <footer className="mt-24 border-t border-cream-200 bg-cream-100">
      <div className="container-page grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoUrl}
              alt={settings.schoolName}
              className="h-14 w-14 rounded-full object-contain"
            />
            <div>
              <div className="font-display text-lg font-medium tracking-tight text-slate-900">{settings.schoolName}</div>
              {settings.tagline ? <div className="text-xs text-slate-500">{settings.tagline}</div> : null}
            </div>
          </div>
          <p className="mt-5 max-w-md text-sm leading-7 text-slate-600">{blurb}</p>
          <div className="mt-6 flex items-center gap-2">
            <SocialDot href={settings.facebookUrl} label="Facebook" glyph="f" />
            <SocialDot href={settings.instagramUrl} label="Instagram" glyph="IG" />
            <SocialDot href={settings.youtubeUrl} label="YouTube" glyph="▶" />
          </div>
        </div>

        <div>
          <h3 className="eyebrow">Explore</h3>
          <ul className="mt-4">
            {exploreLinks.map((item) => (
              <li key={`q-${item.label}-${item.href}`}>
                <FooterLink item={item} />
              </li>
            ))}
          </ul>
          <h3 className="eyebrow mt-8">Policies</h3>
          <ul className="mt-4">
            {POLICY_LINKS.map((item) => (
              <li key={`p-${item.label}-${item.href}`}>
                <FooterLink item={item} />
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="eyebrow">Visit & contact</h3>
          <address className="mt-4 not-italic">
            {addressLines.map((line, i) => (
              <div key={`addr-${i}`} className="text-sm leading-7 text-slate-600">
                {line}
              </div>
            ))}
          </address>
          <div className="mt-4 space-y-1.5 text-sm">
            {phoneHref && settings.contactPhone ? (
              <a href={phoneHref} className="block text-slate-600 hover:text-brand-700">
                {settings.contactPhone}
              </a>
            ) : null}
            {settings.contactEmail ? (
              <a href={`mailto:${settings.contactEmail}`} className="block text-slate-600 hover:text-brand-700">
                {settings.contactEmail}
              </a>
            ) : null}
            {settings.officeHours ? (
              <div className="text-slate-500">{settings.officeHours}</div>
            ) : null}
          </div>
          <Link href="/admissions" className="btn-primary mt-6">
            Apply now
          </Link>
        </div>
      </div>

      <div className="border-t border-cream-200">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-6 text-xs text-slate-500 sm:flex-row">
          <span>© {year} {settings.schoolName}. All rights reserved.</span>
          <span>Built with care for the families of Padhinjarangadi.</span>
        </div>
      </div>
    </footer>
  );
}
