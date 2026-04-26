/**
 * Fallback content used when Strapi is unreachable or content hasn't been seeded yet.
 * This lets the site build and render before the CMS is connected.
 * Replace with real content via Strapi admin once you're set up.
 */

import type {
  AboutPage,
  AcademicsPage,
  AdmissionsPage,
  DocumentEntry,
  EventItem,
  GalleryItem,
  HomePage,
  NavItem,
  NewsArticle,
  PageEntry,
  SiteSettings,
  StaffMember
} from "./types";

export const fallbackSiteSettings: SiteSettings = {
  schoolName: "Ansar School Padhinjarangadi",
  tagline: "Knowledge, Character, Service",
  contactPhone: "+91 00000 00000",
  contactEmail: "info@ansarschoolpdi.in",
  address: "Padhinjarangadi, Malappuram District, Kerala, India",
  facebookUrl: "",
  instagramUrl: "",
  youtubeUrl: "",
  mapEmbedUrl: "",
  navigation: [],
  footerNavigation: [],
  footerAboutBlurb:
    "Ansar School Padhinjarangadi is committed to a balanced, values-led education that prepares every child for a confident future. Our campus, faculty, and traditions are rooted in the spirit of service that has guided us since 1986.",
  officeHours: "Monday – Saturday · 8:30 AM – 3:30 PM",
  addressLine1: "Ansar School Padhinjarangadi",
  addressLine2: "Padinjarangadi P.O., Palakkad Dt., Kerala – 679552"
};

export const fallbackNavigation: NavItem[] = [];

export const fallbackHome: HomePage = {
  heroTitle: "Welcome to Ansar School Padhinjarangadi",
  heroSubtitle:
    "Nurturing young minds with academic excellence, strong values, and a love of learning — rooted in the heart of Kerala.",
  introHeading: "A school that grows with the child",
  introBody:
    "For decades, Ansar School has been a trusted home for learners from Padhinjarangadi and the surrounding villages. Our classrooms blend a rigorous curriculum with care, creativity, and the cultural richness of Kerala.",
  highlights: [
    {
      title: "Strong academic foundation",
      body: "Comprehensive primary and secondary curriculum with a steady track record of board results."
    },
    {
      title: "Caring teachers",
      body: "Experienced, dedicated faculty who know every student by name and support them at every stage."
    },
    {
      title: "Beyond the textbook",
      body: "Sports, arts, language, and community programs that build well-rounded young people."
    }
  ],
  ctaTitle: "Admissions are open",
  ctaBody: "Visit the campus, meet our team, and learn how to enroll your child for the new academic year.",
  ctaButtonLabel: "Start admission",
  ctaButtonHref: "/admissions",
  heroSlides: [],
  stats: [
    { label: "Years of trust", value: "38+" },
    { label: "Students", value: "1,200+" },
    { label: "Faculty members", value: "60+" },
    { label: "Acres of campus", value: "5.0" }
  ],
  whyUs: [
    { title: "Strong board results", body: "Consistent track record across CBSE board exams." },
    { title: "Caring faculty", body: "Teachers who know every student by name." },
    { title: "Modern facilities", body: "Smart classrooms, labs, library, and a full play ground." },
    { title: "Values first", body: "Character, discipline, and service woven into every day." },
    { title: "Sports & arts", body: "Daily PE, music, and arts as part of the rhythm of school." },
    { title: "Safe campus", body: "CCTV, trained staff, and a secure pickup-and-drop process." }
  ],
  programsHeading: "Our programs",
  programsBody:
    "From early years through high school, our curriculum is sequenced to build strong foundations and lifelong learners.",
  testimonials: [
    {
      quote: "Ansar gave my daughter both the academic edge and the values we wanted for her. The teachers are like family.",
      author: "Sajitha P.",
      role: "Parent, Class 7"
    },
    {
      quote: "Coming back to teach at the school I once studied in is the proudest part of my career.",
      author: "Mr. Rashid",
      role: "Senior teacher, Mathematics"
    },
    {
      quote: "The labs and library here are honestly better than what I expected for a small-town school.",
      author: "Aisha N.",
      role: "Class 10 student"
    }
  ],
  ctaBanner: {
    title: "Help your child reach new heights",
    body: "Begin the admission journey today — our team will walk you through eligibility, fees, and the next academic intake.",
    buttonLabel: "Start admission",
    buttonHref: "/admissions"
  }
};

