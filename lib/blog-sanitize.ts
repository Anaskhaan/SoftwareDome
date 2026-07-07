// Matches a <script ...> tag through to its closing </script>, or, if none
// exists (malformed/truncated markup), through to the end of the string.
// Unclosed <script> tags are treated as malicious and everything after them
// is dropped rather than left unsanitized.
const SCRIPT_TAG_PATTERN = /<script[\s\S]*?(?:<\/script>|$)/gi;

// Matches an entire HTML tag (`<...>`) so event-handler attributes can be
// stripped only from within real tags, not from prose that happens to
// contain text like "onclick=".
const TAG_PATTERN = /<[^>]+>/g;

// Matches an `on*` event-handler attribute *within* a tag's substring.
// Accepts either whitespace or `/` immediately before the attribute name so
// delimiter-less markup like `<svg/onload=alert(1)>` is still caught.
const ON_ATTRIBUTE_IN_TAG_PATTERN = /[\s/]on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>/]+)/gi;

// Matches href/src attributes whose value resolves to a javascript: URL,
// tolerating leading whitespace inside the quotes (browsers strip it before
// scheme resolution, so `href=" javascript:..."` still executes).
const JAVASCRIPT_HREF_PATTERN =
  /\s+(href|src)\s*=\s*("\s*javascript:[^"]*"|'\s*javascript:[^']*')/gi;

/**
 * Defense-in-depth for admin-authored blog HTML that is later rendered via
 * dangerouslySetInnerHTML. Write access is already gated by requireAdmin().
 */
export function sanitizeBlogHtml(html: string): string {
  const withoutScripts = html.replace(SCRIPT_TAG_PATTERN, "");

  const withoutEventHandlers = withoutScripts.replace(TAG_PATTERN, (tag) =>
    tag.replace(ON_ATTRIBUTE_IN_TAG_PATTERN, "")
  );

  return withoutEventHandlers.replace(JAVASCRIPT_HREF_PATTERN, "");
}
