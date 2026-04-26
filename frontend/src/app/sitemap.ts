import type { MetadataRoute } from "next";
import { getDocuments, getNews, getPages } from "@/lib/content";
import { pagePath } from "@/lib/sections";

const STATIC_ROUTES = [
  "/",
  "/about",
  "/academics",
  "/admissions",
  "/contact",
  "/gallery",
  "/staff",
  "/news",
  "/documents",
  "/policies",
  "/info"
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://ansarschoolpdi.in").replace(/\/+$/, "");
  const now = new Date();

  const [pages, docs, news] = await Promise.all([getPages(), getDocuments(), getNews(100)]);

  const out: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${base}${route}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: route === "/" ? 1 : 0.7
  }));

  for (const p of pages) {
    out.push({
      url: `${base}${pagePath(p.section, p.slug)}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5
    });
  }
  for (const d of docs) {
    out.push({
      url: `${base}/documents/${d.slug}`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3
    });
  }
  for (const n of news) {
    out.push({
      url: `${base}/news/${n.slug}`,
      lastModified: n.publishedDate ? new Date(n.publishedDate) : now,
      changeFrequency: "monthly",
      priority: 0.6
    });
  }

  return out;
}
