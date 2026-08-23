import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    if (process.env.INDEXING_ENABLED === "true") {
      return [];
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
