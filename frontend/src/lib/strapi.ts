/**
 * Tiny Strapi 5 REST client.
 * Strapi 5 returns flat data (no `attributes` wrapper as in v4).
 */

const BASE_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const TOKEN = process.env.STRAPI_API_TOKEN;

type Query = Record<string, string | number | boolean | undefined>;

function buildQuery(params?: Query): string {
  if (!params) return "";
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") search.set(k, String(v));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchFromStrapi<T>(
  path: string,
  params?: Query,
  opts: { revalidate?: number } = {}
): Promise<T | null> {
  const url = `${BASE_URL}/api/${path.replace(/^\//, "")}${buildQuery(params)}`;
  try {
    const res = await fetch(url, {
      headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {},
      next: { revalidate: opts.revalidate ?? 60 }
    });
    if (!res.ok) {
      console.warn(`Strapi fetch failed: ${url} → ${res.status}`);
      return null;
    }
    const json = (await res.json()) as { data: T };
    return json.data;
  } catch (err) {
    console.warn(`Strapi fetch error: ${url}`, err);
    return null;
  }
}

/** Resolve an upload's URL (Strapi may return absolute or relative). */
export function strapiMediaUrl(url?: string | null): string | null {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${BASE_URL}${url}`;
}
