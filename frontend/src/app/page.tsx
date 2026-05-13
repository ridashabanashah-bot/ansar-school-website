import Link from "next/link";
import HomeEffects from "@/components/HomeEffects";
import { getAboutPage, getHomePage, getNews } from "@/lib/content";
import { strapiMediaUrl } from "@/lib/strapi";
import {
  FALLBACK_ABOUT_COLLAGE,
  FALLBACK_CTA_PHOTO,
  FALLBACK_HERO_PHOTOS,
  FALLBACK_NEWS_PHOTOS,
  FALLBACK_PRINCIPAL_PHOTO,
  FALLBACK_PROGRAM_PHOTOS
} from "@/lib/fallbackPhotos";

export const revalidate = 60;

function formatDate(s?: string): string {
  if (!s) return "";
  return new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const QUICK_LINKS = [
  { label: "School profile", href: "/about", num: "i.", img: 0 },
  { label: "Faculty & staff", href: "/staff", num: "ii.", img: 1 },
  { label: "Facilities", href: "/academics", num: "iii.", img: 2 },
  { label: "Co-curriculars", href: "/life", num: "iv.", img: 3 }
];

const WHY_PILLS = [
  {
    icon: "✦",
    iconBg: "#D4E0FF",
    iconColor: "#0437F2",
    title: "Rooted in values",
    body: "Character first, content second. We teach as much through how we behave as through what we say."
  },
  {
    icon: "★",
    iconBg: "#DDE3ED",
    iconColor: "#1B3D6B",
    title: "CBSE excellence",
    body: "The full CBSE curriculum, taught with care and academic rigour by experienced subject specialists."
  },
  {
    icon: "♡",
    iconBg: "#ECF1FF",
    iconColor: "#4570FA",
    title: "Small enough to know you",
    body: "We know our families by name. Concerns get heard. Wins get noticed. Children don't disappear into a number."
  },
  {
    icon: "→",
    iconBg: "#D4E0FF",
    iconColor: "#224C98",
    title: "Future-ready classrooms",
    body: "Smart boards, hands-on labs, a stocked library. Children learn the way they'll work — with the tools they'll meet later."
  }
];

const OFFERINGS = [
  {
    mark: "i.",
    title: "Academic excellence",
    body: "Full CBSE curriculum, Class I through X. Subject specialists, regular assessments, and a calm, structured day."
  },
  {
    mark: "ii.",
    title: "Values & character",
    body: "Daily assemblies, ethics discussions, and a community life that takes manners and integrity as seriously as marks."
  },
  {
    mark: "iii.",
    title: "Modern learning environments",
    body: "Smart classrooms, a stocked library, and hands-on labs. Tools that match how children actually learn today."
  },
  {
    mark: "iv.",
    title: "Co-curriculars & arts",
    body: "Music, drawing, drama, and clubs that meet weekly. Every child finds something that's theirs outside the classroom."
  },
  {
    mark: "v.",
    title: "Sports & physical life",
    body: "Field, court, and PE periods that actually happen. Inter-house tournaments, district-level athletics, daily play."
  },
  {
    mark: "vi.",
    title: "Community & family",
    body: "Open-door office hours, parent-teacher conversations, and a campus that's part of the neighbourhood it sits in."
  }
];

export default async function HomePage() {
  const [home, about, news] = await Promise.all([getHomePage(), getAboutPage(), getNews(6)]);

  const heroSlides = home.heroSlides ?? [];
  const heroImg =
    strapiMediaUrl(heroSlides[0]?.image?.url ?? null) ?? FALLBACK_HERO_PHOTOS[0];
  const float1 =
    strapiMediaUrl(heroSlides[1]?.image?.url ?? null) ?? FALLBACK_HERO_PHOTOS[1];
  const float2 =
    strapiMediaUrl(heroSlides[2]?.image?.url ?? null) ?? FALLBACK_HERO_PHOTOS[2];

  const principalImg =
    strapiMediaUrl(about.principalPhoto?.url ?? null) ?? FALLBACK_PRINCIPAL_PHOTO;
  const principalName = about.principalName ?? "The Principal";
  const principalQuote =
    about.principalMessage ??
    "A school is not its building, or its uniforms, or its results. It's what its children carry with them when they walk out the gate for the last time.";

  const introHeading =
    home.introHeading ?? "Built for the families of Padhinjarangadi, ready for what comes next.";
  const introBody =
    home.introBody ??
    "Ansar School is a private, English-medium, CBSE-affiliated school for Classes I through X. We were founded by educators who believed a good school should grow with its community — not look down on it.";

  const ctaTitle = home.ctaBanner?.title ?? "Ready to give your child the best start?";
  const ctaBody =
    home.ctaBanner?.body ??
    "Schedule a campus visit, request the brochure, or write to the admissions office.";
  const ctaLabel = home.ctaBanner?.buttonLabel ?? "Schedule a campus visit";
  const ctaHref = home.ctaBanner?.buttonHref ?? "/admissions";
  const ctaImgLeft =
    strapiMediaUrl(home.ctaBanner?.image?.url ?? null) ??
    FALLBACK_ABOUT_COLLAGE[0] ??
    FALLBACK_CTA_PHOTO;
  const ctaImgRight = FALLBACK_PROGRAM_PHOTOS[0];

  const whyPills =
    home.whyUs && home.whyUs.length >= 4
      ? home.whyUs.slice(0, 4).map((h, i) => ({
          ...WHY_PILLS[i],
          title: h.title || WHY_PILLS[i].title,
          body: h.body || WHY_PILLS[i].body
        }))
      : WHY_PILLS;

  const quickImgs = [
    FALLBACK_PROGRAM_PHOTOS[0],
    FALLBACK_HERO_PHOTOS[1],
    FALLBACK_HERO_PHOTOS[3],
    FALLBACK_HERO_PHOTOS[2]
  ];

  return (
    <>
      <HomeEffects />

      <div className="hp-edge-rail hp-edge-rail-left" aria-hidden>
        Ansar School · Padhinjarangadi · Kerala
      </div>
      <div className="hp-edge-rail hp-edge-rail-right" aria-hidden>
        CBSE · Class I to X · A school in motion
      </div>

      {/* HERO */}
      <section className="hp-hero">
        <div className="hp-aurora" aria-hidden>
          <span /><span /><span /><span /><span />
        </div>
        <div className="hp-aurora-third" aria-hidden />
        <div className="hp-orbital hp-orbital-tl" aria-hidden />
        <div className="hp-orbital hp-orbital-br" aria-hidden />
        <div className="hp-hero-floats" aria-hidden>
          <div className="hp-hf hp-hf-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={float1} alt="" />
          </div>
          <div className="hp-hf hp-hf-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={float2} alt="" />
          </div>
        </div>
        <div className="hp-hero-card hp-grain">
          <div className="hp-hero-img" style={{ backgroundImage: `url('${heroImg}')` }} />
          <div className="hp-hero-grid" />
          <div className="hp-hero-overlay" />
          <div className="hp-hero-content">
            <div className="hp-hero-bottom">
              <h1 className="hp-hero-headline">
                {home.heroTitle ? (
                  home.heroTitle
                ) : (
                  <>
                    A school for the <em>next generation</em> of Padhinjarangadi.
                  </>
                )}
              </h1>
              <div className="hp-hero-cta">
                <p className="hp-hero-tagline">
                  {home.heroSubtitle ??
                    "Values-led learning, classroom-tested teaching, and a campus designed for the children who will shape what's next."}
                </p>
                <Link href="/admissions" className="hp-hero-pill">
                  View admissions
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="hp-marquee" aria-hidden>
        <div className="hp-marquee-track">
          {Array.from({ length: 2 }).map((_, n) => (
            <span key={n}>
              <span>CBSE Affiliated</span>
              <span>English Medium</span>
              <span>Class I — X</span>
              <span>Padhinjarangadi · Kerala</span>
              <span>Values-led teaching</span>
              <span>Established for decades</span>
            </span>
          ))}
        </div>
      </div>

      {/* About + principal */}
      <section className="hp-section" id="about">
        <div className="hp-container">
          <div className="hp-about-row">
            <div className="hp-reveal">
              <span className="eyebrow">About Ansar</span>
              <h2 className="hp-headline" style={{ margin: "1.5rem 0 2rem" }}>
                {home.introHeading ? (
                  introHeading
                ) : (
                  <>
                    Built for the families of Padhinjarangadi, ready for{" "}
                    <span className="h-accent">what comes next.</span>
                  </>
                )}
              </h2>
              <div className="hp-about-body">
                {introBody.split(/\n{2,}/).map((p, i) => (
                  <p key={i}>{p.trim()}</p>
                ))}
              </div>
            </div>

            <aside className="hp-principal hp-reveal">
              <div className="hp-seal-orbit" aria-hidden />
              <div className="hp-seal" aria-hidden>
                <div className="hp-seal-inner">
                  ANSAR
                  <br />
                  SCHOOL
                </div>
              </div>
              <div className="hp-principal-photo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={principalImg} alt={principalName} />
              </div>
              <p className="hp-principal-quote">{principalQuote}</p>
              <div className="hp-principal-meta">
                <div>
                  <div className="hp-principal-name">{principalName}</div>
                  <div className="hp-principal-role">Ansar School · Padhinjarangadi</div>
                </div>
                <span className="hp-principal-sig">— Ansar</span>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Quick explore */}
      <section className="hp-section" style={{ paddingTop: 0 }}>
        <div className="hp-container">
          <div className="hp-reveal">
            <span className="eyebrow">Explore</span>
            <h2 className="hp-headline" style={{ margin: "1rem 0 0" }}>
              Find what you came for.
            </h2>
          </div>
          <div className="hp-quick-grid">
            {QUICK_LINKS.map((q, i) => (
              <Link key={q.href} href={q.href} className="hp-quick-card hp-reveal">
                <span className="hp-quick-num">{q.num}</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={quickImgs[i]} alt="" />
                <div className="hp-quick-label">
                  <h3>{q.label}</h3>
                  <span className="hp-quick-arrow">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Ansar */}
      <section className="hp-section hp-why" id="academics">
        <div className="hp-container">
          <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto", position: "relative", zIndex: 2 }}>
            <span className="eyebrow hp-reveal">Why Ansar</span>
            <h2 className="hp-headline hp-reveal" style={{ marginTop: "1rem" }}>
              A balanced approach to <span className="h-accent">a child&apos;s first decade</span> of school.
            </h2>
          </div>

          <div className="hp-why-center">
            <div className="hp-pill hp-p1 hp-reveal">
              <span
                className="hp-pill-icon"
                style={{ background: whyPills[0].iconBg, color: whyPills[0].iconColor }}
              >
                {whyPills[0].icon}
              </span>
              <div>
                <h4>{whyPills[0].title}</h4>
                <p>{whyPills[0].body}</p>
              </div>
            </div>
            <div className="hp-pill hp-p2 hp-reveal">
              <span
                className="hp-pill-icon"
                style={{ background: whyPills[1].iconBg, color: whyPills[1].iconColor }}
              >
                {whyPills[1].icon}
              </span>
              <div>
                <h4>{whyPills[1].title}</h4>
                <p>{whyPills[1].body}</p>
              </div>
            </div>
            <div className="hp-why-photo hp-reveal">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={FALLBACK_HERO_PHOTOS[0]} alt="" />
            </div>
            <div className="hp-pill hp-p3 hp-reveal">
              <span
                className="hp-pill-icon"
                style={{ background: whyPills[2].iconBg, color: whyPills[2].iconColor }}
              >
                {whyPills[2].icon}
              </span>
              <div>
                <h4>{whyPills[2].title}</h4>
                <p>{whyPills[2].body}</p>
              </div>
            </div>
            <div className="hp-pill hp-p4 hp-reveal">
              <span
                className="hp-pill-icon"
                style={{ background: whyPills[3].iconBg, color: whyPills[3].iconColor }}
              >
                {whyPills[3].icon}
              </span>
              <div>
                <h4>{whyPills[3].title}</h4>
                <p>{whyPills[3].body}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Numbered offerings */}
      <section className="hp-section" style={{ background: "#FFFFFF" }}>
        <div className="hp-container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "4rem",
              alignItems: "end",
              marginBottom: "4rem"
            }}
            className="hp-offer-header"
          >
            <div className="hp-reveal">
              <span className="eyebrow">What we offer</span>
              <h2 className="hp-headline" style={{ marginTop: "1.5rem" }}>
                Things <span className="h-accent">we take seriously</span> at Ansar.
              </h2>
            </div>
            <p
              className="hp-reveal"
              style={{ fontSize: 14, lineHeight: 1.7, color: "#4A5563" }}
            >
              Beyond the timetable, these are the threads that run through how we run a school. Hover any item to read more.
            </p>
          </div>
          <ol className="hp-offer-list">
            {OFFERINGS.map((o) => (
              <li key={o.mark} className="hp-offer-item hp-reveal">
                <div className="hp-offer-mark">{o.mark}</div>
                <div className="hp-offer-content">
                  <h3>{o.title}</h3>
                  <p>{o.body}</p>
                </div>
                <div className="hp-offer-arrow">→</div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Bento grid */}
      <section className="hp-section hp-bento">
        <div className="hp-container">
          <div className="hp-reveal" style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 4rem", position: "relative", zIndex: 2 }}>
            <span className="eyebrow">A day at Ansar</span>
            <h2 className="hp-headline" style={{ marginTop: "1rem" }}>
              Small <span className="h-accent">moments,</span> stitched together.
            </h2>
          </div>

          <div className="hp-bento-grid">
            <div className="hp-bento-tile hp-bento-img hp-b-1 hp-reveal">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={FALLBACK_HERO_PHOTOS[0]} alt="" />
              <div className="hp-bento-label">
                <small>Morning</small>
                Mornings begin in the courtyard.
              </div>
            </div>

            <div className="hp-bento-tile hp-bento-quote hp-b-2 hp-reveal">
              <blockquote>The bell hasn&apos;t rung. Already, the corridors know what to do.</blockquote>
              <cite>The school, every morning</cite>
            </div>

            <div className="hp-bento-tile hp-bento-img hp-b-3 hp-reveal">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={FALLBACK_PROGRAM_PHOTOS[0]} alt="" />
              <div className="hp-bento-label">
                <small>Library wing</small>
                The quiet half.
              </div>
            </div>

            <div className="hp-bento-tile hp-bento-card hp-b-4 hp-reveal">
              <span className="eyebrow">A campus designed for learning</span>
              <h3 style={{ marginTop: "1rem" }}>
                Smart classrooms, hands-on labs, and a library that stays open through lunch.
              </h3>
              <p>
                Learning environments built to match how children actually learn today — not how textbooks said they should.
              </p>
            </div>

            <div className="hp-bento-tile hp-bento-ornament hp-b-5 hp-reveal" aria-hidden>
              <svg viewBox="0 0 100 100">
                <circle className="crest-ring" cx="50" cy="50" r="44" />
                <circle cx="50" cy="50" r="32" fill="#0437F2" />
                <text
                  x="50"
                  y="45"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontFamily="Fraunces"
                  fontSize="10"
                  fontWeight={500}
                  fontStyle="italic"
                >
                  Ansar
                </text>
                <text
                  x="50"
                  y="58"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontFamily="Fraunces"
                  fontSize="6"
                  letterSpacing="1.5"
                >
                  SCHOOL
                </text>
              </svg>
            </div>

            <div className="hp-bento-tile hp-bento-meta hp-b-6 hp-reveal">
              <span className="key">Coordinates</span>
              <span className="value">Padhinjarangadi, Kerala — south-west monsoon air, year-round.</span>
            </div>

            <div className="hp-bento-tile hp-bento-img hp-b-7 hp-reveal">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={FALLBACK_HERO_PHOTOS[3]} alt="" />
              <div className="hp-bento-label">
                <small>Afternoons</small>
                The field. The court. The corridor that smells like rain.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest happenings */}
      {news.length > 0 ? (
        <section className="hp-section hp-latest" id="latest">
          <div className="hp-container">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "end",
                marginBottom: "3rem",
                flexWrap: "wrap",
                gap: "1.5rem"
              }}
            >
              <div className="hp-reveal">
                <span className="eyebrow">Recent</span>
                <h2 className="hp-headline" style={{ margin: "1rem 0 0" }}>
                  Latest <span className="h-accent">happenings.</span>
                </h2>
              </div>
              <Link
                href="/news"
                className="hp-reveal"
                style={{
                  color: "#0437F2",
                  fontSize: 13,
                  fontWeight: 500,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8
                }}
              >
                View all news →
              </Link>
            </div>

            <div className="hp-latest-grid">
              {news.slice(0, 6).map((n, i) => {
                const cover =
                  strapiMediaUrl(n.coverImage?.url ?? null) ??
                  FALLBACK_NEWS_PHOTOS[i % FALLBACK_NEWS_PHOTOS.length];
                return (
                  <Link key={n.id} href={`/news/${n.slug}`} className="hp-latest-tile hp-reveal">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cover} alt={n.title} />
                    <div className="hp-latest-overlay">
                      <span className="hp-latest-tag">News</span>
                      <div className="hp-latest-title">{n.title}</div>
                      {n.publishedDate ? (
                        <div className="hp-latest-meta">{formatDate(n.publishedDate)}</div>
                      ) : null}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {/* CTA card */}
      <section className="hp-cta-section" id="admissions">
        <div className="hp-cta-card hp-reveal">
          <div className="hp-cta-img">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ctaImgLeft} alt="" />
          </div>
          <div className="hp-cta-content">
            <span className="hp-cta-tag">Admissions open</span>
            <h2>
              {ctaTitle.split(/\?/)[0]}
              {ctaTitle.includes("?") ? <span className="h-accent"> the best start?</span> : null}
            </h2>
            <p>{ctaBody}</p>
            <Link href={ctaHref} className="hp-cta-btn">
              {ctaLabel}
            </Link>
          </div>
          <div className="hp-cta-img">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ctaImgRight} alt="" />
          </div>
        </div>
      </section>
    </>
  );
}
