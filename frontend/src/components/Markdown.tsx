/**
 * Server component that renders user-authored Markdown (or HTML) safely.
 *
 * - markdown source: parsed by `marked` (GFM, line breaks)
 * - html source:    used as-is (e.g. legacy rawHtml from migrated pages)
 * - everything is then run through `sanitize-html` with a strict allowlist
 *   so nothing from the CMS can inject scripts, on* handlers, or hostile URLs.
 */

import { marked } from "marked";
import sanitizeHtml from "sanitize-html";

interface MarkdownProps {
  source: string;
  /** "markdown" (default) parses with marked first; "html" trusts the input shape but still sanitizes. */
  mode?: "markdown" | "html";
  className?: string;
}

const ALLOWED_TAGS = [
  "p", "br", "hr",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li",
  "blockquote", "pre", "code",
  "strong", "em", "b", "i", "u", "s",
  "a", "img", "figure", "figcaption",
  "table", "thead", "tbody", "tr", "th", "td",
  "div", "span", "section", "article"
];

const ALLOWED_ATTRIBUTES: sanitizeHtml.IOptions["allowedAttributes"] = {
  a: ["href", "title", "target", "rel"],
  img: ["src", "srcset", "sizes", "alt", "title", "width", "height", "loading"],
  th: ["colspan", "rowspan", "scope"],
  td: ["colspan", "rowspan"],
  code: ["class"],
  pre: ["class"],
  div: ["class"],
  span: ["class"]
};

const SANITIZE_OPTS: sanitizeHtml.IOptions = {
  allowedTags: ALLOWED_TAGS,
  allowedAttributes: ALLOWED_ATTRIBUTES,
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: { img: ["http", "https", "data"] },
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: {
        ...attribs,
        rel: "noopener noreferrer",
        target: attribs.target ?? "_self"
      }
    })
  }
};

export default function Markdown({ source, mode = "markdown", className }: MarkdownProps) {
  if (!source) return null;
  const html = mode === "markdown"
    ? (marked.parse(source, { async: false, breaks: true, gfm: true }) as string)
    : source;
  const cleaned = sanitizeHtml(html, SANITIZE_OPTS);
  return (
    <div
      className={className ?? "prose-school"}
      dangerouslySetInnerHTML={{ __html: cleaned }}
    />
  );
}
