# Category & Subcategory Taxonomy — Design Spec

**Date:** 2026-07-08
**Status:** Approved

## Problem

SoftwareDome's `/categories` page only shows categories that already have at least one `Software` row, because `Software.category` is a free-text string and `getCategories()` derives categories by `groupBy` on that string. There is no subcategory concept at all. This is a single flat level, whereas competitor directories (e.g. softwarefinder.com, analyzed via screenshot earlier in this session) use a two-level taxonomy — ~27 top-level categories, each fanning out into dozens to 100+ persona/industry-specific subcategories (e.g. "CRM Software" → "CRM For Real Estate Agents", "CRM For Doctors", ...). We want to replicate that structure as a real, browsable directory skeleton, seeded up front, that gets populated with real software over time.

## Context

- `prisma/schema.prisma`: `Software.category` is `String?`, no relation, no dedicated Category table.
- `app/dashboard/softwares/actions.ts`:
  - `getCategories()` — `prisma.software.groupBy(["category"])`, slugifies each distinct string client-side. Categories with zero software simply don't exist.
  - `getSoftwaresByCategory(categorySlug, opts)` — re-derives categories, matches by slug, filters `Software.where.category.in [...]`.
  - A search-resolution helper matches a searched software name to its `category` string and returns that category's slug (used by hero/navbar search).
  - `importSoftwaresFromCSV()` reads a `category` column per row.
- `app/categories/page.tsx` — client component, single grid of category cards (name + count), no subcategories.
- `app/categories/[category]/page.tsx` — client component, single-level listing: search/sort/pagination + a sidebar of "other categories". This is the pattern the new category **aggregate** page reuses.
- `app/dashboard/softwares/add/page.tsx` (and `edit/[id]/page.tsx`) — category is a plain `<input type="text">` in `basicInfo.category`, sent as a form field.
- `data/ehr-emr-software-seed.json` and `scripts/seed-ehr.ts` / `scripts/seed-emr-list.ts` — existing seed data, all tagged with the string category `"EHR/EMR"`. This is the only real category populated with meaningful data today.
- `lib/fa-icons.tsx` — a wrapper module re-exporting FontAwesome icons as named React components (e.g. `Box`, `Star`, `Filter`, `ArrowLeft`), imported by name elsewhere in the app. This is the established icon pattern to extend for category icons.
- Per user's standing note (`vps_deploy_prisma_db_push` memory): schema changes require SSH'ing into the VPS and running `npx prisma db push` after deploy — the migration step in this spec must be called out explicitly for that reason.
- The source taxonomy (27 categories, ~300+ subcategories) was transcribed in this conversation from a screenshot of softwarefinder.com's `/categories` page across 10 image crops. Category names observed, in order: Accounting Software, Agriculture Software, Analytics Tools & Software, Artificial Intelligence Software, Auto Repair Software, Call Center Software, CMMS Software, Collaboration and Productivity Software, Construction Management Software, Content Management Software, CRM Software, Customer Service Software, CyberSecurity, Design Software, E-Commerce Software, EMR Software, Enterprise Resource Planning Software, Event Management Software, Facility Management Software, Field Service Software, Fleet Management Software, Governance Risk & Compliance Software, Hotel Management Software, Human Resource Software, Insurance Software, IT Management Software, Legal Software.

## Goals

- A public `/categories` index page listing all ~27 categories, each showing its full list of subcategories (mega-index layout), matching the reference structure.
- Every category and subcategory exists as a real, addressable, SEO-friendly page even with zero software assigned yet.
- Existing and future `Software` rows are always assigned to a specific subcategory (leaf), with a generated "General [Category]" catch-all subcategory per category for software that doesn't fit a specific niche.
- Existing `Software.category = "EHR/EMR"` data is migrated losslessly onto the new taxonomy with no orphaned rows.
- Admins/vendors can pick a Category then Subcategory via cascading native selects when creating/editing software.
- No regression to existing category-page functionality (search, sort, pagination) — it's extended to two levels, not replaced.

## Non-Goals

