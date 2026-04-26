/** @type {import('next').NextConfig} */
const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const { hostname } = new URL(strapiUrl);

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname },
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "**.strapiapp.com" },
      { protocol: "https", hostname: "**.media.strapiapp.com" }
    ]
  }
};

export default nextConfig;
