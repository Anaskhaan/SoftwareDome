# SoftwareDome — Complete Project Guide

> A B2B Software Directory platform where vendors list their software products, users write reviews, and admins manage everything — built with Next.js 16, PostgreSQL, and OTP-based authentication.

---

## Table of Contents

1. [What Is This Project?](#1-what-is-this-project)
2. [Tech Stack Overview](#2-tech-stack-overview)
3. [Folder Structure](#3-folder-structure)
4. [Database — Prisma Schema & Relationships](#4-database--prisma-schema--relationships)
5. [Authentication System](#5-authentication-system)
6. [User Roles & Permissions](#6-user-roles--permissions)
7. [Routing — Pages & API](#7-routing--pages--api)
8. [Server Actions vs API Routes](#8-server-actions-vs-api-routes)
9. [File Uploads — Cloudinary](#9-file-uploads--cloudinary)
10. [Email System](#10-email-system)
11. [Components Architecture](#11-components-architecture)
12. [Dashboard System](#12-dashboard-system)
13. [Performance — ISR & Caching](#13-performance--isr--caching)
14. [Environment Variables](#14-environment-variables)
15. [Data Flow Diagrams](#15-data-flow-diagrams)

---

## 1. What Is This Project?

SoftwareDome is a **software discovery platform** — think G2 or Capterra but your own. It has three audiences:

| Who | What they do |
|-----|-------------|
| **Visitors** | Browse software listings, read reviews, read blogs, request demos |
| **Vendors** | Submit their own software, manage their listings, view demo requests |
| **Admins** | Manage all content — users, vendors, software, blogs, demo requests |

The flow in one sentence: *A vendor signs up with a business email → gets OTP-verified → lists their software → visitors find and review it → admin oversees everything.*

---

## 2. Tech Stack Overview

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                         │
│  Next.js 16 (App Router) + React 19 + Tailwind 4   │
│  Fonts: Geist, Sora   Icons: Lucide + FontAwesome   │
│  Charts: Recharts                                    │
└───────────────────────┬─────────────────────────────┘
                        │  Server Actions / API Routes
┌───────────────────────▼─────────────────────────────┐
│                    BACKEND                          │
│  Next.js Route Handlers (API) + Server Actions      │
│  Auth: JWT (jose) + bcrypt   Email: Nodemailer      │
│  File Upload: Multer → Cloudinary                   │
└───────────────────────┬─────────────────────────────┘
                        │  Prisma ORM
┌───────────────────────▼─────────────────────────────┐
│                   DATABASE                          │
│  PostgreSQL (Neon — serverless cloud Postgres)      │
│  Prisma v7 with Neon adapter                        │
└─────────────────────────────────────────────────────┘
```

### Why Each Choice Was Made

- **Next.js 16 App Router** — Combines frontend and backend in one project. No separate Express server needed.
- **PostgreSQL on Neon** — Neon is a serverless Postgres service. No server to manage; scales automatically.
- **Prisma ORM** — Instead of writing raw SQL, you define models in a schema file and Prisma generates type-safe code. Auto-complete works perfectly.
- **JWT (jose)** — JSON Web Tokens. After login, the server creates a signed token and stores it in the browser cookie. Every future request carries that token to prove who you are.
- **Cloudinary** — Cloud service for storing images. When a user uploads a logo or blog cover, it goes to Cloudinary and you get back a URL to store in the database.
- **Nodemailer** — Sends emails (OTPs, contact forms, demo requests) through a Gmail account.

---

## 3. Folder Structure

```
SoftwareDome/
│
├── app/                    ← All pages + API routes (Next.js App Router)
│   ├── layout.tsx          ← Root HTML shell (fonts, metadata)
│   ├── page.tsx            ← Home page "/"
│   ├── globals.css         ← Tailwind + design tokens (colors, fonts)
│   ├── generated/prisma/   ← Auto-generated Prisma client (don't touch)
│   │
│   ├── about/              ← /about page
│   ├── blog/               ← /blog list + /blog/[slug] detail
│   ├── categories/         ← /categories + /categories/[category]
│   ├── softwares/[slug]/   ← /softwares/crm-pro (software detail page)
│   ├── login/              ← /login (unified sign-in + sign-up)
│   ├── verify-otp/         ← /verify-otp (OTP entry form)
│   ├── write-review/       ← /write-review
│   ├── submit/             ← /submit (vendor submits software)
│   │
│   ├── dashboard/          ← Protected admin/vendor area
│   │   ├── layout.tsx      ← Dashboard shell (sidebar + topbar)
│   │   ├── page.tsx        ← Analytics overview
│   │   ├── blogs/          ← Blog CRUD
│   │   ├── softwares/      ← Software CRUD
│   │   ├── users/          ← User management (ADMIN only)
│   │   ├── vendors/        ← Vendor management (ADMIN only)
│   │   ├── demo-requests/  ← Demo requests list
│   │   └── actions.ts      ← Shared server actions for dashboard
│   │
│   └── api/                ← REST API endpoints
│       ├── auth/           ← login, logout, register, send-otp, me
│       ├── blogs/          ← Blog CRUD endpoints
│       ├── softwares/      ← Software endpoints
│       ├── upload/         ← Cloudinary upload handler
│       └── users/          ← User list endpoint
│
├── components/             ← All React components
│   ├── Navbar.tsx          ← Top navigation bar
│   ├── Footer.tsx
│   ├── Hero.tsx            ← Homepage hero (server component)
│   ├── HeroSearch.tsx      ← Search input (client component)
│   ├── SoftwareSection.tsx ← Software cards grid
│   ├── BlogsSection.tsx
│   ├── dashboard/          ← Dashboard-specific components
│   │   ├── Sidebar.tsx     ← Side navigation
│   │   ├── Navbar.tsx      ← Top navbar for dashboard
│   │   └── ui/             ← Reusable UI: Button, Card, Input, Modal...
│   ├── legal/              ← Legal page templates
│   └── constantComponents/ ← Shared: CustomTable, DownloadExcel
│
├── lib/                    ← Business logic helpers
│   ├── prisma.ts           ← Prisma client singleton
│   ├── jwt.ts              ← Sign/verify JWT tokens
│   ├── mail.ts             ← Email sending functions
│   ├── auth-utils.ts       ← Business email validation
│   ├── cloudinary.ts       ← Cloudinary SDK setup
│   ├── require-dashboard.ts← Server-side auth check for dashboard
│   └── require-admin.ts    ← Server-side admin-only check
│
├── hooks/
│   └── useInView.ts        ← Scroll animation trigger hook
│
├── prisma/
│   └── schema.prisma       ← Database model definitions
│
├── data/                   ← Seed data (EHR/EMR software list)
├── public/                 ← Static files (logo.svg, hero.png)
├── middleware.ts           ← JWT check before dashboard routes load
├── next.config.ts          ← Next.js config (image domains, server actions)
└── .env                    ← Secret credentials (never commit this)
```

---

## 4. Database — Prisma Schema & Relationships

### What is Prisma?

Prisma is an ORM (Object-Relational Mapper). You describe your database tables as "models" in `prisma/schema.prisma`, and Prisma generates TypeScript code so you can do `prisma.user.findMany()` instead of writing `SELECT * FROM users`.

### The Models

```
┌──────────────┐       ┌──────────────────┐
│ Organization │──────<│      User         │
│              │ 1:M   │ id, email, name   │
│ id           │       │ role (USER/ADMIN  │
│ name         │       │        /VENDOR)   │
│ domain       │       │ organizationId    │
└──────────────┘       └────┬─────┬────────┘
                            │     │
                     writes │     │ lists (as vendor)
                            │     │
               ┌────────────▼┐   ┌▼───────────────────┐
               │   Review    │   │     Software        │
               │             │   │                     │
               │ content     │   │ name, slug, logo    │
               │ userId ─────┘   │ category, rating    │
               │ softwareId──────│ pros, cons          │
               └─────────────┘   │ faqs (JSON)         │
                                 │ vendorId (→ User)   │
                                 └──────────┬──────────┘
                                            │
                                    receives│
                                 ┌──────────▼──────────┐
                                 │    DemoRequest      │
                                 │                     │
                                 │ name, email, phone  │
                                 │ organization        │
                                 │ softwareId          │
                                 └─────────────────────┘

┌──────────────┐
│     Blog     │
│              │
│ title, slug  │
│ content      │
│ status(enum) │
│ authorId ────→ User
└──────────────┘

┌───────────────────┐
│ VerificationToken │
│                   │
│ email, token      │
│ expires           │
└───────────────────┘
```

### Model Breakdown

#### User
```prisma
model User {
  id              String   @id @default(cuid())
  email           String   @unique
  name            String?
  role            UserRole @default(USER)  // USER | ADMIN | VENDOR
  isEmailVerified Boolean  @default(false)
  organizationId  String?
  organization    Organization? @relation(...)
  reviews         Review[]
  blogs           Blog[]
  software        Software[]   // software they listed as vendor
}
```
- Every person is a `User`.
- `role` controls what they can do.
- A vendor user can have many `Software` entries linked to them via `vendorId`.

#### Organization
```prisma
model Organization {
  id     String @id @default(cuid())
  name   String
  domain String @unique   // "acme.com"
  users  User[]
}
```
- When a business email like `john@acme.com` signs up, it extracts `acme.com` as the domain.
- All users from the same domain are grouped under one Organization.
- This is how you know multiple people work at the same company.

#### Software
```prisma
model Software {
  id           String   @id @default(cuid())
  name         String
  slug         String   @unique   // "my-crm-pro" → URL: /softwares/my-crm-pro
  vendorId     String?
  vendor       User?    @relation(...)
  reviews      Review[]
  demoRequests DemoRequest[]
  faqs         Json?    // stored as JSON blob
  specifications Json?
  sentiments   Json?
}
```
- `slug` is the URL-friendly version of the name (used in `/softwares/[slug]`).
- `vendorId` ties the software to its vendor user.
- `faqs`, `specifications`, `sentiments` are stored as JSON — flexible key-value data that doesn't need its own table.

#### Review
```prisma
model Review {
  userId     String
  softwareId String
  user       User     @relation(...)
  software   Software @relation(...)
  @@unique([userId, softwareId])  // one review per user per software
}
```
- The `@@unique` constraint means one user can only review each software once.
- If the user or software is deleted, the review is also deleted (cascade).

#### Blog
```prisma
model Blog {
  slug      String    @unique
  status    BlogStatus @default(DRAFT)  // DRAFT | PUBLISHED | ARCHIVED
  authorId  String
  author    User @relation(...)
}
```
- Blogs have a lifecycle: draft → published → archived.
- Only published blogs appear on the public `/blog` page.

#### VerificationToken
```prisma
model VerificationToken {
  email   String
  token   String
  expires DateTime
  @@unique([email, token])
}
```
- Stores OTP codes temporarily.
- When someone requests an OTP, a record is created here with an expiry.
- After verification, the token is deleted.

---

## 5. Authentication System

SoftwareDome uses **OTP (One-Time Password) email verification** instead of traditional password-only login.

### The Complete Auth Flow

```
User types email on /login
          │
          ▼
POST /api/auth/send-otp
  → Validates it's a business email (not gmail/yahoo)
  → Generates 6-digit OTP
  → Saves to VerificationToken table (expires in 10 min)
  → Sends OTP to user's email via Nodemailer
          │
          ▼
User sees OTP in email, types it on /verify-otp
          │
          ▼
POST /api/auth/login  (or /register for new users)
  → Looks up VerificationToken in DB
  → Checks it hasn't expired
  → Deletes the token (single-use)
  → Creates/updates User record
  → Signs a JWT token with { userId, email, role }
  → Sets JWT in HTTP-only cookie "auth_token" (24h)
          │
          ▼
User is logged in — every request to /dashboard/*
carries the auth_token cookie automatically
```

### JWT Explained

JWT = JSON Web Token. It looks like: `xxxxx.yyyyy.zzzzz`

- **Header** (xxxxx): algorithm used (HS256)
- **Payload** (yyyyy): base64-encoded data `{ userId, email, role, exp }`
- **Signature** (zzzzz): HMAC of header+payload using your `JWT_SECRET`

The signature means no one can forge a token without knowing your secret. The server verifies the signature on every request.

### Middleware Protection

`middleware.ts` runs before any `/dashboard/*` page loads:

```typescript
// Simplified logic
1. Read "auth_token" cookie from request
2. If missing → redirect to /login
3. Verify JWT signature using JWT_SECRET
4. If invalid/expired → redirect to /login
5. Check role === "ADMIN" or "VENDOR"
6. If vendor trying to access /dashboard/users → redirect away
7. Otherwise → let the request through
```

### lib/require-dashboard.ts

Inside server components/actions, this helper does an additional check:
```typescript
// Gets the current user from the JWT, fetches fresh data from DB
const user = await requireDashboard();
// Throws if not authenticated
```

---

## 6. User Roles & Permissions

```
                    ADMIN
                   /     \
              can do      can manage
            everything    everyone
                │
         ┌──────┴──────┐
         │             │
       VENDOR         USER
    (own listings)  (public)
```

### What Each Role Can Do

| Feature | USER | VENDOR | ADMIN |
|---------|------|--------|-------|
| Browse software | ✅ | ✅ | ✅ |
| Write reviews | ✅ | ✅ | ✅ |
| Request demo | ✅ | ✅ | ✅ |
| Access dashboard | ❌ | ✅ | ✅ |
| Manage own software | ❌ | ✅ | ✅ |
| View demo requests | ❌ | ✅ (own) | ✅ (all) |
| Manage blogs | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ✅ |
| Manage vendors | ❌ | ❌ | ✅ |
| Dashboard settings | ❌ | ❌ | ✅ |

### Where Is This Enforced?

1. **`middleware.ts`** — Blocks dashboard access entirely for non-authenticated users, and blocks specific routes for VENDOR role.
2. **`lib/require-admin.ts`** — Used inside server actions to throw if the user isn't ADMIN.
3. **`lib/require-dashboard.ts`** — Used inside server actions to throw if the user isn't logged in at all.
4. **Dashboard UI** — Navigation links conditionally render based on role.

---

## 7. Routing — Pages & API

### How Next.js App Router Works

Every folder inside `app/` with a `page.tsx` becomes a URL route.

```
app/page.tsx                    →  /
app/about/page.tsx              →  /about
app/blog/page.tsx               →  /blog
app/blog/[slug]/page.tsx        →  /blog/my-post-title
app/softwares/[slug]/page.tsx   →  /softwares/crm-pro
app/categories/[category]/page.tsx → /categories/crm
app/dashboard/page.tsx          →  /dashboard
app/dashboard/blogs/page.tsx    →  /dashboard/blogs
```

The `[slug]` part is a **dynamic segment** — Next.js captures whatever is in that URL position and passes it as a prop called `params.slug`.

### API Routes

Every folder inside `app/api/` with a `route.ts` becomes an API endpoint.

```
app/api/auth/login/route.ts      →  POST /api/auth/login
app/api/blogs/route.ts           →  GET /api/blogs
app/api/blogs/[id]/route.ts      →  GET/PUT/DELETE /api/blogs/123
app/api/upload/route.ts          →  POST /api/upload
```

A `route.ts` exports named functions matching HTTP methods:
```typescript
export async function GET(request: Request) { ... }
export async function POST(request: Request) { ... }
export async function PUT(request: Request) { ... }
export async function DELETE(request: Request) { ... }
```

### Layouts

`layout.tsx` files wrap child pages. They nest:

```
app/layout.tsx          ← Wraps EVERYTHING (fonts, global CSS)
  └── app/dashboard/layout.tsx   ← Wraps only /dashboard/* (sidebar + topbar)
        └── app/dashboard/blogs/page.tsx
```

---

## 8. Server Actions vs API Routes

This project uses **both**. Understanding the difference is important.

### API Routes (`app/api/**/route.ts`)

- Classic REST endpoints, called with `fetch('/api/...')`
- Used for: auth (login/logout/register), file uploads, external callers
- Returns JSON responses

### Server Actions (`actions.ts` files)

- Functions that run on the server but are called directly from React components
- No `fetch` needed — just import and call the function
- Used for: dashboard data fetching, CRUD operations, form submissions
- Returns data directly (TypeScript types, not JSON)

```typescript
// In a Server Component:
import { getSoftwares } from './actions'

export default async function SoftwarePage() {
  const softwares = await getSoftwares()  // runs on server, no HTTP call
  return <SoftwareList items={softwares} />
}
```

### When Is Each Used?

| Situation | Use |
|-----------|-----|
| Login/logout (needs cookie manipulation) | API Route |
| File upload (needs multipart parsing) | API Route |
| Dashboard data loading | Server Action |
| CRUD from dashboard forms | Server Action |
| Reading current user | API Route (`/api/auth/me`) |

---

## 9. File Uploads — Cloudinary

### The Upload Flow

```
User picks a file in the browser
          │
          ▼
Client sends FormData to POST /api/upload
          │
          ▼
Multer (middleware) parses the multipart form data
          │
          ▼
multer-storage-cloudinary streams the file
directly to Cloudinary (no local disk needed)
          │
          ▼
Cloudinary returns a secure URL
          │
          ▼
API route responds with { url: "https://res.cloudinary.com/drirmbeo0/..." }
          │
          ▼
Client stores this URL in state
          │
          ▼
When form is submitted, the URL is saved to the database
```

### Where Uploads Are Used

- **Software listings** — logo image
- **Blog posts** — cover image, inline images
- **User profiles** — avatar

### next.config.ts Image Domains

```typescript
images: {
  remotePatterns: [{
    hostname: 'res.cloudinary.com',
    pathname: '/drirmbeo0/**'
  }]
}
```
This tells Next.js's `<Image>` component that Cloudinary URLs are safe to optimize.

---

## 10. Email System

All emails go through `lib/mail.ts` using **Nodemailer** with Gmail.

### Email Functions

| Function | When Called | Content |
|----------|-------------|---------|
| `sendOTPEmail()` | User requests OTP | 6-digit code |
| `sendContactEmail()` | Contact form submitted | User's message |
| `sendDemoRequestEmail()` | Demo requested | Requester's details |
| `sendProductSubmissionEmail()` | Software submitted | Submission details |

### Gmail Setup

Uses an **App Password** (not your real Gmail password). You enable 2FA on Gmail, then create an App Password — a 16-character code that Nodemailer uses to send mail on behalf of your Gmail.

```
GMAIL_USER=mashhoodbutt47@gmail.com
GMAIL_PASS=xxxx xxxx xxxx xxxx    ← App password, not real password
```

### Business Email Validation

`lib/auth-utils.ts` blocks sign-up with personal email domains:

```typescript
const BLOCKED_DOMAINS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', ...]

function isBusinessEmail(email: string): boolean {
  const domain = email.split('@')[1]
  return !BLOCKED_DOMAINS.includes(domain)
}
```

This ensures only companies (with their own domain) can sign up as vendors.

---

## 11. Components Architecture

### Two Separate UI Worlds

```
Public Site                    Dashboard
────────────────               ────────────────────────
Navbar.tsx                     dashboard/Sidebar.tsx
Footer.tsx                     dashboard/Navbar.tsx
Hero.tsx (server)              dashboard/ui/Button.tsx
HeroSearch.tsx (client)        dashboard/ui/Card.tsx
SoftwareSection.tsx            dashboard/ui/Input.tsx
BlogsSection.tsx               dashboard/ui/Modal.tsx
DemoRequestForm.tsx            dashboard/ui/Charts.tsx
SoftwareReviews.tsx            dashboard/ui/Toast.tsx
                               dashboard/ui/Pagination.tsx
```

### Server vs Client Components

Next.js 16 defaults all components to **Server Components** (run only on the server, no JS sent to browser). You must explicitly opt into being a **Client Component** with `"use client"` at the top of the file.

| | Server Component | Client Component |
|--|--|--|
| `"use client"` at top | No | Yes |
| Can use `useState`, `useEffect` | No | Yes |
| Can fetch data directly | Yes | No (use API) |
| JS sent to browser | No | Yes |
| Good for | Data display, static content | Forms, interactions, animations |

**Example in this project:**
- `Hero.tsx` — Server Component. Fetches software count from DB directly.
- `HeroSearch.tsx` — Client Component. Has `useState` for the search input.

### The `useInView` Hook

`hooks/useInView.ts` uses the browser's `IntersectionObserver` API to detect when an element scrolls into view — used to trigger animations so they play when visible, not immediately on page load.

---

## 12. Dashboard System

### Dashboard Layout Structure

```
/dashboard/* routes all share:

┌─────────────────────────────────────────┐
│              Top Navbar                 │  ← dashboard/Navbar.tsx
├──────────────┬──────────────────────────┤
│              │                          │
│   Sidebar    │    Page Content          │
│              │    (changes per route)   │
│  • Overview  │                          │
│  • Softwares │                          │
│  • Blogs     │                          │
│  • Users     │                          │
│  • Vendors   │                          │
│  • Requests  │                          │
│              │                          │
└──────────────┴──────────────────────────┘
```

This is done with `app/dashboard/layout.tsx` which renders the sidebar/navbar and a `{children}` slot where each page's content appears.

### Dashboard Analytics Page

`app/dashboard/page.tsx` calls `getDashboardAnalytics()` which returns:
- Total counts: software, users, blogs, demo requests
- 6-month trend data (for line charts)
- Category breakdown (for pie/bar charts)
- Top vendors list

Charts are rendered using **Recharts** — a React charting library.

### Software Management Flow

```
ADMIN/VENDOR opens /dashboard/softwares
    │
    ├── See list of all software (admin) or own software (vendor)
    │
    ├── Click "Add Software" → /dashboard/softwares/add
    │       Fill form → Server Action: createSoftware()
    │       → Saves to DB → redirects back to list
    │
    ├── Click "Edit" → /dashboard/softwares/edit/[id]
    │       Pre-filled form → Server Action: updateSoftware()
    │       → Updates DB → redirects back
    │
    └── Click "Delete" → Server Action: deleteSoftware()
            → Removes from DB (cascade deletes reviews + demo requests)
```

### CSV Import

Admins can bulk-import software via CSV. The `importSoftwaresFromCSV()` server action:
1. Accepts a CSV file
2. Parses it with the `csv-parse` library
3. Loops through rows and creates Software records in bulk

The `data/` folder contains pre-existing EHR/EMR software data for seeding.

---

## 13. Performance — ISR & Caching

### ISR (Incremental Static Regeneration)

The home page (`app/page.tsx`) uses ISR:

```typescript
export const revalidate = 600  // 10 minutes
```

**What this means:**
- The first visitor gets the page generated fresh from DB
- Next.js caches that HTML
- For the next 10 minutes, all visitors get the cached version instantly (no DB call)
- After 10 minutes, the next request triggers a fresh regeneration in the background
- This means fast load times without sacrificing fresh data

### Server Action Caching

```typescript
import { unstable_cache } from 'next/cache'

const getSoftwares = unstable_cache(
  async () => prisma.software.findMany(),
  ['softwares'],
  { revalidate: 600, tags: ['softwares'] }
)
```

**Cache invalidation with tags:** When a software is updated/created/deleted, the action calls `revalidateTag('softwares')`, which clears the cached result so the next fetch gets fresh data.

### Hero Split (Server/Client)

The Hero section was split into two components:
- `Hero.tsx` — Server Component. Renders above-the-fold content immediately with no JS.
- `HeroSearch.tsx` — Client Component. Only loads the interactive search input.

This reduces the JavaScript sent to the browser, making the page load faster on mobile.

---

## 14. Environment Variables

All secrets live in `.env` (never committed to git). Here is what each does:

```bash
# PostgreSQL database connection (from Neon dashboard)
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"

# Gmail credentials for sending emails
GMAIL_USER="sender@gmail.com"
GMAIL_PASS="xxxx xxxx xxxx xxxx"   # Gmail App Password

# Cloudinary (from cloudinary.com dashboard)
CLOUDINARY_CLOUD_NAME="drirmbeo0"
CLOUDINARY_API_KEY="123456789"
CLOUDINARY_API_SECRET="abc123..."

# Secret key for signing JWT tokens (any random string, keep it secret)
JWT_SECRET="some-very-long-random-string-here"
```

**Rule:** If a secret leaks, assume it's compromised. Rotate it immediately in the respective service (Neon, Gmail, Cloudinary) and update `.env`.

---

## 15. Data Flow Diagrams

### Visitor Views a Software Listing

```
Browser requests /softwares/crm-pro
          │
          ▼
Next.js checks cache (ISR/unstable_cache)
  └─ Cache hit → return cached HTML immediately
  └─ Cache miss:
          │
          ▼
getSoftwareBySlug('crm-pro') server action runs
          │
          ▼
Prisma: SELECT * FROM softwares WHERE slug = 'crm-pro'
  Include: reviews (with user names), vendor name
          │
          ▼
React renders Software Detail page with data
          │
          ▼
HTML sent to browser (fast, no JS needed for initial render)
```

### Vendor Submits New Software

```
Vendor fills /dashboard/softwares/add form
          │
          ▼
Uploads logo → POST /api/upload
  → Cloudinary returns URL
          │
          ▼
Clicks Save → calls createSoftware() server action
          │
          ▼
lib/require-dashboard.ts → verifies JWT cookie
          │
          ▼
Prisma: INSERT INTO softwares (name, slug, logo, vendorId, ...)
          │
          ▼
revalidateTag('softwares') → clears software cache
          │
          ▼
redirect('/dashboard/softwares')
```

### User Requests a Demo

```
Visitor fills DemoRequestForm on /softwares/crm-pro
          │
          ▼
POST /api/demo-requests (or server action)
          │
          ▼
Prisma: INSERT INTO demo_requests (name, email, softwareId, ...)
          │
          ▼
sendDemoRequestEmail() → Nodemailer → Gmail → vendor's inbox
          │
          ▼
Vendor sees it in /dashboard/demo-requests
```

---

## Quick Reference

### Adding a New Page

1. Create `app/your-page/page.tsx`
2. It's automatically available at `/your-page`
3. If it needs auth, add a check using `lib/require-dashboard.ts`

### Adding a New API Endpoint

1. Create `app/api/your-endpoint/route.ts`
2. Export `GET`, `POST`, etc. functions
3. Available at `/api/your-endpoint`

### Adding a New Database Model

1. Add it to `prisma/schema.prisma`
2. Run `npx prisma db push` (updates the database)
3. Prisma auto-regenerates the client in `app/generated/prisma/`
4. Use it: `import { prisma } from '@/lib/prisma'`

### Deploying Changes

1. Push code to git
2. If schema changed: SSH into VPS and run `npx prisma db push`
3. Vercel (or your host) auto-deploys from git

---

*This guide reflects the project state as of June 2026.*