- No dedicated taxonomy-management CRUD UI in the dashboard (deferred; taxonomy is seeded via script and stable).
- No searchable combobox/autocomplete component for the category/subcategory picker (native cascading `<select>` is sufficient for v1).
- No change to how `Software`'s other fields (ratings, reviews, specifications, etc.) work.
- No guarantee that every subcategory has real software behind it at launch — most start empty by design (directory skeleton, populated over time).
- No flat/global-unique subcategory slugs — subcategory URLs are nested under their category.

## Design

### 1. Data model

```prisma
model Category {
  id            String        @id @default(cuid())
  name          String        @unique
  slug          String        @unique
  icon          String?       // key into the icon-name map in lib/fa-icons.tsx
  order         Int           @default(0)
  subcategories Subcategory[]
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  @@index([slug])
}

model Subcategory {
  id         String     @id @default(cuid())
  name       String
  slug       String
  isGeneral  Boolean    @default(false)
  order      Int        @default(0)
  categoryId String
  category   Category   @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  softwares  Software[]
  createdAt  DateTime   @default(now())

  @@unique([categoryId, name])
  @@unique([categoryId, slug])
  @@index([categoryId])
}
```

Subcategory slugs are unique **per category**, not globally — the nested URL (`/categories/[category]/[subcategory]`) means the leaf page is always looked up by `categoryId` + `slug` together, so two different categories are free to each have a same-named subcategory (e.g. a generic name that recurs across verticals) without a seed collision.

`Software` model changes:
- Remove `category String?`.
- Add `subcategoryId String?` + `subcategory Subcategory? @relation(fields: [subcategoryId], references: [id], onDelete: SetNull)`.
- Add `@@index([subcategoryId])`.

`subcategoryId` stays nullable (mirroring the current nullable `category`) so an in-progress/draft software row is never blocked from saving without a classification, but the dashboard form pushes toward always setting one.

### 2. Seed data & migration

A new file, `data/categories-seed.json`, holds the transcribed taxonomy:

```json
[
  {
    "name": "Accounting Software",
    "icon": "Calculator",
    "subcategories": [
      "Accounting Practice Management Software",
      "Accounts Payable Software",
      "...",
      "Small Business Invoicing Software"
    ]
  },
  { "name": "Agriculture Software", "icon": "Tractor", "subcategories": ["Crop Management Software", "..."] },
  ...
]
```

- 27 category entries, in the order listed in Context, each with its full subcategory list as transcribed from the screenshots.
- A migration/seed script, `scripts/seed-categories.ts` (matching the existing `scripts/seed-*.ts` convention):
  1. Upsert each `Category` (name, slug via the existing `slugify` helper, icon, order = array index).
  2. For each category, upsert its subcategories (slug via `slugify`, order = array index within the category).
  3. For each category, additionally upsert one `isGeneral: true` subcategory named `"General {category.name}"` (e.g. "General EMR Software"), placed first (`order: -1`) so it sorts above the specific subcategories in any picker.
  4. Backfill pass: for each distinct existing `Software.category` string value (today, just `"EHR/EMR"`), fuzzy-match (case-insensitive substring/alias match) against `Category.name`. `"EHR/EMR"` matches `"EMR Software"`. Assign every `Software` row with that string to the matched category's General subcategory.
  5. Any existing software whose `category` string doesn't fuzzy-match any seeded category falls back to a 28th category, `"Other Software"`, with its own `"General Other Software"` subcategory — created only if needed, so no row is ever orphaned.
- Running order: add schema fields → `npx prisma db push` → run `scripts/seed-categories.ts` → verify (see Testing) → drop the old `category` column via `db push` only after backfill is confirmed. Per the standing VPS note, this whole sequence must be repeated on the VPS after deploy, not just locally.

### 3. Public routes

Building on the existing `app/categories/` folder:

