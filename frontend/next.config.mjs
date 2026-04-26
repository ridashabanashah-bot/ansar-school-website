/** @type {import('next').NextConfig} */
const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const { hostname } = new URL(strapiUrl);

const LEGACY_REDIRECTS = [
  { from: "/index.php", to: "/" },
  { from: "/about.php", to: "/about" },
  { from: "/admission.php", to: "/admissions" },
  { from: "/facilities.php", to: "/academics" },
  { from: "/academics.php", to: "/academics" },
  { from: "/examination.php", to: "/academics/examination" },
  { from: "/attendance.php", to: "/academics/attendance" },
  { from: "/classwise-strength.php", to: "/academics/classwise-strength" },
  { from: "/teaching-staff.php", to: "/academics/teaching-staff" },
  { from: "/transfer_certificate.php", to: "/academics/transfer_certificate" },
  { from: "/school-days-hours.php", to: "/academics/school-days-hours" },
  { from: "/school-timing.php", to: "/academics/school-timing" },
  { from: "/working-hours.php", to: "/academics/working-hours" },
  { from: "/career.php", to: "/info/career" },
  { from: "/news-and-events.php", to: "/news" },
  { from: "/gallery.php", to: "/gallery" },
  { from: "/contact.php", to: "/contact" },
  { from: "/about-us.php", to: "/about" },
  { from: "/principles-desk.php", to: "/about" },
  { from: "/vision-mission.php", to: "/about/vision-mission" },
  { from: "/our-campus.php", to: "/about/our-campus" },
  { from: "/activities.php", to: "/facilities/activities" },
  { from: "/curricular-activities.php", to: "/facilities/curricular-activities" },
  { from: "/privacy_policy.php", to: "/policies/privacy_policy" },
  { from: "/terms_and_condition.php", to: "/policies/terms_and_condition" },
  { from: "/refund_policy.php", to: "/policies/refund_policy" },
  { from: "/cancellation_policy.php", to: "/policies/cancellation_policy" }
];

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname },
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "**.strapiapp.com" },
      { protocol: "https", hostname: "**.media.strapiapp.com" }
    ]
  },
  async redirects() {
    return LEGACY_REDIRECTS.map((r) => ({ source: r.from, destination: r.to, permanent: true }));
  }
};

export default nextConfig;