export const fallbackAbout: AboutPage = {
  title: "About Our School",
  vision:
    "To shape confident, curious, and compassionate young people who serve their families, communities, and country.",
  mission:
    "We deliver a balanced education — rigorous in academics, rich in values, and rooted in our culture — in an environment where every child is known, supported, and inspired.",
  history:
    "Ansar School was founded to make quality education accessible to families in Padhinjarangadi and surrounding villages. Over the years it has grown into a trusted institution while keeping its founding spirit of service.",
  principalName: "Principal",
  principalMessage:
    "A school is more than buildings and books — it is the people inside it. Our promise to every parent is simple: your child will be known, challenged, and cared for here. Welcome to Ansar."
};

export const fallbackAcademics: AcademicsPage = {
  title: "Academics",
  intro:
    "Our academic program follows a carefully sequenced curriculum from the early years through secondary school, with strong foundations in language, mathematics, science, and the social studies.",
  programs: [
    {
      name: "Lower Primary (LP)",
      classes: "Classes 1 – 4",
      description:
        "Joyful early learning that builds reading, numeracy, and curiosity through stories, songs, and play."
    },
    {
      name: "Upper Primary (UP)",
      classes: "Classes 5 – 7",
      description:
        "A widening world: structured study of languages, math, science, and social science with active learning."
    },
    {
      name: "High School",
      classes: "Classes 8 – 10",
      description:
        "Focused preparation for board examinations with strong academic support and career awareness."
    }
  ],
  facilities: [
    { name: "Library", description: "A growing collection of books in Malayalam, English, and Arabic." },
    { name: "Science labs", description: "Practical, hands-on lab work for upper primary and high school students." },
    { name: "Computer lab", description: "Introduction to digital literacy and basic computer skills." },
    { name: "Playground", description: "Open ground for daily PE, games, and sports day events." }
  ]
};

export const fallbackAdmissions: AdmissionsPage = {
  title: "Admissions",
  intro:
    "We welcome admission inquiries throughout the year. Most new admissions happen between February and May for the upcoming academic year.",
  process: [
    { step: 1, title: "Visit / inquire", description: "Call the school office or visit the campus to meet our team." },
    { step: 2, title: "Collect form", description: "Pick up the admission form from the school office." },
    { step: 3, title: "Submit documents", description: "Submit the completed form with the required documents listed below." },
    { step: 4, title: "Interaction", description: "A short interaction with the child and parents." },
    { step: 5, title: "Confirmation", description: "On selection, complete the fee payment to confirm admission." }
  ],
  feeNote: "Fee structure varies by class. Please contact the school office for the current fee schedule.",
  documentsRequired: [
    "Birth certificate (copy)",
    "Aadhaar card (parent and child)",
    "Previous school transfer certificate (if applicable)",
    "Most recent report card (if applicable)",
    "Two passport-size photographs of the child"
  ],
  ageEligibility: "Children completing 5 years by 1 June of the academic year are eligible for Class 1."
};

export const fallbackNews: NewsArticle[] = [
  {
    id: 1,
    documentId: "fallback-1",
    title: "Annual day celebration",
    slug: "annual-day-celebration",
    excerpt: "A wonderful evening of music, dance, and recognition for our students.",
    publishedDate: new Date().toISOString()
  },
  {
    id: 2,
    documentId: "fallback-2",
    title: "Science exhibition",
    slug: "science-exhibition",
    excerpt: "Class 8–10 students presented hands-on projects across physics, chemistry, and biology.",
    publishedDate: new Date(Date.now() - 14 * 86_400_000).toISOString()
  },
  {
    id: 3,
    documentId: "fallback-3",
    title: "Sports day winners",
    slug: "sports-day-winners",
    excerpt: "Our annual sports day brought out the best in track, field, and team events.",
    publishedDate: new Date(Date.now() - 30 * 86_400_000).toISOString()
  }
];

export const fallbackEvents: EventItem[] = [
  {
    id: 1,
    title: "Parent–Teacher Meeting",
    description: "Term 1 PTM for parents of Classes 1–10.",
    startDate: new Date(Date.now() + 7 * 86_400_000).toISOString()
  },
  {
    id: 2,
    title: "Onam Celebration",
    description: "Traditional Onam celebration with sadya, pookalam, and cultural performances.",
    startDate: new Date(Date.now() + 21 * 86_400_000).toISOString()
  }
];

export const fallbackGallery: GalleryItem[] = [];

export const fallbackStaff: StaffMember[] = [
  { id: 1, name: "Principal", role: "Principal", order: 1 },
  { id: 2, name: "Vice Principal", role: "Vice Principal", order: 2 }
];

export const fallbackPages: PageEntry[] = [];
export const fallbackDocuments: DocumentEntry[] = [];
