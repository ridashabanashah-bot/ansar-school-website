export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left"
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}) {
  const alignment = align === "center" ? "text-center mx-auto" : "text-left";
  return (
    <div className={`max-w-3xl ${alignment}`}>
      {eyebrow ? (
        <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">{eyebrow}</div>
      ) : null}
      <h2 className="font-display text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
        {title}
      </h2>
      {subtitle ? <p className="mt-3 text-base leading-7 text-slate-600">{subtitle}</p> : null}
    </div>
  );
}
