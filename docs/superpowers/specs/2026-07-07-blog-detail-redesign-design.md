# Blog detail page redesign, rich authoring, and comments

Date: 2026-07-07

## Problem

The blog feature is minimal: the detail page (`app/blog/[slug]/page.tsx`) renders `content` as plain whitespace-preserved text, with no related posts, no comments, and no reading aids. Authoring (`app/dashboard/blogs/add|edit`) is a single plain `<textarea>` for content plus an unused "gallery images" uploader whose output is never displayed anywhere. There is no `Comment` model in the schema.

Goal: make the detail page read like a standard blog post (cover image, typography, related posts, comments) and make authoring support a normal blog toolset (headings, links, inline images, lists, quotes) instead of raw plain text.

## Scope

1. Data model: add a `Comment` model; retire the unused gallery-image uploader from the authoring forms (leave the `images` column in place, unused).
2. Authoring: replace the plain textarea with a Tiptap WYSIWYG editor in both the add and edit blog dashboard pages.
3. Reading: redesign `/blog/[slug]` — proper HTML rendering (with legacy plain-text fallback), reading time, table of contents, share buttons, related posts, and comments.

Out of scope: view-count/popularity tracking, comment editing, threaded replies, guest (non-authenticated) commenting, author bio card — all explicitly deferred per user decisions below.

## Decisions made during brainstorming

