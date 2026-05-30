import type { NextConfig } from "next";

const DIGEST_ORIGIN = process.env.DIGEST_ORIGIN ?? "https://cz-psp-videoarchive-michalskops-projects.vercel.app";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@legislature/ui", "@legislature/utils", "@legislature/charts"],
  async rewrites() {
    return [
      { source: "/digest",        destination: `${DIGEST_ORIGIN}/digest` },
      { source: "/digest/:path*", destination: `${DIGEST_ORIGIN}/digest/:path*` },
    ];
  },
  async redirects() {
    return [
      { source: "/poslanec/:id", destination: "/member/:id", permanent: true },
      { source: "/poslanci",     destination: "/members",     permanent: true },
      { source: "/strana/:id",   destination: "/group/:id",   permanent: true },
      { source: "/strany",       destination: "/groups",      permanent: true },
      { source: "/kraj/:id",     destination: "/region/:id",  permanent: true },
      { source: "/kraje",        destination: "/regions",     permanent: true },
      { source: "/o-projektu",   destination: "/about",       permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "www.psp.cz" },
    ],
  },
};

export default nextConfig;
