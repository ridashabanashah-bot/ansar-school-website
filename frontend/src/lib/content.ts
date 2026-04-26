// Content fetchers — call Strapi, fall back to placeholder content if Strapi is unreachable.

import { fetchFromStrapi } from "./strapi";
import {
  fallbackAbout,
  fallbackAcademics,
  fallbackAdmissions,
  fallbackDocuments,
  fallbackEvents,
  fallbackGallery,
  fallbackHome,
  fallbackNews,
  fallbackPages,
  fallbackSiteSettings,
  fallbackStaff
} from "./fallback";
import type {
  AboutPage,
  AcademicsPage,
  AdmissionsPage,
  DocumentEntry,
  EventItem,
  GalleryItem,
  HomePage,
  NewsArticle,
  PageEntry,
  SiteSettings,
  StaffMember
} from "./types";

export async function getSiteSettings(): Promise<SiteSettings> {
  const data = await fetchFromStrapi<SiteSettings>("site-setting", { populate: "*" });
  return data ?? fallbackSiteSettings;
}

export async function getHomePage(): Promise<HomePage> {
  const data = await fetchFromStrapi<HomePage>("home-page", { populate: "*" });
  if (!data) return fallbackHome;
  // Merge: Strapi-supplied scalars win; arrays/components fall back when empty
  // so the rendered page never has missing sections during the editorial
  // bring-up window.
  return {
    ...fallbackHome,
    ...data,
    heroSlides: data.heroSlides && data.heroSlides.length > 0 ? data.heroSlides : fallbackHome.heroSlides,
    stats: data.stats && data.stats.length > 0 ? data.stats : fallbackHome.stats,
    whyUs: data.whyUs && data.whyUs.length > 0 ? data.whyUs : fallbackHome.whyUs,
    testimonials: data.testimonials && data.testimonials.length > 0 ? data.testimonials : fallbackHome.testimonials,
    ctaBanner: data.ctaBanner ?? fallbackHome.ctaBanner,
    programsHeading: data.programsHeading ?? fallbackHome.programsHeading,
    programsBody: data.programsBody ?? fallbackHome.programsBody
  };
}

export async function getAboutPage(): Promise<AboutPage> {
  const data = await fetchFromStrapi<AboutPage>("about-page", { populate: "*" });
  if (!data) return fallbackAbout;
  return {
    ...fallbackAbout,
    ...data,
    vision: (data.vision && data.vision.trim()) || fallbackAbout.vision,
    mission: (data.mission && data.mission.trim()) || fallbackAbout.mission,
    history: (data.history && data.history.trim()) || fallbackAbout.history,
    principalMessage: (data.principalMessage && data.principalMessage.trim()) || fallbackAbout.principalMessage,
    principalName: data.principalName || fallbackAbout.principalName
  };
}

export async function getAcademicsPage(): Promise<AcademicsPage> {
  const data = await fetchFromStrapi<AcademicsPage>("academics-page", { populate: "*" });
  if (!data) return fallbackAcademics;
  return {
    ...fallbackAcademics,
    ...data,
    programs: data.programs && data.programs.length > 0 ? data.programs : fallbackAcademics.programs,
    facilities: data.facilities && data.facilities.length > 0 ? data.facilities : fallbackAcademics.facilities
  };
}

export async function getAdmissionsPage(): Promise<AdmissionsPage> {
  const data = await fetchFromStrapi<AdmissionsPage>("admissions-page", { populate: "*" });
  if (!data) return fallbackAdmissions;
  return {
    ...fallbackAdmissions,
    ...data,
    process: data.process && data.process.length > 0 ? data.process : fallbackAdmissions.process,
    documentsRequired: data.documentsRequired && data.documentsRequired.length > 0 ? data.documentsRequired : fallbackAdmissions.documentsRequired
  };
}

export async function getNews(limit = 12): Promise<NewsArticle[]> {
  const data = await fetchFromStrapi<NewsArticle[]>("news-articles", {
    "sort[0]": "publishedDate:desc",
    "pagination[pageSize]": limit,
    populate: "*"
  });
  return data ?? fallbackNews;
}

export async function getNewsBySlug(slug: string): Promise<NewsArticle | null> {
  const data = await fetchFromStrapi<NewsArticle[]>("news-articles", {
    "filters[slug][$eq]": slug,
    populate: "*"
  });
  if (data && data.length > 0) return data[0];
  return fallbackNews.find((n) => n.slug === slug) ?? null;
}

export async function getEvents(): Promise<EventItem[]> {
  const data = await fetchFromStrapi<EventItem[]>("events", {
    "sort[0]": "startDate:asc",
    "pagination[pageSize]": 20
  });
  return data ?? fallbackEvents;
}

export async function getGallery(): Promise<GalleryItem[]> {
  const data = await fetchFromStrapi<GalleryItem[]>("gallery-items", {
    "pagination[pageSize]": 60,
    populate: "*"
  });
  return data ?? fallbackGallery;
}

export async function getStaff(): Promise<StaffMember[]> {
  const data = await fetchFromStrapi<StaffMember[]>("staff-members", {
    "sort[0]": "order:asc",
    "pagination[pageSize]": 60,
    populate: "*"
  });
  return data ?? fallbackStaff;
}

export async function getPages(section?: string): Promise<PageEntry[]> {
  const params: Record<string, string | number> = {
    populate: "*",
    "sort[0]": "order:asc",
    "pagination[pageSize]": 200
  };
  if (section) params["filters[section][$eq]"] = section;
  const data = await fetchFromStrapi<PageEntry[]>("pages", params);
  return data ?? fallbackPages;
}

export async function getPageBySlug(slug: string): Promise<PageEntry | null> {
  const data = await fetchFromStrapi<PageEntry[]>("pages", {
    "filters[slug][$eq]": slug,
    populate: "*"
  });
  if (data && data.length > 0) return data[0];
  return fallbackPages.find((p) => p.slug === slug) ?? null;
}

export async function getDocuments(category?: string): Promise<DocumentEntry[]> {
  const params: Record<string, string | number> = {
    populate: "*",
    "sort[0]": "sortOrder:asc",
    "pagination[pageSize]": 200
  };
  if (category) params["filters[category][$eq]"] = category;
  const data = await fetchFromStrapi<DocumentEntry[]>("documents", params);
  return data ?? fallbackDocuments;
}

export async function getDocumentBySlug(slug: string): Promise<DocumentEntry | null> {
  const data = await fetchFromStrapi<DocumentEntry[]>("documents", {
    "filters[slug][$eq]": slug,
    populate: "*"
  });
  if (data && data.length > 0) return data[0];
  return fallbackDocuments.find((d) => d.slug === slug) ?? null;
}
