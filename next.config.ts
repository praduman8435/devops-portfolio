import type { NextConfig } from "next";

/**
 * Hardened response headers: a DevOps portfolio should practise what it preaches.
 */
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    const noIndex = [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }];
    return [
      { source: "/(.*)", headers: securityHeaders },
      // Private tool and APIs: never indexed, never cached by shared caches.
      { source: "/radar", headers: [...noIndex, { key: "Cache-Control", value: "private, no-store" }] },
      { source: "/api/:path*", headers: noIndex },
    ];
  },
};

export default nextConfig;
