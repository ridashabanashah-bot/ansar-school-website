// Map between the Strapi `section` enum (singular) and URL path segments
// used in the (content)/[section]/[slug] dynamic route.

import type { PageSection } from "./types";

export const SECTION_TO_SEGMENT: Record<PageSection, string> = {
  about: "about",
  academics: "academics",
  admissions: "admissions",
  facilities: "facilities",
  policy: "policies",
  info: "info",
  other: "pages"
};

export const SECTION_LABEL: Record<PageSection, string> = {
  about: "About",
  academics: "Academics",
  admissions: "Admissions",
  facilities: "Facilities",
  policy: "Policies",
  info: "Information",
  other: "Pages"
};

const SEGMENT_TO_SECTION: Record<string, PageSection> = Object.fromEntries(
  (Object.entries(SECTION_TO_SEGMENT) as [PageSection, string][]).map(([k, v]) => [v, k])
);

export function segmentToSection(segment: string): PageSection | null {
  const v = SEGMENT_TO_SECTION[segment];
  return v ?? null;
}

export function sectionToSegment(section: PageSection): string {
  return SECTION_TO_SEGMENT[section];
}

export function pagePath(section: PageSection, slug: string): string {
  return `/${sectionToSegment(section)}/${slug}`;
}
