import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-page grid place-items-center py-24 text-center">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">404</div>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-slate-900">Page not found</h1>
        <p className="mt-3 text-slate-600">The page you’re looking for doesn’t exist or has moved.</p>
        <Link href="/" className="btn-primary mt-6">
          Back to home
        </Link>
      </div>
    </section>
  );
}
