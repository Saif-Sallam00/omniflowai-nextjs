export type ArticleHeading = { id: string; text: string; level: 2 | 3; line: number };

function stripInlineMarkdown(text: string): string {
  return text
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim();
}

function slugifyHeading(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[`*_~]/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-");
}

// Extracts H2/H3 headings from raw article Markdown, in document order, with
// stable deduped ids ("heading", "heading-2", "heading-3", ...). Fenced code
// blocks are skipped so a commented-out "## foo" inside ``` never counts.
// ArticleMarkdown assigns ids to its rendered h2/h3 nodes by walking this same
// list in render order, so the two must stay in sync.
export function extractArticleHeadings(body: string): ArticleHeading[] {
  const headings: ArticleHeading[] = [];
  const seen = new Map<string, number>();
  let inFence = false;

  body.split("\n").forEach((line, index) => {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      return;
    }
    if (inFence) return;

    const match = /^(#{2,3})\s+(.+?)\s*#*$/.exec(line);
    if (!match) return;

    const level = match[1].length as 2 | 3;
    const text = stripInlineMarkdown(match[2]);
    if (!text) return;

    let slug = slugifyHeading(text) || "section";
    const count = seen.get(slug) ?? 0;
    seen.set(slug, count + 1);
    if (count > 0) slug = `${slug}-${count + 1}`;

    // remark/react-markdown node positions are 1-indexed lines.
    headings.push({ id: slug, text, level, line: index + 1 });
  });

  return headings;
}
