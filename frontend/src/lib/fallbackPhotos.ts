// Local-first photo URLs used when the CMS hasn't been populated with media yet.
// These resolve to files we shipped under frontend/public/photos/.

export const FALLBACK_HERO_PHOTOS = [
  "/photos/hero/02-our-campus.jpg",
  "/photos/hero/03-academics.jpg",
  "/photos/hero/04-admission.jpg",
  "/photos/hero/05-facilities.jpg",
  "/photos/hero/06-presentation.jpg"
];

export const FALLBACK_ABOUT_COLLAGE = [
  "/photos/hero/02-our-campus.jpg",
  "/photos/hero/03-academics.jpg",
  "/photos/facilities/library.webp"
];

export const FALLBACK_PROGRAM_PHOTOS = [
  "/photos/hero/03-academics.jpg",
  "/photos/facilities/coding-lab.jpg",
  "/photos/facilities/composite-lab.jpg"
];

export const FALLBACK_FACILITY_PHOTOS: Record<string, string> = {
  Library: "/photos/facilities/library.webp",
  "Science labs": "/photos/facilities/composite-lab.jpg",
  "Computer lab": "/photos/facilities/coding-lab.jpg",
  Playground: "/photos/facilities/kidspark.webp",
  "Swimming pool": "/photos/facilities/swimming-pool.jpg",
  Auditorium: "/photos/facilities/open-auditorium.jpg",
  "Conference hall": "/photos/facilities/conference-hall.jpg",
  Counselling: "/photos/facilities/counselling.jpeg"
};

export const FALLBACK_NEWS_PHOTOS = [
  "/photos/events/news-1.webp",
  "/photos/events/news-2.webp",
  "/photos/events/news-3.webp"
];

export const FALLBACK_PRINCIPAL_PHOTO = "/photos/people/principal.jpeg";
export const FALLBACK_CTA_PHOTO = "/photos/hero/01-ansar-home-about.png";
export const FALLBACK_ABOUT_HERO = "/photos/hero/02-our-campus.jpg";
export const FALLBACK_ACADEMICS_HERO = "/photos/hero/03-academics.jpg";
export const FALLBACK_ADMISSIONS_HERO = "/photos/hero/04-admission.jpg";
