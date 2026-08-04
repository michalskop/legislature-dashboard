import type { NextConfig } from "next";

// NOTE (A1 divergence, still true after A2): cz-psp rewrites /digest/* to a
// separate deployed "Sněmovna Digest" video-summary microservice
// (DIGEST_ORIGIN). No such service exists for cities, so that rewrite (and
// the DIGEST_ORIGIN env var) is dropped here rather than copied — see
// DIVERGENCE.md.
//
// NOTE (A2): cz-psp's old-Czech-URL redirects (/poslanec/:id -> /member/:id
// etc.) are also dropped here — this app never had traffic under those old
// paths (it's a fresh app), and with multi-city routing there's no single
// unprefixed /member/:id to redirect to anymore (it's /<city>/member/:id).
// The /region(s) destinations are gone too — those routes were removed
// entirely in A2 (see DIVERGENCE.md).
const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@legislature/ui", "@legislature/utils", "@legislature/charts"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },
};

export default nextConfig;
