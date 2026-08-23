import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  if (process.env.INDEXING_ENABLED === "true") {
    return {
      rules: {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
