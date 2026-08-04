import type { NextConfig } from "next";

// NOTE (A1 divergence): cz-psp rewrites /digest/* to a separate deployed
// "Sněmovna Digest" video-summary microservice (DIGEST_ORIGIN). No such
// service exists for cities, so that rewrite (and the DIGEST_ORIGIN env var)
// is dropped here rather than copied — see DIVERGENCE.md.
const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@legislature/ui", "@legislature/utils", "@legislature/charts"],
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
    ],
  },
};

export default nextConfig;