- **`/categories`** (`app/categories/page.tsx`, rewritten) — mega-index. Fetches all categories with nested subcategories (no per-subcategory counts needed here — showing "0 softwares" on most links would look broken, so the index just lists names as plain links). Each category renders as a card: icon + name header, subcategory names in a 3-column grid, each linking to its leaf page.
- **`/categories/[category]`** (existing file, extended) — aggregate page. Header + a sidebar/chip list of the category's subcategories (linking to leaf pages) replacing the current "other categories" sidebar. Software list is blended across every subcategory under this category (`where: { subcategory: { categoryId } }`), reusing the existing search/sort/pagination UI unchanged.
- **`/categories/[category]/[subcategory]`** (new file, `app/categories/[category]/[subcategory]/page.tsx`) — leaf page. Structurally a near-copy of the aggregate page's list/search/sort/pagination, scoped to `where: { subcategoryId }`. Sidebar shows sibling subcategories under the same parent category.

### 4. Server actions (`app/dashboard/softwares/actions.ts`)

- `getCategories()` — rewritten to `prisma.category.findMany({ orderBy: { order: "asc" }, include: { subcategories: { orderBy: { order: "asc" } } } })`, with software counts via `_count` on subcategories, summed per category.
- `getCategoryWithSubcategories(categorySlug)` — new; powers the aggregate page header + sidebar.
- `getSoftwaresByCategory(categorySlug, opts)` — rewritten to filter through the subcategory relation instead of string `in`.
- `getSoftwaresBySubcategory(categorySlug, subcategorySlug, opts)` — new; powers the leaf page.
- The hero/navbar search-to-category resolver — updated to resolve a matched software to its subcategory's nested URL (`/categories/{categorySlug}/{subcategorySlug}`), falling back to the category aggregate URL if the software has no subcategory.

### 5. Dashboard & CSV

- `app/dashboard/softwares/add/page.tsx` and `edit/[id]/page.tsx`: replace the free-text category `<input>` with two cascading native `<select>` elements. Taxonomy (categories + nested subcategories) loads once via `getCategories()`. Selecting a Category populates the Subcategory `<select>`'s options, with that category's "General ..." entry listed first. Form submits `subcategoryId` only.
- `app/dashboard/softwares/page.tsx` (list/filter) and the CSV bulk importer: both currently key off the raw `category` string. Importer resolves `category`/`subcategory` name columns against the seeded taxonomy (case-insensitive match); unmatched rows are assigned to `Other Software → General Other Software` and listed in the import summary as "uncategorized — review", rather than failing the row.
- Dashboard analytics category-breakdown chart: switch from string `groupBy` to grouping through the `Subcategory.category` relation.

### 6. Icons

`lib/fa-icons.tsx` gains ~20 new named exports following its existing pattern (e.g. `faCalculator`, `faTractor`, `faRobot`, `faHardHat`, `faScaleBalanced`, `faUmbrella`), reusing already-imported icons where they fit (`faHeartPulse` for EMR, `faShieldHalved` for CyberSecurity, `faGear` for IT Management). `Category.icon` stores the exported component's name as a string; rendering looks it up from a small `iconMap` keyed by that string, falling back to a generic icon (e.g. `Box`) if a name doesn't resolve — so a bad/missing icon key never crashes a page.

## Testing

Following this repo's existing convention (standalone scripts under `scripts/`, run via `npx tsx`, using `node:assert/strict` — no test framework is configured):

- `scripts/verify-categories-seed.ts` (new): asserts exactly 27 (or 28, if the "Other Software" fallback was created) categories exist; asserts the total subcategory count matches the transcribed source data; asserts every `Category` has exactly one `isGeneral` subcategory; asserts every existing `Software` row has a non-null `subcategoryId` post-backfill; asserts the fallback category (if present) only contains rows that genuinely didn't fuzzy-match.
- `npm run build` and `tsc --noEmit` must pass with no new errors.
- Manual check: load `/categories` and confirm all 27 cards render with icons and full subcategory grids; click into a subcategory with real software (an EMR one) and confirm the existing EHR/EMR seed data shows up correctly; click into an empty subcategory and confirm the existing "no softwares found" empty state still renders correctly; add/edit a software via the dashboard form and confirm the cascading selects work and persist the right `subcategoryId`.
