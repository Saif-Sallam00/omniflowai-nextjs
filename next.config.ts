import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/services",
        destination: "/solutions",
        permanent: true,
      },
      // Legacy numeric portfolio URLs (EX-03). Slugs are unknowable until the
      // real projects (ids 7 and 8) are re-entered at Phase 4 migration —
      // replace these two TODO placeholders with the real slugs then.
      {
        source: "/portfolio/7",
        destination: "/portfolio/TODO-slug-for-legacy-project-7",
        permanent: true,
      },
      {
        source: "/portfolio/8",
        destination: "/portfolio/TODO-slug-for-legacy-project-8",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/conversion-engineering",
        destination: "/conversion-engineering.html",
      },
    ];
  },
  async headers() {
    if (process.env.INDEXING_ENABLED === "true") {
      return [
        {
          source: "/admin/:path*",
          headers: [{ key: "X-Robots-Tag", value: "noindex" }],
        },
        {
          source: "/api/:path*",
          headers: [{ key: "X-Robots-Tag", value: "noindex" }],
        },
      ];
    }

    return [
      {
        source: "/(.*)",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
