# Blog Detail Redesign, Rich Editor, and Comments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the plain-textarea blog authoring flow with a Tiptap rich text editor, and redesign `/blog/[slug]` into a full standard blog detail page with proper HTML rendering, reading time, table of contents, share buttons, related posts, and a logged-in comments section.

**Architecture:** A `Comment` model is added to Prisma alongside `Blog`/`User`. Authoring (`/dashboard/blogs/add` and `/edit/[id]`) gets a shared `BlogEditor` Tiptap component that emits sanitized HTML into the existing `Blog.content` column. The public detail page gets a small rendering pipeline (`lib/blog-content.ts`) that turns that HTML (or legacy plain text) into typography-safe markup with heading anchors, plus two new client components (`RelatedBlogs`, `BlogComments`) that call new/existing API routes.

**Tech Stack:** Next.js 16 (App Router), Prisma 7 (Postgres), Tiptap 2 (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/extension-image`), Tailwind CSS v4, existing JWT/cookie auth (`lib/jwt.ts`, `auth_token` cookie).

## Global Constraints

- Only these new npm dependencies may be added: `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/extension-image`. No new test framework, no `@tailwindcss/typography`, no markdown library.
- This repo has no automated test framework (`grep` confirms no jest/vitest/playwright, no `*.test.*` files). Follow its existing convention instead: standalone verification scripts under `scripts/`, run via `npx tsx scripts/<name>.ts` (see `scripts/test-software-flow.ts` for precedent), using `node:assert/strict` for hard failures. Do not introduce Jest/Vitest.
- `Comment` has no unique constraint on `(userId, blogId)` — a user may post multiple comments on the same blog, unlike `Review`. No edit capability, no threaded replies, no guest/anonymous commenting — all decided during brainstorming.
- `Blog.images` (the gallery array column) stays in the Prisma schema untouched. Only its upload UI and read/write wiring in the dashboard forms and `parseBlogFormData` are removed.
- After the Prisma schema change in Task 1, the VPS deployment needs `prisma db push` (or `prisma migrate deploy`) run explicitly — a `git pull` alone will not update the remote database. Remind the user of this when the branch is ready to deploy.
- Server-authored blog `content` is now HTML rendered via `dangerouslySetInnerHTML` on the public page — every write path (`createBlog`/`updateBlog` server actions, `POST /api/blogs`, `PATCH /api/blogs/[id]`) must run it through `sanitizeBlogHtml` before persisting.

---

## Task 1: Add the `Comment` model to the schema

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `scripts/verify-blog-comments-schema.ts`

**Interfaces:**
- Produces: Prisma model `Comment { id, content, userId, user, blogId, blog, createdAt, updatedAt }`, reachable as `prisma.comment.*` and via `prisma.blog.findUnique({ include: { comments: true } })` / `prisma.user...comments`.

- [ ] **Step 1: Add the model and back-relations**

In `prisma/schema.prisma`, add `comments Comment[]` to the `User` model (right after the existing `blogs Blog[]` line):

```prisma
model User {
  id              String       @id @default(cuid())
  email           String       @unique
  name            String?
  image           String?
  password        String
  role            UserRole     @default(USER)
  status          String       @default("Active")
  isEmailVerified Boolean      @default(false)
  organizationId  String?
  organization    Organization? @relation(fields: [organizationId], references: [id])
  companyName     String?
  companyEmail    String?
  companyAddress  String?
  companyPhone    String?
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  reviews         Review[]
  blogs           Blog[]
  comments        Comment[]
  software        Software[]

  @@index([email])
}
```

Add `comments Comment[]` to the `Blog` model (right after `author User @relation(...)`):

```prisma
model Blog {
  id              String     @id @default(cuid())
  title           String
  slug            String     @unique
  excerpt         String?    @db.Text
  content         String     @db.Text
  coverImage      String?
  images          String[]
  tags            String[]
  status          BlogStatus @default(DRAFT)
  metaTitle       String?
  metaDescription String?    @db.Text
  publishedAt     DateTime?
  authorId        String
  author          User       @relation(fields: [authorId], references: [id], onDelete: Cascade)
  comments        Comment[]
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt

  @@index([slug])
  @@index([status])
  @@index([authorId])
  @@index([publishedAt])
}
```

Append the new model at the end of the file, after the `Blog` model:

```prisma
model Comment {
  id        String   @id @default(cuid())
  content   String   @db.Text
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  blogId    String
  blog      Blog     @relation(fields: [blogId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([blogId])
  @@index([userId])
}
```

- [ ] **Step 2: Generate the client and push the schema to the dev database**

Run:
```bash
npx prisma generate
npx prisma db push
```
Expected: both commands exit 0; `db push` reports `Comment` table created (e.g. "The database is now in sync with your Prisma schema").

- [ ] **Step 3: Write the verification script**

Create `scripts/verify-blog-comments-schema.ts`:

```ts
import prisma from "@/lib/prisma";
import assert from "node:assert/strict";

async function main() {
  const user = await prisma.user.findFirst();
  assert.ok(user, "No user found in the database — run scripts/create-admin.ts first.");

  const blog = await prisma.blog.create({
    data: {
      title: "Comment Schema Probe",
      slug: `comment-schema-probe-${Date.now()}`,
      content: "<p>probe</p>",
      status: "DRAFT",
      authorId: user!.id,
    },
  });

  await prisma.comment.create({
    data: { content: "First probe comment", userId: user!.id, blogId: blog.id },
  });
  await prisma.comment.create({
    data: { content: "Second probe comment", userId: user!.id, blogId: blog.id },
  });

  const withRelations = await prisma.blog.findUnique({
    where: { id: blog.id },
    include: { comments: { include: { user: { select: { id: true, name: true } } } } },
  });

  assert.ok(withRelations, "Probe blog was not found after creation.");
  assert.equal(withRelations!.comments.length, 2, "Expected 2 comments on the probe blog.");
  assert.equal(withRelations!.comments[0].user.id, user!.id, "Comment.user relation did not resolve.");

  console.log("Comment relation check passed:", JSON.stringify(withRelations!.comments, null, 2));

  await prisma.comment.deleteMany({ where: { blogId: blog.id } });
  await prisma.blog.delete({ where: { id: blog.id } });

  const remaining = await prisma.comment.count({ where: { blogId: blog.id } });
  assert.equal(remaining, 0, "Comments were not cleaned up alongside their blog.");

  console.log("Cleanup verified. Comment model wiring works end-to-end.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
```

- [ ] **Step 4: Run the verification script**

Run: `npx tsx scripts/verify-blog-comments-schema.ts`
Expected: prints the two probe comments as JSON, then `Cleanup verified. Comment model wiring works end-to-end.`, exits 0. If it throws "No user found", run `npx tsx scripts/create-admin.ts` first (see existing script for required env vars), then re-run.

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma scripts/verify-blog-comments-schema.ts
git commit -m "feat: add Comment model for blog comments"
```

---

## Task 2: Blog content rendering + sanitizing helpers

**Files:**
- Create: `lib/blog-content.ts`
- Create: `lib/blog-sanitize.ts`
- Create: `scripts/verify-blog-content.ts`

**Interfaces:**
- Produces from `lib/blog-content.ts`: `looksLikeHtml(content: string): boolean`, `escapeHtml(text: string): string`, `wrapPlainTextAsHtml(text: string): string`, `renderableBlogHtml(content: string): string`, `slugifyHeading(text: string): string`, `type HeadingEntry = { id: string; text: string; level: 2 | 3 }`, `injectHeadingIds(html: string): string`, `extractHeadings(htmlWithIds: string): HeadingEntry[]`, `estimateReadingTime(html: string): number`.
- Produces from `lib/blog-sanitize.ts`: `sanitizeBlogHtml(html: string): string`.
- Consumed by: Task 5 (server-side sanitizing), Task 9 (detail page rendering pipeline).

- [ ] **Step 1: Write `lib/blog-content.ts`**

```ts
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
```

- [ ] **Step 2: Write `lib/blog-sanitize.ts`**

```ts
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
```

- [ ] **Step 3: Write the verification script**

Create `scripts/verify-blog-content.ts`:

```ts
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

  console.log("All blog-content and blog-sanitize checks passed.");
}

main();
```

- [ ] **Step 4: Run the verification script**

Run: `npx tsx scripts/verify-blog-content.ts`
Expected: `All blog-content and blog-sanitize checks passed.`, exit code 0. If any `assert` throws, fix the corresponding function in `lib/blog-content.ts` or `lib/blog-sanitize.ts` until it passes — do not change the expected values.

- [ ] **Step 5: Commit**

```bash
git add lib/blog-content.ts lib/blog-sanitize.ts scripts/verify-blog-content.ts
git commit -m "feat: add blog content rendering and sanitizing helpers"
```

---

## Task 3: Icons, `BlogEditor`, and wiring into the Add Blog page

**Files:**
- Modify: `lib/fa-icons.tsx`
- Create: `components/dashboard/BlogEditor.tsx`
- Modify: `app/dashboard/blogs/add/page.tsx`
- Modify: `package.json` (via npm install)

**Interfaces:**
- Consumes: `/api/blogs/upload` (existing route, `POST` with `files` field, returns `{ url }` for a single file — see `app/api/blogs/upload/route.ts`).
- Produces: `BlogEditor({ value: string; onChange: (html: string) => void })`, a controlled component rendering Tiptap HTML output. New icon exports from `lib/fa-icons.tsx`: `Bold`, `Italic`, `ListUl`, `ListOl`, `Quote`, `LinkIcon`, `Unlink`, `Clock`, `Undo`, `Redo`, `Copy`.

- [ ] **Step 1: Install Tiptap**

Run:
```bash
npm install @tiptap/react@^2 @tiptap/starter-kit@^2 @tiptap/extension-link@^2 @tiptap/extension-image@^2
```
Expected: exits 0, `package.json` `dependencies` gains the four packages, pinned to the Tiptap v2 line (the `BlogEditor` code in Step 3 targets the v2 API — `StarterKit`'s bundled History extension providing `undo`/`redo`, `extendMarkRange` for links, `setImage` from `extension-image`. If a newer major is installed instead and the editor throws or the toolbar behaves unexpectedly during Step 5's manual check, pin the exact `^2` range shown here rather than debugging against a different major version).

- [ ] **Step 2: Add new icon exports to `lib/fa-icons.tsx`**

In the `@fortawesome/free-solid-svg-icons` import block (top of the file), add these to the existing list (right after `faPhone,`):

```ts
  faPhone,
  faBold,
  faItalic,
  faListUl,
  faListOl,
  faQuoteRight,
  faLink,
  faLinkSlash,
  faClock,
  faRotateLeft,
  faRotateRight,
  faCopy,
} from "@fortawesome/free-solid-svg-icons";
```

At the end of the exports (right after `export const Phone = makeIcon(faPhone);`), add:

```ts
export const Bold = makeIcon(faBold);
export const Italic = makeIcon(faItalic);
export const ListUl = makeIcon(faListUl);
export const ListOl = makeIcon(faListOl);
export const Quote = makeIcon(faQuoteRight);
export const LinkIcon = makeIcon(faLink);
export const Unlink = makeIcon(faLinkSlash);
export const Clock = makeIcon(faClock);
export const Undo = makeIcon(faRotateLeft);
export const Redo = makeIcon(faRotateRight);
export const Copy = makeIcon(faCopy);
```

- [ ] **Step 3: Write `components/dashboard/BlogEditor.tsx`**

```tsx
"use client";

import { useCallback, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapLink from "@tiptap/extension-link";
import TiptapImage from "@tiptap/extension-image";
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  ListUl,
  ListOl,
  Quote as QuoteIcon,
  LinkIcon,
  Unlink,
  ImageIcon,
  Undo,
  Redo,
  Loader2,
} from "@/lib/fa-icons";

type BlogEditorProps = {
  value: string;
  onChange: (html: string) => void;
};

function ToolbarButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 ${
        active ? "bg-slate-200 text-[#0a192f]" : ""
      }`}
    >
      {children}
    </button>
  );
}

export default function BlogEditor({ value, onChange }: BlogEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      TiptapLink.configure({ openOnClick: false, autolink: true }),
      TiptapImage,
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "blog-content min-h-[280px] focus:outline-none",
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
    // Only re-sync when the external value changes; re-running on every
    // editor identity change would fight the user's own typing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previousUrl || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("files", file);
      formData.append("folder", "blogs");

      try {
        const res = await fetch("/api/blogs/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (res.ok && data.url) {
          editor.chain().focus().setImage({ src: data.url }).run();
        }
      } catch (err) {
        console.error("Image upload failed:", err);
      }
    };
    input.click();
  }, [editor]);

  if (!editor) {
    return (
      <div className="flex h-64 items-center justify-center rounded-md border border-slate-200 bg-slate-50">
        <Loader2 size={20} className="animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-slate-200">
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 p-2">
        <ToolbarButton
          label="Paragraph"
          active={editor.isActive("paragraph")}
          onClick={() => editor.chain().focus().setParagraph().run()}
        >
          <span className="text-xs font-bold">P</span>
        </ToolbarButton>
        <ToolbarButton
          label="Heading 2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <span className="text-xs font-bold">H2</span>
        </ToolbarButton>
        <ToolbarButton
          label="Heading 3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <span className="text-xs font-bold">H3</span>
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-slate-200" aria-hidden />
        <ToolbarButton
          label="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <BoldIcon size={14} />
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <ItalicIcon size={14} />
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-slate-200" aria-hidden />
        <ToolbarButton
          label="Bullet list"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <ListUl size={14} />
        </ToolbarButton>
        <ToolbarButton
          label="Numbered list"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOl size={14} />
        </ToolbarButton>
        <ToolbarButton
          label="Blockquote"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <QuoteIcon size={14} />
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-slate-200" aria-hidden />
        <ToolbarButton label="Link" active={editor.isActive("link")} onClick={setLink}>
          <LinkIcon size={14} />
        </ToolbarButton>
        <ToolbarButton
          label="Remove link"
          disabled={!editor.isActive("link")}
          onClick={() => editor.chain().focus().unsetLink().run()}
        >
          <Unlink size={14} />
        </ToolbarButton>
        <ToolbarButton label="Insert image" onClick={addImage}>
          <ImageIcon size={14} />
        </ToolbarButton>
        <span className="mx-1 h-5 w-px bg-slate-200" aria-hidden />
        <ToolbarButton
          label="Undo"
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo size={14} />
        </ToolbarButton>
        <ToolbarButton
          label="Redo"
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo size={14} />
        </ToolbarButton>
      </div>
      <div className="max-h-[500px] overflow-y-auto bg-white px-4 py-3">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Wire `BlogEditor` into the Add Blog page and remove the gallery uploader**

In `app/dashboard/blogs/add/page.tsx`:

Replace the import block:
```tsx
import React from "react";
import {
  AlertCircle,
  Loader2,
  Plus,
  Upload,
  X,
} from "@/lib/fa-icons";
import AdminOutletHeading from "@/components/dashboard/AdminOutletHeading";
import { createBlog } from "../actions";
import { useRouter } from "next/navigation";
```
with:
```tsx
import React from "react";
import { AlertCircle, Loader2, Upload, X } from "@/lib/fa-icons";
import AdminOutletHeading from "@/components/dashboard/AdminOutletHeading";
import BlogEditor from "@/components/dashboard/BlogEditor";
import { createBlog } from "../actions";
import { useRouter } from "next/navigation";
```

Remove the gallery state (delete these two lines, keep the cover image state above them):
```tsx
  const [galleryFiles, setGalleryFiles] = React.useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = React.useState<string[]>([]);
```

Remove the gallery handlers (delete these two functions entirely):
```tsx
  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setGalleryFiles((prev) => [...prev, ...files]);
    setGalleryPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    e.target.value = "";
  };

  const removeGalleryItem = (index: number) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };
```

In `handleSubmit`, replace:
```tsx
    formData.append("existingImages", JSON.stringify([]));

    if (coverFile) formData.append("coverImage", coverFile);
    galleryFiles.forEach((file) => formData.append("images", file));
```
with:
```tsx
    if (coverFile) formData.append("coverImage", coverFile);
```

Replace the Content section (the `<textarea>` block) from:
```tsx
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-[#0a192f] uppercase tracking-wide">Content</h3>
          <textarea
            required
            rows={6}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-md text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-y"
            placeholder="Write your blog post content..."
          />
        </section>
```
to:
```tsx
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-[#0a192f] uppercase tracking-wide">Content</h3>
          <BlogEditor
            value={form.content}
            onChange={(html) => setForm((f) => ({ ...f, content: html }))}
          />
        </section>
```

Replace the whole Media section from:
```tsx
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-[#0a192f] uppercase tracking-wide">Media</h3>
      <div className="flex items-center justify-between">

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Cover image</label>
            <div className="flex flex-wrap items-start gap-4">
              {coverPreview && (
                <div className="relative w-32 h-24 rounded-md overflow-hidden border border-slate-200">
                  <img src={coverPreview} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setCoverFile(null);
                      setCoverPreview(null);
                    }}
                    className="absolute top-1 right-1 p-1 bg-white/90 rounded-lg text-red-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              <label className="flex flex-col items-center justify-center w-32 h-24 border-2 border-dashed border-slate-200 rounded-md cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 transition-colors">
                <Upload size={20} className="text-slate-400 mb-1" />
                <span className="text-[10px] font-bold text-slate-500 uppercase">Upload</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Gallery images</label>
            <div className="flex flex-wrap gap-3">
              {galleryPreviews.map((src, idx) => (
                <div key={idx} className="relative w-24 h-24 rounded-md overflow-hidden border border-slate-200">
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeGalleryItem(idx)}
                    className="absolute top-1 right-1 p-1 bg-white/90 rounded-lg text-red-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-slate-200 rounded-md cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 transition-colors">
                <Plus size={18} className="text-slate-400 mb-1" />
                <span className="text-[10px] font-bold text-slate-500 uppercase">Add</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleGalleryChange}
                />
              </label>
            </div>
          </div>
          </div>
        </section>
```
to:
```tsx
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-[#0a192f] uppercase tracking-wide">Media</h3>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Cover image</label>
            <div className="flex flex-wrap items-start gap-4">
              {coverPreview && (
                <div className="relative w-32 h-24 rounded-md overflow-hidden border border-slate-200">
                  <img src={coverPreview} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setCoverFile(null);
                      setCoverPreview(null);
                    }}
                    className="absolute top-1 right-1 p-1 bg-white/90 rounded-lg text-red-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              <label className="flex flex-col items-center justify-center w-32 h-24 border-2 border-dashed border-slate-200 rounded-md cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 transition-colors">
                <Upload size={20} className="text-slate-400 mb-1" />
                <span className="text-[10px] font-bold text-slate-500 uppercase">Upload</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
              </label>
            </div>
          </div>
        </section>
```

- [ ] **Step 5: Manually verify in the browser**

Run: `npm run dev`, then use the browser (log in as an admin, e.g. via the account from `scripts/create-admin.ts`) to:
1. Go to `/dashboard/blogs/add`.
2. Enter a title, then in the content editor use every toolbar button at least once: H2, H3, Bold, Italic, bullet list, numbered list, blockquote, Link (add a link to a selected word), Insert image (upload any local image file), Undo/Redo.
3. Submit the form.
Expected: redirected to `/dashboard/blogs` with no error banner; no "Gallery images" field is present anywhere on the form.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json lib/fa-icons.tsx components/dashboard/BlogEditor.tsx app/dashboard/blogs/add/page.tsx
git commit -m "feat: add Tiptap BlogEditor and wire it into the Add Blog page"
```

---

## Task 4: Wire `BlogEditor` into the Edit Blog page

**Files:**
- Modify: `app/dashboard/blogs/edit/[id]/page.tsx`

**Interfaces:**
- Consumes: `BlogEditor` from Task 3 (`components/dashboard/BlogEditor.tsx`).

- [ ] **Step 1: Update imports**

Replace:
```tsx
import React from "react";
import {
  AlertCircle,
  Loader2,
  Plus,
  Upload,
  X,
} from "@/lib/fa-icons";
import AdminOutletHeading from "@/components/dashboard/AdminOutletHeading";
import { getBlogById, updateBlog } from "../../actions";
import { useRouter, useParams } from "next/navigation";
```
with:
```tsx
import React from "react";
import { AlertCircle, Loader2, Upload, X } from "@/lib/fa-icons";
import AdminOutletHeading from "@/components/dashboard/AdminOutletHeading";
import BlogEditor from "@/components/dashboard/BlogEditor";
import { getBlogById, updateBlog } from "../../actions";
import { useRouter, useParams } from "next/navigation";
```

- [ ] **Step 2: Remove gallery state, loader wiring, and handlers**

Replace:
```tsx
  const [coverFile, setCoverFile] = React.useState<File | null>(null);
  const [coverPreview, setCoverPreview] = React.useState<string | null>(null);
  const [existingCover, setExistingCover] = React.useState<string | null>(null);
  const [existingImages, setExistingImages] = React.useState<string[]>([]);
  const [galleryFiles, setGalleryFiles] = React.useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = React.useState<string[]>([]);
```
with:
```tsx
  const [coverFile, setCoverFile] = React.useState<File | null>(null);
  const [coverPreview, setCoverPreview] = React.useState<string | null>(null);
  const [existingCover, setExistingCover] = React.useState<string | null>(null);
```

In the `loadBlog` effect, replace:
```tsx
        setExistingCover(blog.coverImage);
        setExistingImages(blog.images || []);
```
with:
```tsx
        setExistingCover(blog.coverImage);
```

Delete the gallery handlers entirely:
```tsx
  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setGalleryFiles((prev) => [...prev, ...files]);
    setGalleryPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    e.target.value = "";
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewGalleryItem = (index: number) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };
```

- [ ] **Step 3: Update `handleSubmit`**

Replace:
```tsx
    formData.append("existingCoverImage", coverPreview ? "" : existingCover || "");
    formData.append("existingImages", JSON.stringify(existingImages));

    if (coverFile) formData.append("coverImage", coverFile);
    galleryFiles.forEach((file) => formData.append("images", file));
```
with:
```tsx
    formData.append("existingCoverImage", coverPreview ? "" : existingCover || "");

    if (coverFile) formData.append("coverImage", coverFile);
```

- [ ] **Step 4: Swap the content textarea for `BlogEditor`**

Replace:
```tsx
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#0a192f] uppercase tracking-wide">Content</h3>
          <textarea
            required
            rows={12}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-y"
          />
        </section>
```
with:
```tsx
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#0a192f] uppercase tracking-wide">Content</h3>
          <BlogEditor
            value={form.content}
            onChange={(html) => setForm((f) => ({ ...f, content: html }))}
          />
        </section>
```

- [ ] **Step 5: Remove the gallery images block from the Media section**

Replace:
```tsx
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#0a192f] uppercase tracking-wide">Media</h3>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Cover image</label>
            <div className="flex flex-wrap items-start gap-4">
              {displayCover && (
                <div className="relative w-32 h-24 rounded-xl overflow-hidden border border-slate-200">
                  <img src={displayCover} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setCoverFile(null);
                      setCoverPreview(null);
                      setExistingCover(null);
                    }}
                    className="absolute top-1 right-1 p-1 bg-white/90 rounded-lg text-red-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              <label className="flex flex-col items-center justify-center w-32 h-24 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 transition-colors">
                <Upload size={20} className="text-slate-400 mb-1" />
                <span className="text-[10px] font-bold text-slate-500 uppercase">Upload</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Gallery images</label>
            <div className="flex flex-wrap gap-3">
              {existingImages.map((src, idx) => (
                <div key={`existing-${idx}`} className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200">
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-white/90 rounded-lg text-red-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {galleryPreviews.map((src, idx) => (
                <div key={`new-${idx}`} className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200">
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeNewGalleryItem(idx)}
                    className="absolute top-1 right-1 p-1 bg-white/90 rounded-lg text-red-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 transition-colors">
                <Plus size={18} className="text-slate-400 mb-1" />
                <span className="text-[10px] font-bold text-slate-500 uppercase">Add</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleGalleryChange}
                />
              </label>
            </div>
          </div>
        </section>
```
with:
```tsx
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#0a192f] uppercase tracking-wide">Media</h3>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Cover image</label>
            <div className="flex flex-wrap items-start gap-4">
              {displayCover && (
                <div className="relative w-32 h-24 rounded-xl overflow-hidden border border-slate-200">
                  <img src={displayCover} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setCoverFile(null);
                      setCoverPreview(null);
                      setExistingCover(null);
                    }}
                    className="absolute top-1 right-1 p-1 bg-white/90 rounded-lg text-red-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              <label className="flex flex-col items-center justify-center w-32 h-24 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 transition-colors">
                <Upload size={20} className="text-slate-400 mb-1" />
                <span className="text-[10px] font-bold text-slate-500 uppercase">Upload</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
              </label>
            </div>
          </div>
        </section>
```

- [ ] **Step 6: Manually verify in the browser**

With `npm run dev` running, open `/dashboard/blogs/edit/<id>` for the post created in Task 3.
Expected: the editor loads pre-filled with the exact rich content saved earlier (headings, bold, list, link, image all visible); no "Gallery images" field is present. Change the title, add a blockquote, save, and confirm the change persists after reload.

- [ ] **Step 7: Commit**

```bash
git add "app/dashboard/blogs/edit/[id]/page.tsx"
git commit -m "feat: wire BlogEditor into the Edit Blog page and drop the gallery uploader"
```

---

## Task 5: Sanitize blog HTML on every write path

**Files:**
- Modify: `app/dashboard/blogs/actions.ts`
- Modify: `app/api/blogs/route.ts`
- Modify: `app/api/blogs/[id]/route.ts`

**Interfaces:**
- Consumes: `sanitizeBlogHtml` from `lib/blog-sanitize.ts` (Task 2).

- [ ] **Step 1: Update `parseBlogFormData` in `app/dashboard/blogs/actions.ts`**

Replace:
```ts
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { generateUniqueBlogSlug, parseStringArray } from "@/lib/blog-utils";
import { blogSelect, resolvePublishedAt, validateBlogStatus } from "@/lib/blog-types";
import { uploadManyToCloudinary, uploadToCloudinary } from "@/lib/cloudinary-upload";
```
with:
```ts
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { generateUniqueBlogSlug, parseStringArray } from "@/lib/blog-utils";
import { blogSelect, resolvePublishedAt, validateBlogStatus } from "@/lib/blog-types";
import { uploadToCloudinary } from "@/lib/cloudinary-upload";
import { sanitizeBlogHtml } from "@/lib/blog-sanitize";
```
(`uploadManyToCloudinary` is no longer used once gallery uploads are removed below.)

Replace the whole `parseBlogFormData` function body from:
```ts
async function parseBlogFormData(formData: FormData) {
  const title = (formData.get("title") as string)?.trim();
  const content = (formData.get("content") as string)?.trim();
  const excerpt = (formData.get("excerpt") as string)?.trim() || null;
  const slugInput = (formData.get("slug") as string)?.trim();
  const status = validateBlogStatus(formData.get("status")) ?? "DRAFT";
  const metaTitle = (formData.get("metaTitle") as string)?.trim() || null;
  const metaDescription = (formData.get("metaDescription") as string)?.trim() || null;
  const tags = parseStringArray(formData.get("tags"));

  if (!title) {
    return { error: "Title is required." };
  }

  if (!content) {
    return { error: "Content is required." };
  }

  let coverImage = (formData.get("existingCoverImage") as string)?.trim() || null;
  const coverFile = formData.get("coverImage") as File;
  if (coverFile && coverFile.size > 0) {
    coverImage = await uploadToCloudinary(coverFile, "blogs");
  }

  const images = parseStringArray(formData.get("existingImages"));
  const newImageFiles = formData.getAll("images") as File[];
  const uploadedImages = await uploadManyToCloudinary(
    newImageFiles.filter((f) => f instanceof File && f.size > 0),
    "blogs"
  );

  return {
    data: {
      title,
      content,
      excerpt,
      slugInput,
      status,
      metaTitle,
      metaDescription,
      tags,
      coverImage,
      images: [...images, ...uploadedImages],
    },
  };
}
```
to:
```ts
async function parseBlogFormData(formData: FormData) {
  const title = (formData.get("title") as string)?.trim();
  const content = (formData.get("content") as string)?.trim();
  const excerpt = (formData.get("excerpt") as string)?.trim() || null;
  const slugInput = (formData.get("slug") as string)?.trim();
  const status = validateBlogStatus(formData.get("status")) ?? "DRAFT";
  const metaTitle = (formData.get("metaTitle") as string)?.trim() || null;
  const metaDescription = (formData.get("metaDescription") as string)?.trim() || null;
  const tags = parseStringArray(formData.get("tags"));

  if (!title) {
    return { error: "Title is required." };
  }

  if (!content) {
    return { error: "Content is required." };
  }

  let coverImage = (formData.get("existingCoverImage") as string)?.trim() || null;
  const coverFile = formData.get("coverImage") as File;
  if (coverFile && coverFile.size > 0) {
    coverImage = await uploadToCloudinary(coverFile, "blogs");
  }

  return {
    data: {
      title,
      content: sanitizeBlogHtml(content),
      excerpt,
      slugInput,
      status,
      metaTitle,
      metaDescription,
      tags,
      coverImage,
    },
  };
}
```

Remove the line `images: data.images,` from both the `createBlog` and `updateBlog` `prisma.blog.create`/`update` calls — it appears once in each function, immediately after `coverImage: data.coverImage,` inside the `data: { ... }` object. The line text is identical in both places, so a single find-and-replace-all of `images: data.images,\n        ` → `` (empty string) across the file removes both occurrences correctly (this is exactly the intended outcome — both call sites drop the field).

- [ ] **Step 2: Sanitize in `POST /api/blogs`**

In `app/api/blogs/route.ts`, add the import:
```ts
import { generateUniqueBlogSlug, parseStringArray } from "@/lib/blog-utils";
import { sanitizeBlogHtml } from "@/lib/blog-sanitize";
```

Replace:
```ts
    const blog = await prisma.blog.create({
      data: {
        title,
        slug,
        content,
        excerpt: body.excerpt?.trim() || null,
```
with:
```ts
    const blog = await prisma.blog.create({
      data: {
        title,
        slug,
        content: sanitizeBlogHtml(content),
        excerpt: body.excerpt?.trim() || null,
```

- [ ] **Step 3: Sanitize in `PATCH /api/blogs/[id]`**

In `app/api/blogs/[id]/route.ts`, add the import:
```ts
import { generateUniqueBlogSlug, parseStringArray } from "@/lib/blog-utils";
import { sanitizeBlogHtml } from "@/lib/blog-sanitize";
```

Replace:
```ts
    if (body.content !== undefined) {
      const content = body.content.trim();
      if (!content) {
        return NextResponse.json({ error: "Content cannot be empty." }, { status: 400 });
      }
      updateData.content = content;
    }
```
with:
```ts
    if (body.content !== undefined) {
      const content = body.content.trim();
      if (!content) {
        return NextResponse.json({ error: "Content cannot be empty." }, { status: 400 });
      }
      updateData.content = sanitizeBlogHtml(content);
    }
```

- [ ] **Step 4: Manually verify sanitizing**

With `npm run dev` running and logged in as admin in the browser, open devtools console on any page and run:
```js
fetch("/api/blogs", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    title: "Sanitize Probe",
    content: '<p>Safe</p><script>alert(1)</script><img src="x" onerror="alert(2)">',
  }),
}).then((r) => r.json()).then(console.log);
```
Expected: response `blog.content` is `<p>Safe</p><img src="x">` (no `<script>`, no `onerror`). Then delete the probe post from `/dashboard/blogs`.

- [ ] **Step 5: Commit**

```bash
git add app/dashboard/blogs/actions.ts app/api/blogs/route.ts "app/api/blogs/[id]/route.ts"
git commit -m "fix: sanitize blog HTML content on every write path"
```

---

## Task 6: Comments API routes

**Files:**
- Create: `app/api/blogs/slug/[slug]/comments/route.ts`
- Create: `app/api/blogs/comments/[id]/route.ts`

**Interfaces:**
- Produces: `GET /api/blogs/slug/[slug]/comments` → `{ comments: Array<{ id, content, createdAt, updatedAt, user: { id, name, image } }> }`; `POST` same path (auth required, body `{ content: string }`) → `{ comment }` (201); `DELETE /api/blogs/comments/[id]` (auth required, owner or admin only) → `{ message }` (200).

- [ ] **Step 1: Write the slug-scoped comments route**

Create `app/api/blogs/slug/[slug]/comments/route.ts`:

```ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import prisma from "@/lib/prisma";

type RouteContext = { params: Promise<{ slug: string }> };

async function getBlogBySlug(slug: string) {
  return prisma.blog.findUnique({ where: { slug } });
}

export async function GET(_req: Request, context: RouteContext) {
  try {
    const { slug } = await context.params;
    const blog = await getBlogBySlug(slug);

    if (!blog) {
      return NextResponse.json({ error: "Blog not found." }, { status: 404 });
    }

    const comments = await prisma.comment.findMany({
      where: { blogId: blog.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json({ comments }, { status: 200 });
  } catch (error) {
    console.error("Get comments error:", error);
    return NextResponse.json({ error: "Failed to load comments." }, { status: 500 });
  }
}

export async function POST(req: Request, context: RouteContext) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "You must be logged in to comment." }, { status: 401 });
    }

    const payload = await verifyJWT(token);

    if (!payload?.userId) {
      return NextResponse.json({ error: "Invalid session." }, { status: 401 });
    }

    const { slug } = await context.params;
    const blog = await getBlogBySlug(slug);

    if (!blog) {
      return NextResponse.json({ error: "Blog not found." }, { status: 404 });
    }

    const { content } = await req.json();
    const trimmed = typeof content === "string" ? content.trim() : "";

    if (!trimmed) {
      return NextResponse.json({ error: "Comment cannot be empty." }, { status: 400 });
    }

    if (trimmed.length > 2000) {
      return NextResponse.json({ error: "Comment must be 2000 characters or less." }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: { content: trimmed, userId: payload.userId as string, blogId: blog.id },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error("Post comment error:", error);
    return NextResponse.json({ error: "Failed to post comment." }, { status: 500 });
  }
}
```

- [ ] **Step 2: Write the delete-by-id route**

Create `app/api/blogs/comments/[id]/route.ts`:

```ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyJWT } from "@/lib/jwt";
import prisma from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const payload = await verifyJWT(token);

    if (!payload?.userId) {
      return NextResponse.json({ error: "Invalid session." }, { status: 401 });
    }

    const { id } = await context.params;
    const comment = await prisma.comment.findUnique({ where: { id } });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found." }, { status: 404 });
    }

    const isOwner = comment.userId === payload.userId;
    const isAdmin = payload.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "You can only delete your own comments." }, { status: 403 });
    }

    await prisma.comment.delete({ where: { id } });

    return NextResponse.json({ message: "Comment deleted." }, { status: 200 });
  } catch (error) {
    console.error("Delete comment error:", error);
    return NextResponse.json({ error: "Failed to delete comment." }, { status: 500 });
  }
}
```

- [ ] **Step 3: Verify the unauthenticated paths**

With `npm run dev` running, pick any published blog's slug (or the one from Task 3) and run:
```bash
curl -s http://localhost:3000/api/blogs/slug/<slug>/comments
```
Expected: `{"comments":[]}` with HTTP 200.

```bash
curl -s -X POST http://localhost:3000/api/blogs/slug/<slug>/comments \
  -H "Content-Type: application/json" \
  -d '{"content":"test"}'
```
Expected: `{"error":"You must be logged in to comment."}` with HTTP 401.

The authenticated POST/DELETE flow will be exercised end-to-end through the UI in Task 7, once `BlogComments` exists.

- [ ] **Step 4: Commit**

```bash
git add "app/api/blogs/slug/[slug]/comments/route.ts" "app/api/blogs/comments/[id]/route.ts"
git commit -m "feat: add blog comments API routes"
```

---

## Task 7: `RelatedBlogs` and `BlogComments` components

**Files:**
- Create: `components/RelatedBlogs.tsx`
- Create: `components/BlogComments.tsx`

**Interfaces:**
- Consumes: `GET /api/blogs?tag=<tag>&limit=<n>` and `GET /api/blogs?limit=<n>` (existing, `app/api/blogs/route.ts`); `GET/POST /api/blogs/slug/[slug]/comments` and `DELETE /api/blogs/comments/[id]` (Task 6); `GET /api/auth/me` (existing, returns `{ user: { id, name, email, image, role, ... } | null }`); `Button` from `components/Button.tsx`; `CompactSectionHeader` from `components/CompactSectionHeader.tsx`.
- Produces: `RelatedBlogs({ currentId: string; tags: string[] })`, `BlogComments({ blogSlug: string })` — both consumed by Task 9 (`app/blog/[slug]/page.tsx`).

- [ ] **Step 1: Write `components/RelatedBlogs.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, ArrowRight, FileText } from "@/lib/fa-icons";

