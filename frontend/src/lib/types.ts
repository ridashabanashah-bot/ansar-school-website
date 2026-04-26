// TypeScript types for Strapi content. Keep these in sync with cms/src/api/*/content-types/*/schema.json.

export interface StrapiImage {
  url: string;
  alternativeText?: string | null;
  width?: number;
  height?: number;
}

export interface StrapiFile {
  url: string;
  name: string;
  ext?: string;
  mime?: string;
  size?: number;
  alternativeText?: string | null;
}

export interface SeoMeta {
  metaTitle?: string;
  metaDescription?: string;
  shareImage?: StrapiImage | null;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export interface SiteSettings {
  schoolName: string;
  tagline?: string;
  logo?: StrapiImage | null;
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  mapEmbedUrl?: string;
  navigation?: NavItem[];
  footerNavigation?: NavItem[];
}

export interface HomePage {
  heroTitle: string;
  heroSubtitle?: string;
  heroImage?: StrapiImage | null;
  introHeading?: string;
  introBody?: string;
  highlights?: { title: string; body: string; icon?: string }[];
  ctaTitle?: string;
  ctaBody?: string;
  ctaButtonLabel?: string;
  ctaButtonHref?: string;
  seo?: SeoMeta;
}

export interface AboutPage {
  title: string;
  vision?: string;
  mission?: string;
  history?: string;
  principalName?: string;
  principalMessage?: string;
  principalPhoto?: StrapiImage | null;
  seo?: SeoMeta;
}

export interface AcademicsPage {
  title: string;
  intro?: string;
  programs?: { name: string; description: string; classes?: string }[];
  facilities?: { name: string; description: string }[];
  seo?: SeoMeta;
}

export interface AdmissionsPage {
  title: string;
  intro?: string;
  process?: { step: number; title: string; description: string }[];
  feeNote?: string;
  documentsRequired?: string[];
  ageEligibility?: string;
  applicationFormUrl?: string;
  seo?: SeoMeta;
}

export interface NewsArticle {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  excerpt?: string;
  body?: string;
  publishedDate?: string;
  coverImage?: StrapiImage | null;
}

export interface EventItem {
  id: number;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location?: string;
}

export interface GalleryItem {
  id: number;
  title?: string;
  caption?: string;
  category?: string;
  image: StrapiImage;
}

export interface StaffMember {
  id: number;
  name: string;
  role: string;
  bio?: string;
  email?: string;
  photo?: StrapiImage | null;
  order?: number;
}

export type PageSection =
  | "about"
  | "academics"
  | "admissions"
  | "facilities"
  | "policy"
  | "info"
  | "other";

export interface PageEntry {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  section: PageSection;
  body?: string;
  rawHtml?: string;
  heroImage?: StrapiImage | null;
  attachments?: StrapiFile[];
  sourceUrl?: string;
  order?: number;
  seo?: SeoMeta;
}

export type DocumentCategory =
  | "certificate"
  | "policy"
  | "fees"
  | "calendar"
  | "sample-tc"
  | "other";

export interface DocumentEntry {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  category: DocumentCategory;
  file: StrapiFile;
  description?: string;
  issuedDate?: string;
  sortOrder?: number;
}
