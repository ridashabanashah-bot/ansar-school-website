import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSiteSettings } from "@/lib/content";

export const revalidate = 60;

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz"]
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: {
      default: settings.schoolName,
      template: `%s · ${settings.schoolName}`
    },
    description: settings.tagline ?? `${settings.schoolName} — a school in Padhinjarangadi, Kerala.`,
    metadataBase: process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL) : undefined,
    openGraph: {
      title: settings.schoolName,
      description: settings.tagline ?? "",
      type: "website",
      locale: "en_IN"
    },
    icons: { icon: "/favicon.svg" }
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} bg-cream-50`}>
      <body className="font-sans text-slate-800">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-brand-700 focus:px-3 focus:py-2 focus:text-white">
          Skip to content
        </a>
        <Header settings={settings} />
        <main id="main">{children}</main>
        <Footer settings={settings} />
      </body>
    </html>
  );
}
