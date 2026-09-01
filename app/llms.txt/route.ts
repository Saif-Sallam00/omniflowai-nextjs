import { buildAbsoluteUrl } from "@/lib/metadata";
import { getLanguagePath } from "@/lib/language";
import { getPublishedArticles } from "@/lib/db/articles";
import { getPortfolioListItems } from "@/lib/db/portfolio";

const HEADER = `# OmniflowAI

OmniflowAI — AI-powered solutions. (Arabic: OmniflowAI — حلول مدعومة بالذكاء الاصطناعي.)

Available in English (default) and Arabic (/ar).
`;

export async function GET(): Promise<Response> {
  if (process.env.INDEXING_ENABLED !== "true") {
    return new Response(HEADER, { headers: { "Content-Type": "text/plain" } });
  }

  const lines: string[] = [];

  for (const language of ["en", "ar"] as const) {
    const articles = await getPublishedArticles(language);
    for (const article of articles) {
      lines.push(
        `${article.title} — ${buildAbsoluteUrl(getLanguagePath(`/articles/${article.slug}`, language))}`,
      );
    }
  }

  for (const language of ["en", "ar"] as const) {
    const projects = await getPortfolioListItems(language);
    for (const project of projects) {
      lines.push(
        `${project.title} — ${buildAbsoluteUrl(getLanguagePath(`/portfolio/${project.slug}`, language))}`,
      );
    }
  }

  const body = `${HEADER}\n${lines.join("\n")}\n`;

  return new Response(body, { headers: { "Content-Type": "text/plain" } });
}
