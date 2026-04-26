import Link from "next/link";
import type { NavItem, SiteSettings } from "@/lib/types";

const FALLBACK_FOOTER_NAV: NavItem[] = [
  { label: "About", href: "/about" },
  { label: "Academics", href: "/academics" },
  { label: "Admissions", href: "/admissions" },
  { label: "News & events", href: "/news" },
  { label: "Gallery", href: "/gallery" },
  { label: "Documents", href: "/documents" },
  { label: "Contact", href: "/contact" }
];

const SCHOOL_LINKS: NavItem[] = [
  { label: "Vision & mission", href: "/about/vision-mission" },
  { label: "Principal's desk", href: "/about" },
  { label: "Our campus", href: "/about/our-campus" },
  { label: "Facilities", href: "/academics" },
  { label: "Activities", href: "/info" }
];

const POLICY_LINKS: NavItem[] = [
  { label: "Privacy policy", href: "/policies/privacy_policy" },
  { label: "Terms & conditions", href: "/policies/terms_and_condition" },
  { label: "Refund policy", href: "/policies/refund_policy" },
  { label: "Cancellation policy", href: "/policies/cancellation_policy" }
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
  const cls = "block py-1 text-sm text-slate-300 transition hover:text-white";
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
      className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white transition hover:bg-accent-500"
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

  return (
    <footer className="mt-16 bg-brand-950 text-slate-300">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <span aria-hidden className="grid h-12 w-12 place-items-center rounded-full bg-brand-700 font-bold text-white shadow-prominent">
              A
            </span>
            <div>
              <div className="font-display text-lg font-semibold text-white">{settings.schoolName}</div>
              {settings.tagline ? <div className="text-xs text-slate-400">{settings.tagline}</div> : null}
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-400">{blurb}</p>
          <div className="mt-5 flex items-center gap-2">
            <SocialDot href={settings.facebookUrl} label="Facebook" glyph="f" />
            <SocialDot href={settings.instagramUrl} label="Instagram" glyph="IG" />
            <SocialDot href={settings.youtubeUrl} label="YouTube" glyph="▶" />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Quick links</h3>
          <ul className="mt-4">
            {exploreLinks.map((item) => (
              <li key={`q-${item.label}-${item.href}`}>
                <FooterLink item={item} />
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Our school</h3>
          <ul className="mt-4">
            {SCHOOL_LINKS.map((item) => (
              <li key={`s-${item.label}-${item.href}`}>
                <FooterLink item={item} />
              </li>
            ))}
          </ul>
          <h3 className="mt-6 text-sm font-semibold uppercase tracking-wider text-white">Policies</h3>
          <ul className="mt-4">
            {POLICY_LINKS.map((item) => (
              <li key={`p-${item.label}-${item.href}`}>
                <FooterLink item={item} />
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Visit & contact</h3>
          <address className="mt-4 not-italic">
            {addressLines.map((line, i) => (
              <div key={`addr-${i}`} className="text-sm leading-6 text-slate-300">
                {line}
              </div>
            ))}
          </address>
          <div className="mt-4 space-y-1.5 text-sm">
            {phoneHref && settings.contactPhone ? (
              <a href={phoneHref} className="block text-slate-300 hover:text-white">
                <span aria-hidden className="mr-2">📞</span>
                {settings.contactPhone}
              </a>
            ) : null}
            {settings.contactEmail ? (
              <a href={`mailto:${settings.contactEmail}`} className="block text-slate-300 hover:text-white">
                <span aria-hidden className="mr-2">✉</span>
                {settings.contactEmail}
              </a>
            ) : null}
            {settings.officeHours ? (
              <div className="text-slate-400">
                <span aria-hidden className="mr-2">🕒</span>
                {settings.officeHours}
              </div>
            ) : null}
          </div>
          <Link
            href="/admissions"
            className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-accent-500 px-5 py-2.5 text-sm font-semibold text-white shadow-prominent ring-1 ring-accent-600/30 transition hover:bg-accent-600"
          >
            Apply now →
          </Link>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-slate-400 sm:flex-row">
          <span>© {year} {settings.schoolName}. All rights reserved.</span>
          <span>Built with care for the families of Padhinjarangadi.</span>
        </div>
      </div>
    </footer>
  );
}
