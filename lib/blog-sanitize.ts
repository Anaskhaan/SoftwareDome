const SCRIPT_TAG_PATTERN = /<script[\s\S]*?>[\s\S]*?<\/script>/gi;
const ON_ATTRIBUTE_PATTERN = /\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi;
const JAVASCRIPT_HREF_PATTERN = /\s+(href|src)\s*=\s*("javascript:[^"]*"|'javascript:[^']*')/gi;

/**
 * Defense-in-depth for admin-authored blog HTML that is later rendered via
 * dangerouslySetInnerHTML. Write access is already gated by requireAdmin().
 */
export function sanitizeBlogHtml(html: string): string {
  return html
    .replace(SCRIPT_TAG_PATTERN, "")
    .replace(ON_ATTRIBUTE_PATTERN, "")
    .replace(JAVASCRIPT_HREF_PATTERN, "");
}
