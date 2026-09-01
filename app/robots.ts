import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

const AI_CRAWLER_USER_AGENTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "anthropic-ai",
  "Claude-User",
  "CCBot",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
];

export default function robots(): MetadataRoute.Robots {
  if (process.env.INDEXING_ENABLED === "true") {
    return {
      rules: [
        {
          userAgent: "*",
          allow: "/",
          disallow: ["/admin/", "/api/"],
        },
        ...AI_CRAWLER_USER_AGENTS.map((userAgent) => ({
          userAgent,
          allow: "/",
          disallow: ["/admin/", "/api/"],
        })),
      ],
      sitemap: `${siteUrl}/sitemap.xml`,
    };
  }

  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  };
}
