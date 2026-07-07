const BLOCK_TAG_PATTERN = /<(p|h[1-6]|ul|ol|blockquote|img|div|pre)[\s>]/i;

export function looksLikeHtml(content: string): boolean {
  return BLOCK_TAG_PATTERN.test(content);
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function wrapPlainTextAsHtml(text: string): string {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) return "";

  return paragraphs
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, "<br />")}</p>`)
    .join("\n");
}

export function renderableBlogHtml(content: string): string {
  if (!content) return "";
  return looksLikeHtml(content) ? content : wrapPlainTextAsHtml(content);
}

export function slugifyHeading(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || "section"
  );
}

export type HeadingEntry = { id: string; text: string; level: 2 | 3 };

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, "");
}

export function injectHeadingIds(html: string): string {
  const seen = new Map<string, number>();

  return html.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi, (full, level, attrs, inner) => {
    if (/\sid=/.test(attrs)) return full;

    const text = stripTags(inner).trim();
    if (!text) return full;

    const base = slugifyHeading(text);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    const id = count === 0 ? base : `${base}-${count}`;

    return `<h${level}${attrs} id="${id}">${inner}</h${level}>`;
  });
}

export function extractHeadings(htmlWithIds: string): HeadingEntry[] {
  const headingPattern = /<h([23])\b[^>]*\bid="([^"]*)"[^>]*>([\s\S]*?)<\/h\1>/gi;
  const headings: HeadingEntry[] = [];

  let match: RegExpExecArray | null;
  while ((match = headingPattern.exec(htmlWithIds)) !== null) {
    const level = Number(match[1]) as 2 | 3;
    const id = match[2];
    const text = stripTags(match[3]).trim();
    if (!text || !id) continue;
    headings.push({ id, text, level });
  }

  return headings;
}

export function estimateReadingTime(html: string): number {
  const text = stripTags(html).trim();
  if (!text) return 1;
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