type RelatedBlog = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  createdAt: string;
  publishedAt: string | null;
  tags: string[];
};

export default function RelatedBlogs({ currentId, tags }: { currentId: string; tags: string[] }) {
  const [related, setRelated] = useState<RelatedBlog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const seenIds = new Set([currentId]);
      let combined: RelatedBlog[] = [];

      for (const tag of tags.slice(0, 2)) {
        if (combined.length >= 3) break;
        try {
          const res = await fetch(`/api/blogs?tag=${encodeURIComponent(tag)}&limit=6`);
          if (res.ok) {
            const data = await res.json();
            for (const blog of (data.blogs || []) as RelatedBlog[]) {
              if (!seenIds.has(blog.id) && combined.length < 3) {
                combined = [...combined, blog];
                seenIds.add(blog.id);
              }
            }
          }
        } catch (err) {
          console.error("Failed to load tag-related blogs:", err);
        }
      }

      if (combined.length < 3) {
        try {
          const res = await fetch(`/api/blogs?limit=${3 + seenIds.size}`);
          if (res.ok) {
            const data = await res.json();
            for (const blog of (data.blogs || []) as RelatedBlog[]) {
              if (!seenIds.has(blog.id) && combined.length < 3) {
                combined = [...combined, blog];
                seenIds.add(blog.id);
              }
            }
          }
        } catch (err) {
          console.error("Failed to load recent fallback blogs:", err);
        }
      }

      if (!cancelled) {
        setRelated(combined);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [currentId, tags]);

  if (!loading && related.length === 0) return null;

  return (
    <section className="border-t border-border-subtle pt-10">
      <h2 className="mb-6 font-brand text-xl font-bold text-primary-navy">Related articles</h2>
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-surface-sunken" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-3">
          {related.map((blog) => (
            <article
              key={blog.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border-subtle bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_-12px_rgba(10,25,47,0.15)]"
            >
              <Link href={`/blog/${blog.slug}`} className="block shrink-0">
                {blog.coverImage ? (
                  <div className="h-40 w-full overflow-hidden">
                    <img
                      src={blog.coverImage}
                      alt={blog.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="flex h-40 w-full items-center justify-center bg-surface-muted">
                    <FileText size={24} className="text-primary-navy/20" />
                  </div>
                )}
              </Link>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="mb-2 line-clamp-2 font-brand text-sm font-bold leading-snug text-navy-800 transition-colors group-hover:text-brand-green-dark">
                  <Link href={`/blog/${blog.slug}`}>{blog.title}</Link>
                </h3>
                <p className="mb-3 line-clamp-2 flex-1 text-xs leading-relaxed text-text-muted">
                  {blog.excerpt || "Read our latest article to stay up to date."}
                </p>
                <div className="flex items-center justify-between border-t border-border-subtle pt-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                    <Calendar size={11} />
                    <span>
                      {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <Link
                    href={`/blog/${blog.slug}`}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-green-dark transition-colors hover:text-brand-green"
                  >
                    Read
                    <ArrowRight size={10} className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 2: Write `components/BlogComments.tsx`**

```tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageSquare, Trash2 } from "@/lib/fa-icons";
import CompactSectionHeader from "@/components/CompactSectionHeader";
import Button from "@/components/Button";

type CommentUser = { id: string; name: string | null; image: string | null };

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: CommentUser;
};

type AuthUser = { id: string; name: string | null; email: string; role: string };

function formatCommentDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function BlogComments({ blogSlug }: { blogSlug: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [commentsRes, meRes] = await Promise.all([
          fetch(`/api/blogs/slug/${blogSlug}/comments`),
          fetch("/api/auth/me"),
        ]);

        if (commentsRes.ok) {
          const data = await commentsRes.json();
          setComments(data.comments || []);
        }

        if (meRes.ok) {
          const data = await meRes.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error("Failed to load comments:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [blogSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmed = content.trim();
    if (!trimmed) {
      setError("Please write a comment before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/blogs/slug/${blogSlug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to post comment.");
        return;
      }

      setComments((prev) => [data.comment, ...prev]);
      setContent("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/blogs/comments/${id}`, { method: "DELETE" });
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete comment:", err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section id="comments" className="scroll-mt-24">
      <CompactSectionHeader subtitle="Join the discussion" title="Comments" icon={MessageSquare} />

      <div className="space-y-6">
        {user ? (
          <form onSubmit={handleSubmit} className="rounded-3xl border border-border-subtle bg-white p-5 sm:p-6">
            <label htmlFor="comment-content" className="block text-sm font-bold text-primary-navy">
              Leave a comment
            </label>
            <textarea
              id="comment-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts on this article…"
              rows={3}
              maxLength={2000}
              className="mt-3 w-full resize-y rounded-xl border border-border-subtle bg-surface-muted/40 px-3.5 py-2.5 text-sm text-zinc-700 placeholder:text-zinc-400 focus:border-brand-green/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green/15"
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-text-muted">{content.length}/2000</span>
              <Button type="submit" size="sm" loading={submitting}>
                Post comment
              </Button>
            </div>
            {error && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}
          </form>
        ) : (
          <div className="rounded-3xl border border-dashed border-border-subtle bg-surface-muted/60 px-5 py-5 text-center">
            <p className="text-sm text-text-muted">
              <Link href="/login" className="font-bold text-primary-navy hover:underline">
                Log in
              </Link>{" "}
              to join the discussion.
            </p>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-2xl bg-surface-sunken" />
            ))}
          </div>
        ) : comments.length > 0 ? (
          <ul className="divide-y divide-border-subtle rounded-3xl border border-border-subtle bg-white">
            {comments.map((comment) => {
              const canDelete = Boolean(user && (user.id === comment.user.id || user.role === "ADMIN"));
              return (
                <li key={comment.id} className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-navy/10 text-xs font-bold text-primary-navy">
                      {comment.user.image ? (
                        <img src={comment.user.image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        (comment.user.name || "U").charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <span className="text-sm font-bold text-primary-navy">
                          {comment.user.name || "Anonymous user"}
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-wider text-text-muted/70">
                          {formatCommentDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed text-text-muted whitespace-pre-line">
                        {comment.content}
                      </p>
                    </div>
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => handleDelete(comment.id)}
                        disabled={deletingId === comment.id}
                        className="shrink-0 rounded-lg p-1.5 text-text-muted/60 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        aria-label="Delete comment"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex items-center gap-3 rounded-3xl border border-dashed border-border-subtle bg-surface-muted/60 px-5 py-5 text-text-muted">
            <MessageSquare size={18} />
            <p className="text-xs leading-relaxed">No comments yet. Be the first to share your thoughts.</p>
          </div>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verify these compile cleanly**

Run: `npm run lint`
Expected: no new errors/warnings from `components/RelatedBlogs.tsx` or `components/BlogComments.tsx`. Full runtime behavior (posting/deleting comments, related-post matching) is verified in Task 9 once both are mounted on the live detail page.

- [ ] **Step 4: Commit**

```bash
git add components/RelatedBlogs.tsx components/BlogComments.tsx
git commit -m "feat: add RelatedBlogs and BlogComments components"
```

---

## Task 8: Blog article typography (`.blog-content`)

**Files:**
- Modify: `app/globals.css`

**Interfaces:**
- Produces: a `.blog-content` CSS scope used by both `BlogEditor`'s editable area (Task 3) and the rendered article body (Task 9).

- [ ] **Step 1: Append the blog-content styles**

At the end of `app/globals.css`, add:

```css
/* ---- Blog article body — typography for rendered post HTML ---- */
.blog-content {
  color: var(--text-muted);
}

.blog-content > :first-child {
  margin-top: 0;
}

.blog-content h2,
.blog-content h3 {
  margin-top: 2em;
  margin-bottom: 0.6em;
  scroll-margin-top: 6rem;
}

.blog-content p {
  margin-bottom: 1.25em;
}

.blog-content ul,
.blog-content ol {
  margin: 0 0 1.25em 1.25em;
  padding-left: 1rem;
}

.blog-content ul {
  list-style: disc;
}

.blog-content ol {
  list-style: decimal;
}

.blog-content li {
  margin-bottom: 0.4em;
  line-height: 1.65;
}

.blog-content a {
  color: var(--brand-green-dark);
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.blog-content a:hover {
  color: var(--brand-green);
}

.blog-content blockquote {
  margin: 1.5em 0;
  padding: 0.75em 1.25em;
  border-left: 3px solid var(--brand-green);
  background: var(--surface-muted);
  border-radius: 0 0.5rem 0.5rem 0;
  font-style: italic;
  color: var(--primary-navy);
}

.blog-content img {
  width: 100%;
  height: auto;
  border-radius: 0.75rem;
  margin: 1.5em 0;
}

.blog-content strong {
  color: var(--primary-navy);
}
```

- [ ] **Step 2: Verify visually**

With `npm run dev` running, open `/dashboard/blogs/add` and confirm the `BlogEditor` area (which already uses the `blog-content` class per Task 3) shows visible bullet/numbered list markers, an indented italic blockquote with a green left border, and underlined green links — not bare unstyled text.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "style: add blog-content article typography"
```

---

## Task 9: Redesign `/blog/[slug]` — rendering, reading time, ToC, share, related posts, comments

**Files:**
- Modify: `app/blog/[slug]/page.tsx`

**Interfaces:**
- Consumes: `renderableBlogHtml`, `injectHeadingIds`, `extractHeadings`, `estimateReadingTime` from `lib/blog-content.ts` (Task 2); `RelatedBlogs`, `BlogComments` from Task 7; icons `Clock`, `Copy`, `Layers`, `XTwitter`, `LinkedinIcon` from `lib/fa-icons.tsx`.

- [ ] **Step 1: Replace the whole file**

Replace the entire contents of `app/blog/[slug]/page.tsx` with:

```tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Calendar, Clock, Copy, Layers, XTwitter, LinkedinIcon } from "@/lib/fa-icons";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import RelatedBlogs from "@/components/RelatedBlogs";
import BlogComments from "@/components/BlogComments";
import {
  renderableBlogHtml,
  injectHeadingIds,
  extractHeadings,
  estimateReadingTime,
} from "@/lib/blog-content";

interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  createdAt: string;
  publishedAt: string | null;
  tags: string[];
  author?: {
    name: string | null;
    email: string;
    image: string | null;
  };
}

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchBlogDetail() {
      if (!slug) return;
      try {
        const res = await fetch(`/api/blogs/slug/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setBlog(data.blog || null);
        }
      } catch (err) {
        console.error("Failed to fetch blog details:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBlogDetail();
  }, [slug]);

  const html = useMemo(() => {
    if (!blog) return "";
    return injectHeadingIds(renderableBlogHtml(blog.content));
  }, [blog]);

  const headings = useMemo(() => extractHeadings(html), [html]);
  const readingTime = useMemo(() => (blog ? estimateReadingTime(html) : 0), [blog, html]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-50 flex flex-col justify-between">
        <div>
          <Navbar onMenuClick={() => setIsMenuOpen(true)} />
          <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
          <div className="w-full px-6 pb-12 pt-[120px] lg:px-16 lg:pt-[140px]">
            <div className="h-4 w-24 bg-zinc-200 animate-pulse rounded-md mb-6" />
            <div className="h-10 w-2/3 bg-zinc-200 animate-pulse rounded-md mb-4" />
            <div className="h-64 w-full bg-zinc-200 animate-pulse rounded-md mb-6 animate-pulse" />
            <div className="space-y-4">
              <div className="h-4 bg-zinc-200 animate-pulse rounded-md" />
              <div className="h-4 bg-zinc-200 animate-pulse rounded-md w-5/6" />
              <div className="h-4 bg-zinc-200 animate-pulse rounded-md w-4/5" />
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (!blog) {
    return (
      <main className="min-h-screen bg-zinc-50 flex flex-col justify-between">
        <div>
          <Navbar onMenuClick={() => setIsMenuOpen(true)} />
          <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
          <div className="w-full px-6 pb-28 pt-[120px] text-center lg:px-16 lg:pt-[140px]">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-primary-navy/45">
              Not found
            </span>
            <h1 className="mt-3 text-xl font-black text-primary-navy">Article not found</h1>
            <p className="mt-2 text-sm text-zinc-500">
              The article you are looking for does not exist or has been removed.
            </p>
            <Link
              href="/blog"
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary-navy hover:underline"
            >
              <ArrowLeft size={14} />
              Back to blogs
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  const publishedLabel = new Date(blog.publishedAt || blog.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const tweetHref = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(blog.title)}`;
  const linkedinHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;

  return (
    <main className="min-h-screen bg-white flex flex-col justify-between">
      <div>
        <Navbar onMenuClick={() => setIsMenuOpen(true)} />
        <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

        {/* Hero Header Section */}
        <header className="w-full bg-zinc-50 border-b border-zinc-200/60 px-6 pb-10 pt-[120px] lg:px-16 lg:pb-16 lg:pt-[140px]">
          <div className="w-full">
            <div className="mb-6">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-primary-navy transition-colors"
              >
                <ArrowLeft size={14} />
                Back to blogs
              </Link>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-4">
              {blog.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 bg-white border border-zinc-200 text-zinc-600 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm"
                >
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-3xl font-black tracking-tight text-primary-navy sm:text-5xl leading-tight max-w-5xl">
              {blog.title}
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-500 font-medium">
              <div className="flex items-center gap-2 bg-white border border-zinc-200/50 px-3 py-1.5 rounded-md shadow-sm">
                <span className="font-bold text-primary-navy">
                  By {blog.author?.name || "SoftwareDome Team"}
                </span>
              </div>
              <span className="hidden sm:inline h-4 w-px bg-zinc-300" aria-hidden />
              <div className="flex items-center gap-1.5 text-zinc-400">
                <Calendar size={12} />
                <span className="font-semibold text-zinc-600">{publishedLabel}</span>
              </div>
              <span className="hidden sm:inline h-4 w-px bg-zinc-300" aria-hidden />
              <div className="flex items-center gap-1.5 text-zinc-400">
                <Clock size={12} />
                <span className="font-semibold text-zinc-600">{readingTime} min read</span>
              </div>
            </div>

            {/* Share row */}
            <div className="mt-5 flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Share</span>
              <a
                href={tweetHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 transition-colors hover:border-primary-navy hover:text-primary-navy"
                aria-label="Share on X"
              >
                <XTwitter size={13} />
              </a>
              <a
                href={linkedinHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 transition-colors hover:border-primary-navy hover:text-primary-navy"
                aria-label="Share on LinkedIn"
              >
                <LinkedinIcon size={13} />
              </a>
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex h-8 items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 text-[11px] font-bold text-zinc-500 transition-colors hover:border-primary-navy hover:text-primary-navy"
              >
                <Copy size={12} />
                {copied ? "Copied!" : "Copy link"}
              </button>
            </div>
          </div>
        </header>

        {/* Content Section */}
        <div className="w-full px-6 py-10 lg:px-16">
          {blog.coverImage && (
            <div className="mb-10 w-full overflow-hidden rounded-md border border-zinc-200 bg-zinc-50 shadow-sm aspect-[21/9] max-h-[500px]">
              <img src={blog.coverImage} alt="" className="h-full w-full object-cover" />
            </div>
          )}

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_260px]">
            <article
              className="blog-content min-w-0 max-w-none text-base sm:text-lg"
              dangerouslySetInnerHTML={{ __html: html }}
            />

            {headings.length > 0 && (
              <aside className="hidden lg:block">
                <div className="sticky top-28 rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                  <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
                    <Layers size={13} />
                    On this page
                  </div>
                  <nav className="space-y-2 text-sm">
                    {headings.map((heading) => (
                      <a
                        key={heading.id}
                        href={`#${heading.id}`}
                        className={`block text-zinc-600 hover:text-primary-navy ${
                          heading.level === 3 ? "pl-3 text-xs" : "font-semibold"
                        }`}
                      >
                        {heading.text}
                      </a>
                    ))}
                  </nav>
                </div>
              </aside>
            )}
          </div>

          {headings.length > 0 && (
            <div className="mt-6 lg:hidden">
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-500">
                Jump to section
              </label>
              <select
                onChange={(e) => {
                  if (e.target.value) window.location.hash = e.target.value;
                }}
                defaultValue=""
                className="w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm"
              >
                <option value="" disabled>
                  Choose a section…
                </option>
                {headings.map((heading) => (
                  <option key={heading.id} value={heading.id}>
                    {heading.text}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mt-16 space-y-16">
            <RelatedBlogs currentId={blog.id} tags={blog.tags} />
            <BlogComments blogSlug={blog.slug} />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
```

- [ ] **Step 2: Full manual QA in the browser**

With `npm run dev` running:
1. Open the post created/edited in Tasks 3–4 (should contain H2/H3 headings, a list, a blockquote, a link, and an image). Confirm: reading time shows a sensible number of minutes; the "On this page" sidebar lists every H2/H3 with correct indentation for H3s; clicking a ToC entry jumps to that heading; share buttons open X/LinkedIn share dialogs in a new tab; "Copy link" changes to "Copied!" and the clipboard contains the current URL.
2. Shrink the browser window below the `lg` breakpoint and confirm the sidebar ToC is replaced by the "Jump to section" dropdown, and choosing an option jumps to that heading.
3. Open an older/legacy post whose `content` is plain text (no HTML tags) — if none exists, create one via `curl -X POST http://localhost:3000/api/blogs -H "Content-Type: application/json" -d '{"title":"Legacy Probe","content":"First paragraph.\n\nSecond paragraph.","status":"PUBLISHED"}'` while logged in as admin. Confirm it renders as two separate readable paragraphs, not one run-on block of whitespace.
4. Scroll to "Related articles": confirm it shows up to 3 other published posts, prioritizing ones that share a tag with the current post, and does not show the current post itself.
5. Scroll to "Comments": while logged out, confirm the "Log in to join the discussion" prompt appears and no textarea is shown. Log in as a regular (non-admin) user, post a comment, confirm it appears at the top of the list immediately and the textarea clears. Refresh the page and confirm the comment persisted. Delete your own comment and confirm it disappears. Log in as an admin and confirm you can delete another user's comment too, but not edit it (no edit UI exists).
6. Clean up any probe blog posts/comments created during this QA pass via `/dashboard/blogs`.

- [ ] **Step 3: Commit**

```bash
git add "app/blog/[slug]/page.tsx"
git commit -m "feat: redesign blog detail page with ToC, reading time, share, related posts, and comments"
```

---

## Task 10: Repo-wide lint and build check

**Files:** none (verification only)

- [ ] **Step 1: Run lint**

Run: `npm run lint`
Expected: no errors. Fix any reported issues in the files touched by this plan before continuing.

- [ ] **Step 2: Run a production build**

Run: `npm run build`
Expected: build completes successfully (exit 0), including successful static analysis of `app/blog/[slug]/page.tsx`, `app/dashboard/blogs/add/page.tsx`, `app/dashboard/blogs/edit/[id]/page.tsx`, and the new API routes.

- [ ] **Step 3: Remind about the VPS database**

If this branch is going to be deployed, tell the user explicitly: the new `Comment` table needs `prisma db push` (or `prisma migrate deploy`) run against the VPS database — a `git pull` alone will not create the table there (per existing project knowledge on this exact failure mode).

- [ ] **Step 4: Commit**

Only if Steps 1–2 required fixes:
```bash
git add -A
git commit -m "fix: address lint/build issues from blog redesign"
```
If no fixes were needed, there is nothing to commit for this task.

---

## Self-Review Notes

- **Spec coverage:** Comment model (Task 1), rich editor + gallery removal (Tasks 3–4), sanitizing (Task 5), comments API + UI (Tasks 6–7), typography (Task 8), detail-page rendering/reading-time/ToC/share/related/comments (Task 9) — every section of the spec maps to a task.
- **Placeholder scan:** no TBDs; every step has literal code or an exact command with expected output.
- **Type consistency:** `BlogEditor({ value, onChange })` signature matches its two call sites in Tasks 3–4; `RelatedBlogs({ currentId, tags })` and `BlogComments({ blogSlug })` signatures match their Task 9 call sites; `Comment` field names (`content`, `userId`, `blogId`, `user`) are consistent across the schema (Task 1), both API routes (Task 6), and `BlogComments.tsx` (Task 7).
