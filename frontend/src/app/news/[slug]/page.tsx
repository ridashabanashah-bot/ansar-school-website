import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "@/components/Markdown";
import { getNewsBySlug } from "@/lib/content";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const article = await getNewsBySlug(params.slug);
  if (!article) return { title: "Not found" };
  return { title: article.title, description: article.excerpt ?? undefined };
}

export default async function NewsArticlePage({ params }: { params: { slug: string } }) {
  const article = await getNewsBySlug(params.slug);
  if (!article) notFound();

  return (
    <article className="container-page py-12 lg:py-16">
      <Link href="/news" className="text-sm font-semibold text-brand-700 hover:underline">
        ← Back to news
      </Link>
      <header className="mt-6">
        <time className="text-xs uppercase tracking-wider text-slate-500">
          {article.publishedDate
            ? new Date(article.publishedDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
            : ""}
        </time>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
          {article.title}
        </h1>
        {article.excerpt ? <p className="mt-4 max-w-2xl text-lg text-slate-600">{article.excerpt}</p> : null}
      </header>
      {article.body ? (
        <div className="mt-10 max-w-3xl">
          <Markdown source={article.body} mode="markdown" />
        </div>
      ) : (
        <div className="prose-school mt-10 max-w-3xl text-slate-600">
          <p>Full article content will be added here through the CMS.</p>
        </div>
      )}
    </article>
  );
}