- **Editor**: full WYSIWYG (Tiptap), not markdown, not a bare textarea. Content stored as HTML in the existing `Blog.content` column (no schema change to that field).
- **Comments**: must be logged in (reuse existing JWT/`auth_token` cookie auth), flat list (no threading), matching the UX precedent of `components/SoftwareReviews.tsx` but allowing multiple comments per user (unlike reviews' one-per-user upsert).
- **Related posts**: tag-overlap based, backfilled with most-recent published posts if fewer than 3 tag matches exist. No view-count field added.
- **Detail page extras**: reading time, share buttons, and an auto-generated table of contents. No author bio card.
- **Legacy content**: old plain-text posts are auto-wrapped into paragraphs at render time (detect "looks like HTML" vs plain text; if plain text, escape then wrap on blank-line boundaries).
- **Gallery uploader**: removed from both authoring forms; the `Blog.images` schema field is left in place unused (cheap, no migration risk) rather than dropped.

## Data model

Add to `prisma/schema.prisma`:

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

- `Blog` gains `comments Comment[]`.
- `User` gains `comments Comment[]`.
- No unique constraint on `(userId, blogId)` — a user may post more than one comment on the same post, unlike `Review`.
- Deletion: a comment is deletable by its author (`comment.userId === session.userId`) or by an admin (`session.role === "ADMIN"`). No edit capability in v1.

This is a schema change — per existing project knowledge, after running `prisma migrate dev` (or `db push`) locally, the VPS deployment needs the same migration applied there too (`prisma db push`/`migrate deploy`), not just a `git pull`.

## Authoring: rich text editor

New dependencies: `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/extension-image`.

New component: `components/dashboard/BlogEditor.tsx`
- Controlled component: `{ value: string; onChange: (html: string) => void }`.
- Toolbar: Paragraph / H2 / H3, Bold, Italic, Bullet list, Numbered list, Blockquote, Link (prompt-based URL entry, with an "unlink" action when the selection is already a link), Image (file picker → `POST /api/blogs/upload` → insert returned URL at cursor), Undo/Redo.
- Editable area uses the same `.blog-content` typography classes as the public detail page, so the editor is a reasonably faithful WYSIWYG preview.
- `onChange` fires `editor.getHTML()`.

Wiring:
- `app/dashboard/blogs/add/page.tsx` and `app/dashboard/blogs/edit/[id]/page.tsx`: replace the content `<textarea>` with `<BlogEditor value={form.content} onChange={(html) => setForm({ ...form, content: html })} />`. All other fields (title, slug, excerpt, tags, status, cover image, meta title/description) are unchanged.
- Both forms: delete the "Gallery images" upload UI and its associated state (`galleryFiles`, `galleryPreviews`, `existingImages`, `handleGalleryChange`, `removeGalleryItem`/`removeExistingImage`), and stop sending `images`/`existingImages` in the submitted `FormData`.
- `app/dashboard/blogs/actions.ts` (`parseBlogFormData`): drop the gallery-image upload branch; keep `images` defaulting to `[]` (or the blog's existing stored value, untouched) since the DB column still exists but is no longer editable from the UI.
- `app/api/blogs/route.ts` `POST` handler: unaffected structurally, still accepts `content` as a string — now it will be HTML instead of plain text.
- Server-side sanitizing: add a minimal HTML sanitize step (strip `<script>` tags and `on*` attributes) applied to `content` before it's persisted in both `POST /api/blogs` and `updateBlog`/`createBlog` server actions, since this HTML is later rendered on the public page via `dangerouslySetInnerHTML`. Content authors are restricted to admins (`requireAdmin()` already gates all write paths), so this is defense-in-depth rather than the primary control.

## Reading: `/blog/[slug]` redesign

**Rendering pipeline** (`lib/blog-content.ts`, new):
- `looksLikeHtml(content: string): boolean` — true if the string contains a recognizable block-level tag (`<p`, `<h1`-`<h6`, `<ul`, `<ol`, `<blockquote`, `<img`).
- `renderableBlogHtml(content: string): string` — if `looksLikeHtml`, returns as-is (already-sanitized HTML from authoring); otherwise HTML-escapes the raw text and wraps blank-line-separated chunks in `<p>` tags.
- `extractHeadings(html: string): { id: string; text: string; level: 2 | 3 }[]` plus `injectHeadingIds(html: string): string` — slugify heading text into stable `id`s (dedup on collision) so the ToC can link to them.

**Detail page** (`app/blog/[slug]/page.tsx`):
- Keep existing hero header (breadcrumb, tags, title).
- Add byline row: author name · reading time (`Math.ceil(wordCount / 200)` min, computed from stripped text) · published date (existing) · share buttons (X/Twitter intent link, LinkedIn intent link, "Copy link" button using `navigator.clipboard`).
- Cover image: full-width as today.
- Body layout: two columns on `lg+` (sticky ToC sidebar built from `extractHeadings`, collapsing to a "Jump to section" `<select>`/dropdown below `lg`) + main article column rendering `injectHeadingIds(renderableBlogHtml(blog.content))` via `dangerouslySetInnerHTML` inside a `.blog-content` container with hand-rolled typographic CSS (headings, paragraphs, lists, blockquote, links, images — no `@tailwindcss/typography` dependency needed).
- Below the article: `<RelatedBlogs currentId tags />` then `<BlogComments blogSlug />`.

**`components/RelatedBlogs.tsx`** (new):
- Fetches `/api/blogs?tag=<tag>&limit=6` for the post's first 1-2 tags (client-side, matching the existing client-rendered detail page), merges/dedupes results excluding the current post, takes 3; if fewer than 3, backfills from `/api/blogs?limit=3` (recent published) excluding already-picked and current ids.
- Renders using the same card visual language as `app/blog/page.tsx`'s grid (cover image, tags, title, excerpt, date, "Read post" link).

**`components/BlogComments.tsx`** (new, modeled directly on `components/SoftwareReviews.tsx`):
- Loads `GET /api/blogs/slug/[slug]/comments` and `GET /api/auth/me` in parallel.
- If logged in: textarea + "Post comment" button (`Button` component), calling `POST /api/blogs/slug/[slug]/comments`; new comment prepended to the list; textarea clears after posting (comments are additive, not upsert, unlike reviews).
- If logged out: prompt to log in (same dashed-border pattern as `SoftwareReviews`).
- List: newest-first, each item shows avatar/initial, name, relative or short date, content; a "Delete" affordance appears on items where `comment.user.id === user.id` or `user.role === "ADMIN"`, calling `DELETE /api/blogs/comments/[id]` and removing the item from local state on success.

## API routes

- `GET /api/blogs/slug/[slug]/comments/route.ts` (new) — public; 404 if blog not found; returns comments ordered `createdAt desc` with `user { id, name, image }`.
- `POST /api/blogs/slug/[slug]/comments/route.ts` (same file, new `POST` export) — requires `auth_token` cookie + valid JWT (mirrors the reviews route's auth check exactly); validates `content` (trim, required, ≤2000 chars); creates a `Comment` row (always insert, no upsert); returns the created comment with `user` selected.
- `DELETE /api/blogs/comments/[id]/route.ts` (new) — requires auth; loads the comment, 404 if missing; 403 unless `comment.userId === session.userId` or `session.role === "ADMIN"`; deletes and returns 200.

`GET /api/blogs/slug/[slug]/route.ts` (existing) needs no change — `blogSelect` already includes `tags`, which is all `RelatedBlogs` needs from the current post.

## Testing plan

- Unit-style checks (manual via `run`/browser, this app has no existing test suite to extend):
  - Create a blog post through the new editor: verify headings/bold/list/link/inline-image all persist and re-render correctly after reload and after re-opening the edit page.
  - Confirm a legacy plain-text post (seeded before this change) still renders as readable paragraphs, not raw whitespace-collapsed text.
  - Post, then delete, a comment as a regular user; confirm an admin can delete another user's comment; confirm a logged-out visitor sees the login prompt and cannot POST directly via the API (401).
  - Confirm related posts show tag-matched posts first and backfill with recent posts when a post's tags are unique.
  - Confirm reading time and ToC render sensibly on a long multi-heading post and that ToC links jump to the correct in-page anchor.
- `npm run lint` and `npm run build` after implementation to catch type/lint errors across the touched files (no automated test suite exists in this project to extend).
