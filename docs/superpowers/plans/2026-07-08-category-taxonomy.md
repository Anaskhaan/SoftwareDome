# Category & Subcategory Taxonomy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the free-text `Software.category` string with a real two-level `Category` → `Subcategory` taxonomy (27 categories, ~700 subcategories, seeded from the softwarefinder.com reference taxonomy), with public browse pages at three levels and a cascading picker in the dashboard.

**Architecture:** Two new Prisma models (`Category`, `Subcategory`) with `Software.subcategoryId` replacing `Software.category`. A seed script populates the full taxonomy plus one auto-generated "General [Category]" catch-all subcategory per category; a backfill script migrates the 45 existing `Software` rows (all currently tagged `category: "emr-software"`) onto the matching subcategory. New server actions in `app/categories/actions.ts` power three route levels: `/categories` (mega-index), `/categories/[category]` (aggregate), `/categories/[category]/[subcategory]` (leaf). The dashboard software form gets cascading native `<select>`s.

**Tech Stack:** Next.js 16 App Router, Prisma (PostgreSQL via Neon), Server Actions, `tsx` for standalone scripts (this repo has no test framework — verification is via standalone scripts using `node:assert/strict`, plus `npm run build`/`tsc --noEmit`).

## Global Constraints

- Schema changes must be followed by `npx prisma db push` locally, **and** the same command must be re-run on the VPS after deploy (per the project's standing deployment note) — call this out at the end of the plan.
- No new npm dependencies.
- Subcategory slugs are unique **per category** (`@@unique([categoryId, slug])`), not globally.
- Every category gets exactly one `isGeneral: true` subcategory, named `"General {category.name}"`.
- `Software.subcategoryId` stays nullable throughout (mirrors the current nullable `category`).
- Do not drop `Software.category` from the schema until the backfill (Task 4) is verified complete — every task before the final cleanup (Task 14) must leave the app in a working, buildable state with both fields coexisting.

---

### Task 1: Prisma schema — Category & Subcategory models (additive)

**Files:**
- Modify: `prisma/schema.prisma`

**Interfaces:**
- Produces: `Category` model (`id`, `name`, `slug`, `icon`, `order`, `subcategories`), `Subcategory` model (`id`, `name`, `slug`, `isGeneral`, `order`, `categoryId`, `category`, `softwares`), and `Software.subcategoryId` / `Software.subcategory` — all later tasks depend on these exact field names.

- [ ] **Step 1: Add the two new models and the `Software.subcategoryId` field**

Add these two models anywhere after the `Software` model in `prisma/schema.prisma`:

```prisma
model Category {
  id            String        @id @default(cuid())
  name          String        @unique
  slug          String        @unique
  icon          String?
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

Then modify the existing `Software` model: keep the existing `category String?` field untouched for now, and add a new field + relation right after it:

```prisma
model Software {
  id                String   @id @default(cuid())
  name              String
  slug              String   @unique
  logo              String?
  category          String?
  subcategoryId     String?
  subcategory       Subcategory? @relation(fields: [subcategoryId], references: [id], onDelete: SetNull)

  // ... (rest of the model is unchanged)
```

Add `@@index([subcategoryId])` alongside the model's existing `@@index([slug])` / `@@index([vendorId])` lines.

- [ ] **Step 2: Push the schema and regenerate the Prisma client**

Run: `npx prisma db push`
Expected output ends with something like:
```
Your database is now in sync with your Prisma schema.
✔ Generated Prisma Client
```

- [ ] **Step 3: Verify the new tables exist and are empty**

Run:
```bash
npx tsx -e "
import prisma from './lib/prisma';
(async () => {
  const catCount = await prisma.category.count();
  const subCatCount = await prisma.subcategory.count();
  console.log('categories:', catCount, 'subcategories:', subCatCount);
  process.exit(0);
})();
"
```
Expected output: `categories: 0 subcategories: 0`

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat: add Category and Subcategory models"
```

---

### Task 2: Add category icons to `lib/fa-icons.tsx`

**Files:**
- Modify: `lib/fa-icons.tsx`

**Interfaces:**
- Produces: 18 new named icon exports (`Calculator`, `Tractor`, `ChartLine`, `Robot`, `CarSide`, `Headset`, `Wrench`, `PeopleGroup`, `HardHat`, `AddressBook`, `Palette`, `Briefcase`, `ScrewdriverWrench`, `Truck`, `Landmark`, `Hotel`, `Umbrella`, `Scale`) — Task 3's seed data references these exact names as `Category.icon` string values, and the public category pages (Task 8) look them up by these names.

- [ ] **Step 1: Add the new FontAwesome imports**

In `lib/fa-icons.tsx`, add these to the existing `import { ... } from "@fortawesome/free-solid-svg-icons"` block (insert alphabetically isn't required — just add before the closing `} from "@fortawesome/free-solid-svg-icons";` on line 78):

```ts
  faCalculator,
  faTractor,
  faChartLine,
  faRobot,
  faCarSide,
  faHeadset,
  faWrench,
  faPeopleGroup,
  faHardHat,
  faAddressBook,
  faPalette,
  faBriefcase,
  faScrewdriverWrench,
  faTruck,
  faLandmark,
  faHotel,
  faUmbrella,
  faScaleBalanced,
```

- [ ] **Step 2: Add the new exported icon components**

Add these lines after `export const Youtube = makeIcon(faYoutube);` (the last line of the file):

```ts
export const Calculator = makeIcon(faCalculator);
export const Tractor = makeIcon(faTractor);
export const ChartLine = makeIcon(faChartLine);
export const Robot = makeIcon(faRobot);
export const CarSide = makeIcon(faCarSide);
export const Headset = makeIcon(faHeadset);
export const Wrench = makeIcon(faWrench);
export const PeopleGroup = makeIcon(faPeopleGroup);
export const HardHat = makeIcon(faHardHat);
export const AddressBook = makeIcon(faAddressBook);
export const Palette = makeIcon(faPalette);
export const Briefcase = makeIcon(faBriefcase);
export const ScrewdriverWrench = makeIcon(faScrewdriverWrench);
export const Truck = makeIcon(faTruck);
export const Landmark = makeIcon(faLandmark);
export const Hotel = makeIcon(faHotel);
export const Umbrella = makeIcon(faUmbrella);
export const Scale = makeIcon(faScaleBalanced);
```

- [ ] **Step 3: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors (existing errors, if any predate this change, are out of scope — but this specific file must not introduce new ones).

- [ ] **Step 4: Commit**

```bash
git add lib/fa-icons.tsx
git commit -m "feat: add category icons"
```

---

### Task 3: Taxonomy seed data + seed script

**Files:**
- Create: `data/categories-seed.json`
- Create: `scripts/seed-categories.ts`

**Interfaces:**
- Consumes: `Category`/`Subcategory` models from Task 1.
- Produces: 27 `Category` rows + one `isGeneral` subcategory per category + all real subcategories in the DB. Task 4 (backfill) depends on `Category.slug` values matching `slugify(category.name)` for exact-match lookup (e.g. `"EMR Software"` → `"emr-software"`).

- [ ] **Step 1: Create `data/categories-seed.json`**

This is the full taxonomy, transcribed from the softwarefinder.com screenshot analyzed earlier in this project's history, in the same category order it appeared on that page. Each category's `icon` value must be one of the exact export names added in Task 2. The `Legal Software` category's subcategory list is a confirmed **partial** list — the source screenshot was cut off at the bottom of the page before the "Legal Software" section finished rendering, so this list should be treated as a known-incomplete starting point, not a complete reference.

```json
[
  {
    "name": "Accounting Software",
    "icon": "Calculator",
    "subcategories": [
      "Accounting Practice Management Software", "Accounts Payable Software", "Accounts Receivable Software",
      "AI-Charged Accounting Tools", "Audit Software", "Bank Accounting Software",
      "Billing and Invoice Software", "Budgeting Software", "Compliance Software",
      "DCAA Compliant Accounting Software", "Debt Collection Software", "Expense Management Software",
      "Expense Report Software", "Financial Reporting Software", "Fund Management Software",
      "General Ledger Software", "Government Contract Accounting Software", "Hotel Accounting Software",
      "Insurance Accounting Software", "Investment Management Software", "Legal Accounting Software",
      "Media and Newspaper Accounting Software", "Medical Accounting Software", "Mobile Accounting",
      "Real Estate Accounting Software", "Restaurant Accounting Software", "Sales Tax Software",
      "School Accounting Software", "Small Business Invoicing Software"
    ]
  },
  {
    "name": "Agriculture Software",
    "icon": "Tractor",
    "subcategories": [
      "Crop Management Software", "Dairy Farm Software", "Farm Management Software",
      "Irrigation Management Software", "Livestock Management Software", "Precision Agriculture Software"
    ]
  },
  {
    "name": "Analytics Tools & Software",
    "icon": "ChartLine",
    "subcategories": [
      "Analytics Software Platforms and Tools", "Business Intelligence Software", "Data Integration Tools",
      "Data Virtualization Software", "Drone Analytics Software", "Enterprise Search Software",
      "Insight Engines Software", "Predictive Analytics Tools and Software", "Statistical Analysis Software",
      "Text Analysis Software", "Time Series Intelligence Software", "Visitor Behavior Intelligence Software"
    ]
  },
  {
    "name": "Artificial Intelligence Software",
    "icon": "Robot",
    "subcategories": [
      "Active Learning Tools", "AIOps Platform", "Conversational Intelligence Software",
      "Data Labeling Software", "Data Science & Machine Learning Platforms", "Deep Learning Software",
      "Generative AI Software", "Machine Learning Software", "MLOps Platforms",
      "Robotic Process Automation Software", "Sentiment Analysis Software", "Synthetic Data Software",
      "Video Surveillance Software", "Voice Dubbing Software"
    ]
  },
  {
    "name": "Auto Repair Software",
    "icon": "CarSide",
    "subcategories": [
      "Auto Body Software", "Auto Dealer Software", "Auto Repair Shop Management Software",
      "Collision Repair & Estimating Software", "CRMs for Auto Shops", "Diagnostic & Repair Information Software",
      "Digital Vehicle Inspection (DVI) Software", "Parts & Inventory Management Software"
    ]
  },
  {
    "name": "Call Center Software",
    "icon": "Headset",
    "subcategories": [
      "Auto Dialer Software", "Call Recording Software", "Call Tracking Software",
      "Contact Center Software", "Customer Support Software", "IVR Software",
      "Predictive Dialer Software", "Telephony Software", "VoIP Software"
    ]
  },
  {
    "name": "CMMS Software",
    "icon": "Wrench",
    "subcategories": [
      "AI-Optimized Maintenance Systems", "Asset Tracking Software", "Aviation MRO Software",
      "Calibration Management Software", "EAM Software", "Equipment Maintenance Software",
      "Preventive Maintenance Software", "Tool Management Software", "Web Based CMMS Software",
      "Work Order Software"
    ]
  },
  {
    "name": "Collaboration and Productivity Software",
    "icon": "PeopleGroup",
    "subcategories": [
      "AI Meeting Assistants Software", "Audio Conferencing Software", "Board Management Software",
      "Bookmark Manager Software", "Business Scheduling Software", "Calendar Software",
      "Cloud PBX Platforms Software", "Collaborative Whiteboard Software", "Decision-Making Software",
      "Digital Adoption Platforms", "Document Creation Software", "Document Generation Software",
      "Document Scanning Software", "Email Client Software", "Email Management Software",
      "Email Software", "Email Verification Software", "Employee Intranet Software",
      "File Converter Software", "File Reader Software", "Handwritten Notes Software",
      "Idea Management Software", "Internal Communications Software", "Internal Newsletter Software",
      "Meeting Management Software", "Mind Mapping Software", "Noise Cancellation Software",
      "Note-Taking Software", "Objectives and Key Results (OKR) Software", "Office Suites Software",
      "Online Appointment Scheduling Software", "Online Fax Software", "Other Collaboration Software",
      "PDF Editors", "Plagiarism Checker Software", "Presentation Software",
      "Productivity Bots Software", "Push-To-Talk (PTT) Software", "Screen and Video Capture Software",
      "Screen Sharing Software", "Social Network Platforms", "Spreadsheets Software",
      "Survey Software", "Text Expanders Software", "Transcription Software",
      "UCaaS Platforms", "Unified Workspaces Software", "Virtual Workspaces",
      "Visual Collaboration Platforms"
    ]
  },
  {
    "name": "Construction Management Software",
    "icon": "HardHat",
    "subcategories": [
      "AI-Driven Construction Management", "Building Information Modeling Software", "Concrete Estimating Software",
      "Construction Accounting Software", "Construction Bidding Software", "Construction Estimating Software",
      "Construction Scheduling Software", "Earthworks Estimating Software", "Electrical Contractor Software",
      "Electrical Estimating Software", "Flooring Estimating Software", "Plumbing Estimating Software",
      "Real Estate Development Software", "Roofing Software", "Web Construction Management Software"
    ]
  },
  {
    "name": "Content Management Software",
    "icon": "FileText",
    "subcategories": [
      "Client Portal Software", "Cloud Content Collaboration Software", "CMS Tools",
      "Commenting Systems", "Component Content Management Systems", "Content Moderation Tools",
      "Desktop Search Software", "Digital Asset Management Software", "Digital Experience Orchestration Platforms",
      "Digital Experience Platforms (DXP)", "Digital Rights Management (DRM) Software", "Document Management Software",
      "Enterprise Content Management Systems", "File Migration Software", "Headless CMS Software",
      "Image Optimization Software", "Live Blog Software", "Markup Software",
      "Online Proofing Software", "Other Content Software", "Translation Management Software",
      "User-Generated Content Platforms", "Video CMS Software", "Virtual Data Room Software",
      "Web Content Management Software", "Website Builder Software", "Website Change Monitoring Software",
      "WordPress Management Tools"
    ]
  },
  {
    "name": "CRM Software",
    "icon": "AddressBook",
    "subcategories": [
      "Account Management Software", "AI-Integrated CRM Solutions", "Android CRM Software",
      "Auto Dealership CRM Software", "Banking CRM Software", "Bookkeepers CRM",
      "Casino CRM Software", "Channel Management Software", "Cloud Based CRM For Small Business",
      "Complaint Management Software", "Consulting CRM Software", "Contact Management Software",
      "CRM For Accounting Firms", "CRM For B2B Sales", "CRM For Car Dealerships",
      "CRM For Charities", "CRM For Churches", "CRM For Cleaning Business",
      "CRM For Coaches", "CRM For Commercial Real Estate", "CRM For Construction Company",
      "CRM For Consultants", "CRM For Consulting Business", "CRM For Contractors",
      "CRM For CPA Firms", "CRM For Creatives", "CRM For Customer Service Software",
      "CRM For Design Agency", "CRM For Digital Marketing Agency", "CRM For Direct Sales",
      "CRM For Distributors", "CRM For Doctors", "CRM For Education",
      "CRM For Enterprise", "CRM For Event Management", "CRM For Facebook",
      "CRM For Field Sales", "CRM For Financial Advisors", "CRM For Financial Services",
      "CRM For Freelancers", "CRM For Freight Brokers", "CRM For Fundraising",
      "CRM For Google Workspace", "CRM For Graphic Designers", "CRM For Gyms",
      "CRM For Healthcare", "CRM For Health Insurance Agents", "CRM For Higher Education",
      "CRM For Home Improvement", "CRM For Independent Sales Reps", "CRM For Individuals",
      "CRM For Insurance Agents", "CRM For Insurance Brokers", "CRM For Investment Bankers",
      "CRM For Investors", "CRM For iOS", "CRM For Law Firms",
      "CRM For Life Coaches", "CRM For LinkedIn", "CRM For Loan Officers",
      "CRM For Logistics Industry", "CRM For Magento", "CRM For Manufacturing Businesses",
      "CRM For Marketing", "CRM For Marketing Agency", "CRM For Medical Practice",
      "CRM For Membership Organizations", "CRM For MLM", "CRM For Mortgage",
      "CRM For Mortgage Brokers", "CRM For Mortgage Lenders", "CRM For Mortgage Loan Officers",
      "CRM For Moving Company", "CRM For MSP", "CRM For Network Marketing",
      "CRM For Outlook", "CRM For Outside Sales Reps", "CRM For Painting Contractors",
      "CRM For Personal Trainers", "CRM For Photographers", "CRM For Plumbers",
      "CRM For Political Campaigns", "CRM For Pressure Washing Business", "CRM For Private Equity",
      "CRM For Professional Services", "CRM For Property Management", "CRM For Real Estate",
      "CRM For Real Estate Agents", "CRM For Real Estate Brokers", "CRM For Real Estate Investors",
      "CRM For Real Estate Teams", "CRM For Real Estate Wholesalers", "CRM For Realtors",
      "CRM For Remodelers", "CRM For Restaurants", "CRM For Retail",
      "CRM For SaaS Companies", "CRM For SaaS Startups", "CRM For Schools",
      "CRM For Service Providers", "CRM For Shopify", "CRM For Social Media Marketing",
      "CRM For Solar Business", "CRM For Solopreneurs", "CRM For Staffing Agencies",
      "CRM For Tax Professionals", "CRM For Tour Operators", "CRM For Travel Agents",
      "CRM For Universities", "CRM For Wealth Management", "CRM For Wholesalers",
      "CRM Software For Accountants", "CRM Software For HVAC", "CRM Software For Mac",
      "CRM Software For Recruiting", "Customer Engagement Platform", "Distribution CRM",
      "Ecommerce CRM Software", "Event Management Platforms", "Financial CRM Software",
      "Franchise CRM Software", "HIPAA Compliant CRM Software", "Hotel CRM Software",
      "Inside Sales Software", "Insurance CRM", "Investment Advisor CRM",
      "iPad CRM", "IT Ticketing Systems", "Knowledge Base Software",
      "Medicare Agents CRM", "Mobile CRM Software", "Nonprofit CRM Software",
      "Omnichannel CRM Software", "Online CRM Software", "Pharmaceutical CRM Software",
      "Project Management CRM Software", "Roofing Companies CRM", "SaaS CRM",
      "SaaS CRM For Small Business", "Sales Acceleration Software", "Sales Enablement Tools",
      "Sales Engagement Platforms", "Sales Force Automation Software", "Sales Mapping Software",
      "Sales Teams CRM Software", "Sales Tracking Software", "Service Dispatch Software",
      "Small Business CRM Software", "Startups CRM", "Venture Capital CRM Software"
    ]
  },
  {
    "name": "Customer Service Software",
    "icon": "MessageSquare",
    "subcategories": [
      "Automated Appointment Reminder", "Co-Browsing Software", "Contact Center Outsourcing",
      "Contact Center Payments Software", "Conversational Support Software", "Customer Communications Tools",
      "Customer Education Software", "Customer Self-Service Software", "Customer Service Automation Software",
      "Customer Success Software", "Digital Customer Service Platforms", "Enterprise Feedback Management Software",
      "Experience Management Software", "Feedback Analytics Software", "Help Desk Software",
      "Live Chat Software", "Multilingual Customer Support Software", "Other Customer Service Software",
      "Proactive Customer Retention Software", "Proactive Notification Software", "Remote Video Support Software",
      "Social Customer Service Software"
    ]
  },
  {
    "name": "CyberSecurity",
    "icon": "ShieldCheck",
    "subcategories": [
      "AI-Infused Cybersecurity", "Breach and Attack Simulation (BAS) Software", "Deception Technology Software",
      "Digital Forensics Software", "Digital Risk Protection (DRP) Platforms", "Endpoint Protection Software",
      "Incident Response Software", "IoT Security Solutions", "Malware Analysis Tools",
      "Managed Detection & Response Software", "OT Secure Remote Access Software", "Password Managers Software & Tools",
      "Security Compliance Software", "Security Info and Event Management", "Single Sign On",
      "SOAR Software", "Threat Intelligence Software"
    ]
  },
  {
    "name": "Design Software",
    "icon": "Palette",
    "subcategories": [
      "3D Design And Modeling Software", "Audio Editing Software", "Photo Editing Software",
      "Video Editing Software"
    ]
  },
  {
    "name": "E-Commerce Software",
    "icon": "Store",
    "subcategories": [
      "Age Verification Software", "B2B E-Commerce Platform Software", "Brand Protection Software",
      "Catalog Management Software", "Drop Shipping Software", "E-Commerce Analytics Software",
      "E-Commerce Fraud Protection Software", "E-Commerce Personalization Software", "E-Commerce Search Software",
      "E-Commerce Tools", "E-Merchandising Software", "Headless E-Commerce Software",
      "Live Commerce Software", "Multi-Channel E-Commerce Software", "Multichannel Retail Software",
      "Review Management Software", "Shopping Cart Software", "Small Business E-Commerce"
    ]
  },
  {
    "name": "EMR Software",
    "icon": "HeartPulse",
    "subcategories": [
      "Aesthetic Practice EMR Software", "AI EMR/EHR Platforms", "AI Medical Scribe Software",
      "Allergy EHR Software", "Alternative & Holistic Medicine EMR Software", "Ambulatory Software",
      "Anesthesiology EHR Software", "Appointment Reminder Software", "Assisted Living Software",
      "Audiology EHR Software", "Bariatrics/Obesity EMR Software", "Billing Services EHR Software",
      "Cardiology EHR/EMRs", "Chiropractic EMR Software", "Chronic Care Management (CCM)",
      "Cloud-Based EMR Software", "Concierge Medicine EMR Software", "Correctional Health EMRs",
      "Dentistry EHR Software", "Dermatology EMR Software", "Dialysis Clinic EMR Software",
      "Direct Primary Care Software", "eMAR System", "Emergency Medicine EMR Software",
      "EMR For Otolaryngology Practices", "Endocrinology EMR Software", "Enterprise Medical Software",
      "E-Prescribing Software", "Family Practice EMR", "FQHC EHR Software",
      "Free EMR Software", "Gastroenterology EHR Software", "General Practice EHR Software",
      "General Surgery EHR Software", "Geriatric EMR Software", "Home Health Care Software",
      "Hospice Software", "Integrative & Functional Medicine Software", "Internal Medicine EHR Software",
      "iPad EMR Software", "IVF EMR Software", "Lab Information System (LIS) Software",
      "Long Term Care EMR Software", "Mac EMR Software", "Medical Billing Software",
      "Medical Inventory Software", "Medical Practice Management Software", "Medical Scheduling Software",
      "Medical Spa Software", "Mental & Behavioral Health EMR Software", "Mental Health EHR Software",
      "Mental Health Practice Management Software", "Mobile EMR Software", "Multi-Specialty EMR Software",
      "Nephrology EHR Software", "Neurology EHR Software", "Ob-Gyn EMR Software",
      "Occupational Medicine EMR", "Occupational Therapy EMR", "ONC-ATCB Certified EMR Software",
      "Oncology EMR Software", "Ophthalmology EMR/EHR Software", "Optometry EMR Software",
      "Optometry Practice Management Software", "Orthopedics EMR Software", "PACS Systems",
      "Pain Management EMR Software", "Patient Engagement Software", "Patient Intake EMR Software",
      "Patient Kiosk EMR Software", "Patient Portal Software", "Patient Scheduling EHR Software",
      "Pediatric Home Health Software", "Pediatrics EHR Software", "Physical Therapy EHR Software",
      "Plastic Surgery EMR", "Podiatry EMR/EHR Software", "Practice Analytics EMR Software",
      "Primary Care", "Psychiatry EMR Software", "Public Health EHR Software",
      "Pulmonology EHR Software", "Radiology/Imaging EMR Software", "Remote Patient Monitoring (RPM)",
      "Revenue Cycle Management Software", "Rheumatology EHR Software", "Server Based EMR Software",
      "Sleep Medicine EMR", "Speech Therapy EHR Software", "Substance Abuse EMR Software",
      "Surgery Center Software", "Surgery EMR Software", "Telemedicine Software",
      "Urgent Care EMR Software", "Urology EHR Software", "Vascular Surgery EMR",
      "Wound Care EHR/EMR"
    ]
  },
  {
    "name": "Enterprise Resource Planning Software",
    "icon": "Briefcase",
    "subcategories": [
      "Aerospace ERP Software", "Agriculture ERP Software", "AI ERP",
      "Apparel ERP Software", "Automotive ERP Software", "Aviation ERP Software",
      "Cloud-Based ERP For Manufacturing", "Cloud Based ERP Software", "Cosmetic ERP Software",
      "Discrete Manufacturing ERP", "Distribution ERP Software", "E-Commerce ERP Software",
      "Engineering ERP", "Enterprise Architecture Software", "Enterprise ERP Software",
      "ERP Accounting Software", "ERP Apps for Android", "ERP For Banking Industry",
      "ERP For Chemical Industry", "ERP For Dairy Industry", "ERP For Electrical Contractors",
      "ERP For Electronics Industry", "ERP For Energy", "ERP For Finance",
      "ERP For Furniture Industry", "ERP For Industrial Machinery", "ERP For Law Firms",
      "ERP For Life Sciences", "ERP For Meat Processing", "ERP For Medium Sized Business",
      "ERP For Metal Industry", "ERP For Mining Industry", "ERP For Pharmaceutical Industry",
      "ERP For Professional Services Industry", "ERP For Real Estate", "ERP For Restaurants",
      "ERP For Solar Industry", "ERP For Startups", "ERP For Textile Industry",
      "ERP For Trading Business", "ERP For Travel Industry", "ERP For Warehouse Management",
      "ERP Software For Cement Industry", "ERP Software For Construction", "ERP Software For Contractors",
      "ERP Software For Logistics Companies", "ERP Software For Printing Industry", "ERP Software For Service Industry",
      "ERP Software For Supply Chain Management", "ERP Software For The Packaging Industry", "ERP Software For The Plastic Industry",
      "ERP Software For Utilities", "ERP Software for Windows", "ERP Solution For Equipment Rental Business",
      "ERP System For Hospitality", "ERP Systems", "Field Service ERP",
      "Flexible Packaging ERP Software", "Food And Beverage ERP", "Footwear ERP Software",
      "Government Contractor ERP Software", "Government ERP Software", "Healthcare ERP",
      "Hybrid ERP", "Insurance ERP Software", "Machine Shop ERP",
      "Manufacturing ERP Software", "Medical Device ERP", "Metal Fabrication ERP Software",
      "Microsoft Implementation Partners", "Nonprofit ERP Software", "Odoo Implementation Partners",
      "Oil And Gas ERP Software", "On-Premise ERP", "Open-Source ERP",
      "Oracle ERP Resellers", "Poultry ERP Software", "Process ERP Software",
      "Property Management ERP", "Retail ERP Software", "SAP Implementation Partners",
      "Seafood ERP"
    ]
  },
  {
    "name": "Event Management Software",
    "icon": "Calendar",
    "subcategories": [
      "Audience Response Software", "Box Office Software", "Event Networking and Matchmaking",
      "Event Planning Software", "Event Registration and Ticketing Software"
    ]
  },
  {
    "name": "Facility Management Software",
    "icon": "Building2",
    "subcategories": [
      "Asset Management Software (Facilities)", "EHS Management Software", "Energy Management Software",
      "Integrated Workplace Management System", "Parking Management Software", "School Facilities Management Software",
      "Space Management Software", "Visitor Management Systems", "Workplace Management Software"
    ]
  },
  {
    "name": "Field Service Software",
    "icon": "ScrewdriverWrench",
    "subcategories": [
      "Appliance Repair Software", "Arborist Software", "Carpet Cleaning Software",
      "Cleaning Service Software", "Field Service Mobile Apps", "GPS Tracking Software",
      "HVAC Software", "Lawn Care Software", "Locksmith Software",
      "Pest Control Software", "Plumbing Software", "Pool Service Software",
      "Service Order Software"
    ]
  },
  {
    "name": "Fleet Management Software",
    "icon": "Truck",
    "subcategories": [
      "Aviation Maintenance Software", "Building Maintenance Software", "Driver Management Software",
      "Fleet Maintenance Software", "Fleet Management Consulting Providers", "Fleet Tracking Software",
      "Fuel Management Software", "Maintenance Management Software", "Moving Software",
      "Route Planning Software", "Towing Software", "Transportation Dispatch Software",
      "Transportation Management Software"
    ]
  },
  {
    "name": "Governance, Risk & Compliance Software",
    "icon": "Landmark",
    "subcategories": [
      "Anti-Money Laundering Software", "Audit Management Software", "Carbon Accounting Software",
      "Enterprise Risk Management Software", "Environmental, Social, and Governance (ESG) Reporting Software", "GRC Tools",
      "Operational Risk Management Software", "Policy Management Software", "Regulatory Change Management Software",
      "Risk Intelligence Software", "Third Party & Supplier Risk Management Software"
    ]
  },
  {
    "name": "Hotel Management Software",
    "icon": "Hotel",
    "subcategories": [
      "Guest Experience & Messaging Software", "Hotel Booking Engines", "Hotel Channel Managers",
      "Hotel CRM Systems", "Hotel Housekeeping Software", "Hotel Point of Sale (POS)",
      "Hotel Property Management Systems (PMS)", "Hotel Reputation Management Software", "Hotel Revenue Management Systems",
      "Sales, Events & Catering Software"
    ]
  },
  {
    "name": "Human Resource Software",
    "icon": "Users",
    "subcategories": [
      "1099 Payroll Software", "360 Degree Feedback Software", "Absence Management Software",
      "AI Applicant Tracking System", "AI-Assisted HR Management", "AI Payroll Software",
      "AI Recruiting Software", "Applicant Tracking Systems", "Assessment Software",
      "Automated Onboarding Software", "Awards and Recognition", "Background Check Software",
      "Benefits Administration Software", "Campus Recruitment Software", "Care Agency Recruitment Software",
      "Certified Payroll Software", "Church Payroll Software", "Clinical Trial Recruitment Software",
      "Cloud Based Payroll Software", "Cloud-Based Recruitment Software", "Cloud-Based Talent Management Software",
      "Cloud-Based Workforce Management Software", "Cloud HRMS", "Cloud Payroll Software For Accountants",
      "College Recruitment Software", "Compensation Management Software", "Construction Onboarding Software",
      "Contractor Management", "Corporate Recruitment Software", "Corporate Social Responsibility Software",
      "Corporate Volunteering Platform", "Credentialing Software", "Desktop Payroll Software For Small Business",
      "EAP Providers", "Earned Wage Access Software", "Employee Database Software",
      "Employee Engagement Software", "Employee Monitoring Software", "Employee Offboarding Software",
      "Employee Perk Software", "Employee Records Management Software", "Employee Referral Software",
      "Employee Scheduling Software", "Employee Wellness Software", "Employer Of Record Software",
      "Enterprise Onboarding Software", "Enterprise Payroll Software For Large Companies", "Enterprise Workforce Management Software",
      "E-Recruitment Software", "Executive Recruitment Software", "Freelance Management Software",
      "Global HRMS Software", "Global Recruitment Software", "Government HR Software",
      "Government Payroll Software", "HCM For Small Business", "HCM Software",
      "Healthcare Onboarding Software", "Healthcare Payroll Software", "Healthcare Recruitment Software",
      "Home Care Payroll Software", "Hospitality Payroll Software", "Hospitality Recruitment Software",
      "HR Analytics Software", "HR Case Management Software", "HR Compliance Software",
      "HR Delivery Service Software", "HR Employee Onboarding Software", "HR Help Desk Software",
      "HRIS For Large Companies", "HRIS For Small Business", "HRIS Software",
      "HRMS For Small Business", "HRMS Software", "HR Reporting Software",
      "HR Software For Retail", "Human Resource Apps", "In-house Recruitment Software",
      "Internal Recruitment Software", "Interview Scheduling Software", "Job Board Software",
      "Leave Management System", "Manufacturing HR Software For Onboarding", "Marine Recruitment Software",
      "Mentorship Software", "Mobile Workforce Management Software", "Multi-Country Payroll Software",
      "Nursing Recruitment Software", "OKR Software", "Onboarding Employees Software For Childcare",
      "Onboarding Software For Aged Care", "Onboarding Software For Camp Employees", "Onboarding Software For Mining",
      "Onboarding Software For Staffing Firms", "Open Source HRMS", "Org Chart Software",
      "Patient Recruitment Software", "Pay Equity Software", "Payroll Software",
      "Payroll Software Canada", "Payroll Software For Accountants", "Payroll Software For Construction Companies",
      "Payroll Software For Mac", "Payroll Software For Non-Profit Organizations", "Payroll Software For Payroll Service Providers",
      "Payroll Software For Pharma Industry", "Payroll Software For Recruitment Agencies", "Payroll Software For Remote Teams",
      "Payroll Software For Retail", "Payroll Software For Schools", "Performance Management Software",
      "Physician Onboarding Software", "Recruiting Software", "Recruitment Automation Software",
      "Recruitment CRM", "Recruitment Database Software", "Recruitment Marketing Software",
      "Recruitment Software For Recruitment Agencies", "Recruitment Software For Startups", "Recruitment Tracking Software",
      "Reference Check Software", "Remote Onboarding Software", "Remote Workforce Management Software",
      "Restaurant Employee Onboarding Software", "Restaurant Payroll Software", "Restaurant Scheduling Software",
      "Retail Recruitment Software", "Security Guard Payroll Software", "Small Business Payroll Software",
      "Social Recruiting Software", "Succession Planning Software", "Talent Management Software",
      "Technical Skills Screening software", "Time and Attendance Software", "Time Clock Software",
      "Trucking Accounting Software", "Trucking Payroll Software", "Vacation Tracking Software",
      "Video Interviewing Software", "Web-Based HRMS Software", "Web Based Recruitment Software",
      "Workforce Management Software", "Workforce Management Software For Hospitality"
    ]
  },
  {
    "name": "Insurance Software",
    "icon": "Umbrella",
    "subcategories": [
      "Auto Insurance Software", "Health Insurance Software", "Insurance Agent Software",
      "Insurance Broker Software", "Insurance Claims Management Software", "Insurance Compliance Software",
      "Insurance Fraud Detection Software", "Insurance Policy Management Software", "Insurance Rating Software",
      "Insurance Underwriting Software", "Life Insurance Management Software", "Reinsurance Software"
    ]
  },
  {
    "name": "IT Management Software",
    "icon": "Settings",
    "subcategories": [
      "Cloud Cost Management Software", "Data Governance Software", "Incident Management Software",
      "Infrastructure Monitoring Tools", "IT Asset Management Software", "IT Financial Management Software",
      "IT Inventory Management Software", "IT Operations Management Software", "Observability Platforms",
      "Privileged Access Management Software", "Remote Desktop Software", "Unified Endpoint Management Software"
    ]
  },
  {
    "name": "Legal Software",
    "icon": "Scale",
    "subcategories": [
      "Alternative Dispute Resolution Software", "Bankruptcy Software", "Civil Litigation Software",
      "Cloud Based Legal Billing Software", "Cloud Based Legal Case Management Software", "Cloud Based Legal Software",
      "Contract Lifecycle Management Software", "Criminal Case Management Software", "Criminal Law Software",
      "eDiscovery Software", "eDiscovery Software For Small Law Firms", "Enterprise Legal Management Software",
      "Estate Planning Software For Attorneys", "Evidence Management Software", "Family Law Software",
      "Immigration Law Firm Software", "In-House Legal Software", "Law Firm Client Management Software",
      "Law Firm Conflict Check Software", "Legal AI Chatbot", "Legal AI Software"
    ]
  }
]
```

- [ ] **Step 2: Create `scripts/seed-categories.ts`**

```ts
import fs from "fs";
import path from "path";
import prisma from "@/lib/prisma";

type CategorySeed = { name: string; icon: string; subcategories: string[] };

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function main() {
  const file = path.join(process.cwd(), "data", "categories-seed.json");
  const categoriesData: CategorySeed[] = JSON.parse(fs.readFileSync(file, "utf-8"));

  let totalSubcategories = 0;

  for (let i = 0; i < categoriesData.length; i++) {
    const cat = categoriesData[i];
    const categorySlug = slugify(cat.name);

    const category = await prisma.category.upsert({
      where: { slug: categorySlug },
      update: { name: cat.name, icon: cat.icon, order: i },
      create: { name: cat.name, slug: categorySlug, icon: cat.icon, order: i },
    });

    const generalName = `General ${cat.name}`;
    const generalSlug = slugify(generalName);
    await prisma.subcategory.upsert({
      where: { categoryId_slug: { categoryId: category.id, slug: generalSlug } },
      update: { name: generalName, isGeneral: true, order: -1 },
      create: { name: generalName, slug: generalSlug, isGeneral: true, order: -1, categoryId: category.id },
    });
    totalSubcategories++;

    for (let j = 0; j < cat.subcategories.length; j++) {
      const subName = cat.subcategories[j];
      const subSlug = slugify(subName);
      await prisma.subcategory.upsert({
        where: { categoryId_slug: { categoryId: category.id, slug: subSlug } },
        update: { name: subName, order: j },
        create: { name: subName, slug: subSlug, order: j, categoryId: category.id },
      });
      totalSubcategories++;
    }
  }

  console.log(`Seeded ${categoriesData.length} categories, ${totalSubcategories} subcategories (including General buckets).`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
```

- [ ] **Step 3: Run the seed script**

Run: `npx tsx scripts/seed-categories.ts`
Expected output: `Seeded 27 categories, N subcategories (including General buckets).` (N will be the total item count across all `subcategories` arrays above, plus 27 General buckets — no errors).

- [ ] **Step 4: Verify the counts in the database**

Run:
```bash
npx tsx -e "
import prisma from './lib/prisma';
(async () => {
  const categories = await prisma.category.count();
  const subcategories = await prisma.subcategory.count();
  const generals = await prisma.subcategory.count({ where: { isGeneral: true } });
  console.log({ categories, subcategories, generals });
  process.exit(0);
})();
"
```
Expected: `{ categories: 27, subcategories: <total>, generals: 27 }` — `categories` and `generals` must both be exactly 27.

- [ ] **Step 5: Commit**

```bash
git add data/categories-seed.json scripts/seed-categories.ts
git commit -m "feat: seed category and subcategory taxonomy"
```

---

### Task 4: Backfill existing `Software` rows onto subcategories

**Files:**
- Create: `scripts/backfill-software-subcategories.ts`

**Interfaces:**
- Consumes: `Category`/`Subcategory` rows from Task 3 (specifically the `slugify(name)` → `Category.slug` correspondence).
- Produces: every existing `Software` row gets a non-null `subcategoryId`. Later tasks (5 onward) assume this backfill has already run — any code that still reads `Software.category` after this task is legacy scaffolding being actively removed, not something new code should rely on.

- [ ] **Step 1: Create `scripts/backfill-software-subcategories.ts`**

```ts
import prisma from "@/lib/prisma";

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function main() {
  const rows = await prisma.software.findMany({
    where: { subcategoryId: null },
    select: { id: true, category: true },
  });

  if (rows.length === 0) {
    console.log("No software rows need backfilling.");
    return;
  }

  const otherCategory = await prisma.category.upsert({
    where: { slug: "other-software" },
    update: {},
    create: { name: "Other Software", slug: "other-software", order: 9999 },
  });
  const otherGeneral = await prisma.subcategory.upsert({
    where: { categoryId_slug: { categoryId: otherCategory.id, slug: "general-other-software" } },
    update: {},
    create: {
      name: "General Other Software",
      slug: "general-other-software",
      isGeneral: true,
      order: -1,
      categoryId: otherCategory.id,
    },
  });

  const distinctOldCategories = Array.from(new Set(rows.map((r) => r.category).filter(Boolean))) as string[];
  const resolved = new Map<string, string>();

  for (const oldCategory of distinctOldCategories) {
    const targetSlug = slugify(oldCategory);
    const matchedCategory = await prisma.category.findUnique({ where: { slug: targetSlug } });
    if (matchedCategory) {
      const general = await prisma.subcategory.findFirst({
        where: { categoryId: matchedCategory.id, isGeneral: true },
      });
      resolved.set(oldCategory, (general ?? otherGeneral).id);
    } else {
      resolved.set(oldCategory, otherGeneral.id);
    }
  }

  let updated = 0;
  for (const row of rows) {
    const subcategoryId = row.category ? resolved.get(row.category) ?? otherGeneral.id : otherGeneral.id;
    await prisma.software.update({ where: { id: row.id }, data: { subcategoryId } });
    updated++;
  }

  console.log(`Backfilled ${updated} software row(s).`);
  console.log("Old category -> resolved subcategory mapping:", Object.fromEntries(resolved));
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
```

- [ ] **Step 2: Run the backfill**

Run: `npx tsx scripts/backfill-software-subcategories.ts`
Expected output: `Backfilled 45 software row(s).` followed by a mapping object showing `"emr-software" -> <some cuid>`.

- [ ] **Step 3: Verify no software rows are left unassigned**

Run:
```bash
npx tsx -e "
import prisma from './lib/prisma';
(async () => {
  const total = await prisma.software.count();
  const unassigned = await prisma.software.count({ where: { subcategoryId: null } });
  const inEmr = await prisma.software.count({ where: { subcategory: { slug: 'general-emr-software' } } });
  console.log({ total, unassigned, inEmr });
  process.exit(0);
})();
"
```
Expected: `{ total: 45, unassigned: 0, inEmr: 45 }` (all 45 existing rows land in "General EMR Software", since they were all tagged `category: "emr-software"`).

- [ ] **Step 4: Commit**

```bash
git add scripts/backfill-software-subcategories.ts
git commit -m "feat: backfill existing software onto subcategories"
```

---

### Task 5: `app/categories/actions.ts` — category/subcategory query layer

**Files:**
- Create: `app/categories/actions.ts`

**Interfaces:**
- Consumes: `Category`, `Subcategory` Prisma models (Task 1); `nameMatchScore` logic (duplicated locally — same scoring rule as `app/dashboard/softwares/actions.ts`'s existing helper, kept in sync intentionally rather than shared, to avoid a cross-cutting import between the two action modules).
- Produces (consumed by Tasks 6, 8, 9, 10):
  - `getCategories(): Promise<{ success: boolean; data?: CategoryListItem[]; error?: string }>` where `CategoryListItem = { id: string; name: string; slug: string; icon: string | null; count: number; subcategories: { id: string; name: string; slug: string; isGeneral: boolean; count: number }[] }`.
  - `getCategoryWithSubcategories(categorySlug: string): Promise<{ success: boolean; data?: CategoryDetail | null; error?: string }>` where `CategoryDetail = { id: string; name: string; slug: string; icon: string | null; subcategories: { id: string; name: string; slug: string; isGeneral: boolean; count: number }[] }`.
  - `getSoftwaresByCategory(categorySlug: string, options?: { page?: number; pageSize?: number; q?: string }): Promise<{ success: boolean; data?: { softwares: any[]; total: number; page: number; pageSize: number; totalPages: number; categoryName: string | null }; error?: string }>`.
  - `getSoftwaresBySubcategory(categorySlug: string, subcategorySlug: string, options?: { page?: number; pageSize?: number; q?: string }): Promise<{ success: boolean; data?: { softwares: any[]; total: number; page: number; pageSize: number; totalPages: number; categoryName: string | null; subcategoryName: string | null }; error?: string }>`.

- [ ] **Step 1: Write `app/categories/actions.ts`**

```ts
"use server";

import prisma from "@/lib/prisma";

function nameMatchScore(name: string, query: string): number {
  const n = name.toLowerCase();
  const q = query.toLowerCase();
  if (n === q) return 0;
  if (n.startsWith(q)) return 1;
  if (n.includes(q)) return 2;
  return 3;
}

export async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: "asc" },
      include: {
        subcategories: {
          orderBy: { order: "asc" },
          include: { _count: { select: { softwares: true } } },
        },
      },
    });

    const data = categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      icon: c.icon,
      count: c.subcategories.reduce((sum, s) => sum + s._count.softwares, 0),
      subcategories: c.subcategories.map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        isGeneral: s.isGeneral,
        count: s._count.softwares,
      })),
    }));

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { success: false, error: "Failed to fetch categories" };
  }
}

export async function getCategoryWithSubcategories(categorySlug: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
      include: {
        subcategories: {
          orderBy: { order: "asc" },
          include: { _count: { select: { softwares: true } } },
        },
      },
    });
    if (!category) return { success: true, data: null };

    return {
      success: true,
      data: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        icon: category.icon,
        subcategories: category.subcategories.map((s) => ({
          id: s.id,
          name: s.name,
          slug: s.slug,
          isGeneral: s.isGeneral,
          count: s._count.softwares,
        })),
      },
    };
  } catch (error) {
    console.error("Error fetching category:", error);
    return { success: false, error: "Failed to fetch category" };
  }
}

export async function getSoftwaresByCategory(
  categorySlug: string,
  options: { page?: number; pageSize?: number; q?: string } = {}
) {
  try {
    const page = Math.max(options.page || 1, 1);
    const pageSize = options.pageSize || 12;
    const q = options.q?.trim();

    const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
    if (!category) {
      return { success: true, data: { softwares: [], total: 0, page, pageSize, totalPages: 0, categoryName: null } };
    }

    const where = { subcategory: { categoryId: category.id } };

    let softwares;
    let total;
    if (q) {
      const all = await prisma.software.findMany({ where, orderBy: { createdAt: "desc" } });
      const ranked = all
        .map((s) => ({ s, score: nameMatchScore(s.name, q) }))
        .sort((a, b) => a.score - b.score || (b.s.rating || 0) - (a.s.rating || 0))
        .map((r) => r.s);
      total = ranked.length;
      softwares = ranked.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
    } else {
      [softwares, total] = await Promise.all([
        prisma.software.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        prisma.software.count({ where }),
      ]);
    }

    return {
      success: true,
      data: {
        softwares,
        total,
        page,
        pageSize,
        totalPages: Math.max(Math.ceil(total / pageSize), 1),
        categoryName: category.name,
      },
    };
  } catch (error) {
    console.error("Error fetching softwares by category:", error);
    return { success: false, error: "Failed to fetch softwares" };
  }
}

export async function getSoftwaresBySubcategory(
  categorySlug: string,
  subcategorySlug: string,
  options: { page?: number; pageSize?: number; q?: string } = {}
) {
  try {
    const page = Math.max(options.page || 1, 1);
    const pageSize = options.pageSize || 12;
    const q = options.q?.trim();

    const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
    if (!category) {
      return {
        success: true,
        data: { softwares: [], total: 0, page, pageSize, totalPages: 0, categoryName: null, subcategoryName: null },
      };
    }

    const subcategory = await prisma.subcategory.findUnique({
      where: { categoryId_slug: { categoryId: category.id, slug: subcategorySlug } },
    });
    if (!subcategory) {
      return {
        success: true,
        data: { softwares: [], total: 0, page, pageSize, totalPages: 0, categoryName: category.name, subcategoryName: null },
      };
    }

    const where = { subcategoryId: subcategory.id };

    let softwares;
    let total;
    if (q) {
      const all = await prisma.software.findMany({ where, orderBy: { createdAt: "desc" } });
      const ranked = all
        .map((s) => ({ s, score: nameMatchScore(s.name, q) }))
        .sort((a, b) => a.score - b.score || (b.s.rating || 0) - (a.s.rating || 0))
        .map((r) => r.s);
      total = ranked.length;
      softwares = ranked.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize);
    } else {
      [softwares, total] = await Promise.all([
        prisma.software.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        prisma.software.count({ where }),
      ]);
    }

    return {
      success: true,
      data: {
        softwares,
        total,
        page,
        pageSize,
        totalPages: Math.max(Math.ceil(total / pageSize), 1),
        categoryName: category.name,
        subcategoryName: subcategory.name,
      },
    };
  } catch (error) {
    console.error("Error fetching softwares by subcategory:", error);
    return { success: false, error: "Failed to fetch softwares" };
  }
}
```

- [ ] **Step 2: Verify it compiles and returns real data**

Run:
```bash
npx tsx -e "
import { getCategories, getSoftwaresBySubcategory } from './app/categories/actions';
(async () => {
  const cats = await getCategories();
  const emr = cats.data?.find((c) => c.slug === 'emr-software');
  console.log('EMR category count:', emr?.count, 'subcategory entries:', emr?.subcategories.length);
  const general = emr?.subcategories.find((s) => s.isGeneral);
  const detail = await getSoftwaresBySubcategory('emr-software', general!.slug, { page: 1 });
  console.log('General EMR software total:', detail.data?.total);
  process.exit(0);
})();
"
```
Expected: `EMR category count: 45 subcategory entries: <95 or 96>` and `General EMR software total: 45`.

- [ ] **Step 3: Commit**

```bash
git add app/categories/actions.ts
git commit -m "feat: add category/subcategory query actions"
```

---

### Task 6: Expose subcategory data through existing software queries

**Files:**
- Modify: `app/dashboard/softwares/actions.ts`

**Interfaces:**
- Consumes: `getCategories` from Task 5 (`app/categories/actions.ts`).
- Produces: `getSoftwares()`, `getDashboardSoftwares()`, `getSoftwareById()`, `getSoftwareBySlug()`, and `searchSoftwareSuggestions()` now each return software rows with a `subcategory: { id, name, slug, category: { id, name, slug } } | null` field attached. `findBestCategoryForQuery()` now returns `{ categorySlug: string; subcategorySlug: string | null; categoryName: string } | null` (added `subcategorySlug`) — Task 7's `HeroSearch.tsx`/`Sidebar.tsx` changes depend on this new field.

- [ ] **Step 1: Remove the old `getCategories`/`getSoftwaresByCategory` and the local `slugify`'s category-string usages**

In `app/dashboard/softwares/actions.ts`, delete the entire `getCategories` function (lines 139-161 in the pre-change file) and the entire `getSoftwaresByCategory` function (lines 163-226) — both are superseded by `app/categories/actions.ts`. Keep the `slugify` helper (still used for software slugs) and the `nameMatchScore` helper (still used below).

- [ ] **Step 2: Rewrite `findBestCategoryForQuery`**

Replace the existing `findBestCategoryForQuery` function with:

```ts
import { getCategories } from "@/app/categories/actions";

// ... (keep this import at the top of the file, near the other imports)

export async function findBestCategoryForQuery(query: string) {
  try {
    const q = query.trim();
    if (!q) return { success: true, data: null };

    const categoriesRes = await getCategories();
    const categories = categoriesRes.success ? categoriesRes.data || [] : [];

    const qLower = q.toLowerCase();
    const directCategory = categories.find(
      (c) => c.name.toLowerCase().includes(qLower) || qLower.includes(c.name.toLowerCase())
    );
    if (directCategory) {
      return {
        success: true,
        data: { categorySlug: directCategory.slug, subcategorySlug: null, categoryName: directCategory.name },
      };
    }

    const matches = await prisma.software.findMany({
      where: { name: { contains: q, mode: "insensitive" }, subcategoryId: { not: null } },
      select: {
        name: true,
        subcategory: { select: { slug: true, category: { select: { slug: true, name: true } } } },
      },
    });
    if (matches.length === 0) return { success: true, data: null };

    const best = matches.reduce((a, b) => (nameMatchScore(a.name, q) <= nameMatchScore(b.name, q) ? a : b));
    if (!best.subcategory) return { success: true, data: null };

    return {
      success: true,
      data: {
        categorySlug: best.subcategory.category.slug,
        subcategorySlug: best.subcategory.slug,
        categoryName: best.subcategory.category.name,
      },
    };
  } catch (error) {
    console.error("Error resolving search category:", error);
    return { success: false, error: "Failed to resolve search category" };
  }
}
```

- [ ] **Step 3: Update `searchSoftwareSuggestions`'s `select`**

Replace `select: { id: true, name: true, slug: true, logo: true, category: true, rating: true }` with:

```ts
select: {
  id: true,
  name: true,
  slug: true,
  logo: true,
  rating: true,
  subcategory: { select: { name: true } },
},
```

- [ ] **Step 4: Add the subcategory include to `fetchSoftwares`, `getDashboardSoftwares`, `getSoftwareById`'s owned-lookup, and `getSoftwareBySlug`**

Change:
```ts
const fetchSoftwares = unstable_cache(
  async () => prisma.software.findMany({ orderBy: { createdAt: "desc" } }),
  ["softwares-list"],
  { revalidate: 60, tags: ["softwares"] }
);
```
to:
```ts
const fetchSoftwares = unstable_cache(
  async () =>
    prisma.software.findMany({
      orderBy: { createdAt: "desc" },
      include: { subcategory: { include: { category: true } } },
    }),
  ["softwares-list"],
  { revalidate: 60, tags: ["softwares"] }
);
```

In `getDashboardSoftwares`, change:
```ts
const softwares = await prisma.software.findMany({
  where: isAdmin(session) ? undefined : { vendorId: session.userId },
  orderBy: { createdAt: "desc" },
});
```
to:
```ts
const softwares = await prisma.software.findMany({
  where: isAdmin(session) ? undefined : { vendorId: session.userId },
  orderBy: { createdAt: "desc" },
  include: { subcategory: { include: { category: true } } },
});
```

In `getOwnedSoftware` (used by `getSoftwareById`, `updateSoftware`, `deleteSoftware`), change:
```ts
const software = await prisma.software.findUnique({ where: { id } });
```
to:
```ts
const software = await prisma.software.findUnique({
  where: { id },
  include: { subcategory: { include: { category: true } } },
});
```

In `getSoftwareBySlug`, change:
```ts
const software = await prisma.software.findUnique({
  where: { slug },
  include: { _count: { select: { reviews: true } } },
});
```
to:
```ts
const software = await prisma.software.findUnique({
  where: { slug },
  include: {
    _count: { select: { reviews: true } },
    subcategory: { include: { category: true } },
  },
});
```

- [ ] **Step 5: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors from `app/dashboard/softwares/actions.ts` (errors from files not yet updated in later tasks, like the add/edit forms still sending `category`, are expected at this point and will be resolved in Task 11 — note them but don't fix them here).

- [ ] **Step 6: Commit**

```bash
git add app/dashboard/softwares/actions.ts
git commit -m "feat: expose subcategory data through software queries"
```

---

### Task 7: Update homepage/detail-page consumers of the category shape

**Files:**
- Modify: `components/SoftwareSection.tsx`
- Modify: `app/softwares/[slug]/page.tsx`
- Modify: `components/HeroSearch.tsx`
- Modify: `components/Sidebar.tsx`

**Interfaces:**
- Consumes: `subcategory.category` relation data from Task 6's updated queries; `findBestCategoryForQuery`'s new `subcategorySlug` field from Task 6.

- [ ] **Step 1: `components/SoftwareSection.tsx` — port the tab-filter to the new relation**

Change:
```ts
const idx = TABS.findIndex((tab) =>
  softwares.some((s: any) => s.category?.toLowerCase().includes(tab.match))
);
```
to:
```ts
const idx = TABS.findIndex((tab) =>
  softwares.some((s: any) => s.subcategory?.category?.name?.toLowerCase().includes(tab.match))
);
```
And change:
```ts
.filter((s: any) => s.category?.toLowerCase().includes(TABS[activeIndex].match))
```
to:
```ts
.filter((s: any) => s.subcategory?.category?.name?.toLowerCase().includes(TABS[activeIndex].match))
```
This is a direct one-for-one port of the existing (pre-existing, unchanged) string-matching heuristic — it is not being redesigned, just pointed at the new data source.

- [ ] **Step 2: `app/softwares/[slug]/page.tsx` — update the local type and the breadcrumb/badge**

Find the local type declaration (around line 47-53) that includes:
```ts
category?: string | null;
```
Replace it with:
```ts
subcategory?: {
  name: string;
  slug: string;
  category: { name: string; slug: string };
} | null;
```

Find the breadcrumb block:
```tsx
{software.category?.trim() && (
  <>
    <span className="text-text-muted/30">/</span>
    <Link
      href={`/categories/${slugifyCategory(software.category)}`}
      className="text-text-muted transition-colors hover:text-primary-navy"
    >
      {software.category}
    </Link>
  </>
)}
```
Replace it with:
```tsx
{software.subcategory && (
  <>
    <span className="text-text-muted/30">/</span>
    <Link
      href={`/categories/${software.subcategory.category.slug}`}
      className="text-text-muted transition-colors hover:text-primary-navy"
    >
      {software.subcategory.category.name}
    </Link>
    <span className="text-text-muted/30">/</span>
    <Link
      href={`/categories/${software.subcategory.category.slug}/${software.subcategory.slug}`}
      className="text-text-muted transition-colors hover:text-primary-navy"
    >
      {software.subcategory.name}
    </Link>
  </>
)}
```
If a local `slugifyCategory` helper function exists solely to support the old breadcrumb, remove it — it's now unused.

Find the category badge:
```tsx
<span className="inline-flex items-center rounded-full bg-brand-green/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-brand-green-dark">
  {software.category || "Uncategorized"}
</span>
```
Replace `{software.category || "Uncategorized"}` with `{software.subcategory?.name || "Uncategorized"}`.

- [ ] **Step 3: `components/HeroSearch.tsx` — use the subcategory-aware search resolver and display**

Change:
```ts
const goToBestCategory = async (term: string) => {
  const res = await findBestCategoryForQuery(term);
  if (res.success && res.data) {
    router.push(
      `/categories/${res.data.categorySlug}?q=${encodeURIComponent(term)}`,
    );
  } else {
    router.push("/categories");
  }
};
```
to:
```ts
const goToBestCategory = async (term: string) => {
  const res = await findBestCategoryForQuery(term);
  if (res.success && res.data) {
    const path = res.data.subcategorySlug
      ? `/categories/${res.data.categorySlug}/${res.data.subcategorySlug}`
      : `/categories/${res.data.categorySlug}`;
    router.push(`${path}?q=${encodeURIComponent(term)}`);
  } else {
    router.push("/categories");
  }
};
```
Change the suggestion-list rendering:
```tsx
{s.category && (
  <p className="truncate text-xs text-text-muted">
    {s.category}
  </p>
)}
```
to:
```tsx
{s.subcategory?.name && (
  <p className="truncate text-xs text-text-muted">
    {s.subcategory.name}
  </p>
)}
```

- [ ] **Step 4: `components/Sidebar.tsx` — same navigation fix**

Change:
```ts
const res = await findBestCategoryForQuery(term);
if (res.success && res.data) {
  router.push(`/categories/${res.data.categorySlug}?q=${encodeURIComponent(term)}`);
} else {
```
to:
```ts
const res = await findBestCategoryForQuery(term);
if (res.success && res.data) {
  const path = res.data.subcategorySlug
    ? `/categories/${res.data.categorySlug}/${res.data.subcategorySlug}`
    : `/categories/${res.data.categorySlug}`;
  router.push(`${path}?q=${encodeURIComponent(term)}`);
} else {
```

- [ ] **Step 5: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no new errors from these four files.

- [ ] **Step 6: Commit**

```bash
git add components/SoftwareSection.tsx app/softwares/[slug]/page.tsx components/HeroSearch.tsx components/Sidebar.tsx
git commit -m "feat: point homepage/search/detail-page at the subcategory relation"
```

---

### Task 8: Rewrite `/categories` — mega-index page

**Files:**
- Modify: `app/categories/page.tsx`

**Interfaces:**
- Consumes: `getCategories()` from Task 5; icon exports from `lib/fa-icons.tsx` (Task 2, plus the pre-existing ones).

- [ ] **Step 1: Rewrite the page**

Replace the entire contents of `app/categories/page.tsx` with:

```tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import { ChevronRight } from "@/lib/fa-icons";
import * as Icons from "@/lib/fa-icons";
import { getCategories } from "@/app/categories/actions";

type Subcategory = { id: string; name: string; slug: string; isGeneral: boolean; count: number };
type CategoryListItem = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  count: number;
  subcategories: Subcategory[];
};

function CategoryIcon({ name }: { name: string | null }) {
  const IconComponent = (name && (Icons as any)[name]) || Icons.Box;
  return <IconComponent size={20} className="text-brand-green-dark" />;
}

export default function CategoriesPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await getCategories();
      if (res.success) setCategories((res.data as CategoryListItem[]) || []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <Navbar onMenuClick={() => setIsMenuOpen(true)} />
      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <section className="border-b border-zinc-100 bg-zinc-50/60 pb-12 pt-[120px] lg:pt-[140px]">
        <Container>
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-brand-green-dark">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-green" aria-hidden />
            All Products
          </span>
          <h1 className="mt-2 font-brand text-3xl font-bold text-primary-navy lg:text-4xl">
            Software categories
          </h1>
          <p className="mt-2 max-w-xl text-sm text-zinc-500">
            Browse every software category in the SoftwareDome directory, from broad platforms to
            specific industry and role niches.
          </p>
        </Container>
      </section>

      <section className="py-12">
        <Container>
          {loading ? (
            <div className="space-y-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-40 animate-pulse rounded-2xl border border-slate-100 bg-slate-50/60" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-16 text-center">
              <Icons.Box size={28} className="mb-3 text-zinc-300" />
              <h3 className="text-base font-bold text-primary-navy">No categories yet</h3>
              <p className="mt-1 max-w-sm text-xs text-zinc-500">
                Categories will appear here once the taxonomy has been seeded.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {categories.map((cat) => (
                <div key={cat.id} id={cat.slug} className="rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="mb-5 flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-green/10">
                      <CategoryIcon name={cat.icon} />
                    </span>
                    <h2 className="font-brand text-lg font-bold text-primary-navy">{cat.name}</h2>
                  </div>
                  <div className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
                    {cat.subcategories
                      .filter((s) => !s.isGeneral)
                      .map((sub) => (
                        <Link
                          key={sub.id}
                          href={`/categories/${cat.slug}/${sub.slug}`}
                          className="group flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-primary-navy/80 transition-colors hover:bg-brand-green/5 hover:text-brand-green-dark"
                        >
                          <span className="truncate">{sub.name}</span>
                          <ChevronRight size={13} className="shrink-0 text-zinc-300 group-hover:text-brand-green-dark" />
                        </Link>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Container>
      </section>

      <Footer />
    </main>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors in `app/categories/page.tsx`.

- [ ] **Step 3: Manual check**

Run: `npm run dev`, open `http://localhost:3000/categories`, and confirm all 27 category cards render with an icon, a heading, and a 3-column grid of subcategory links (no "General ..." entries visible, since those are filtered out of the mega-index).

- [ ] **Step 4: Commit**

```bash
git add app/categories/page.tsx
git commit -m "feat: rewrite categories index as two-level mega-index"
```

---

### Task 9: Rewrite `/categories/[category]` — aggregate page

**Files:**
- Modify: `app/categories/[category]/page.tsx`

**Interfaces:**
- Consumes: `getCategoryWithSubcategories`, `getSoftwaresByCategory` from Task 5.

- [ ] **Step 1: Update the data-fetching and sidebar in `app/categories/[category]/page.tsx`**

Change the imports:
```ts
import { getSoftwaresByCategory, getCategories } from "@/app/dashboard/softwares/actions";
```
to:
```ts
import { getSoftwaresByCategory, getCategoryWithSubcategories } from "@/app/categories/actions";
```

Replace the `categories` state and its loader:
```ts
const [categories, setCategories] = useState<{ name: string; slug: string; count: number }[]>([]);
...
useEffect(() => {
  getCategories().then((res) => {
    if (res.success) setCategories((res.data as any) || []);
  });
}, []);
```
with:
```ts
const [categoryDetail, setCategoryDetail] = useState<{
  name: string;
  slug: string;
  subcategories: { id: string; name: string; slug: string; isGeneral: boolean; count: number }[];
} | null>(null);

useEffect(() => {
  getCategoryWithSubcategories(categorySlug).then((res) => {
    if (res.success) setCategoryDetail((res.data as any) ?? null);
  });
}, [categorySlug]);
```

Replace the "Other categories" sidebar block:
```tsx
<div className="rounded-2xl border border-zinc-200 bg-white p-5">
  <div className="mb-4 flex items-center gap-2 text-sm font-bold text-primary-navy">
    <Filter size={14} className="text-brand-green-dark" />
    Other categories
  </div>
  <div className="space-y-1">
    {categories.slice(0, 8).map((cat) => (
      <Link
        key={cat.slug}
        href={`/categories/${cat.slug}`}
        className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
          cat.slug === categorySlug
            ? "bg-primary-navy text-white"
            : "text-zinc-600 hover:bg-zinc-50"
        }`}
      >
        <span className="truncate">{cat.name}</span>
        <span className="ml-2 shrink-0 text-xs opacity-70">{cat.count}</span>
      </Link>
    ))}
  </div>
</div>
```
with:
```tsx
<div className="rounded-2xl border border-zinc-200 bg-white p-5">
  <div className="mb-4 flex items-center gap-2 text-sm font-bold text-primary-navy">
    <Filter size={14} className="text-brand-green-dark" />
    Subcategories
  </div>
  <div className="max-h-96 space-y-1 overflow-y-auto">
    {(categoryDetail?.subcategories ?? [])
      .filter((s) => !s.isGeneral)
      .map((sub) => (
        <Link
          key={sub.id}
          href={`/categories/${categorySlug}/${sub.slug}`}
          className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-zinc-600 transition-colors hover:bg-zinc-50"
        >
          <span className="truncate">{sub.name}</span>
          <span className="ml-2 shrink-0 text-xs opacity-70">{sub.count}</span>
        </Link>
      ))}
  </div>
</div>
```

The rest of the page (search box, sort, pagination, software list rendering, CTA banner) is unchanged — it already calls `getSoftwaresByCategory(categorySlug, { page, pageSize: 12, q })`, which Task 5 already made subcategory-relation-aware under the hood with the same return shape.

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors in `app/categories/[category]/page.tsx`.

- [ ] **Step 3: Manual check**

Visit `http://localhost:3000/categories/emr-software` and confirm: the header shows "Best EMR Software List", the sidebar lists EMR subcategories (not "General EMR Software"), and the 45 seeded software rows appear in the list (since they're all in "General EMR Software", which is a child of this category).

- [ ] **Step 4: Commit**

```bash
git add "app/categories/[category]/page.tsx"
git commit -m "feat: rewire category aggregate page to subcategory taxonomy"
```

---

### Task 10: New `/categories/[category]/[subcategory]` — leaf page

**Files:**
- Create: `app/categories/[category]/[subcategory]/page.tsx`

**Interfaces:**
- Consumes: `getSoftwaresBySubcategory`, `getCategoryWithSubcategories` from Task 5.

- [ ] **Step 1: Create the leaf page**

This is structurally a copy of `app/categories/[category]/page.tsx` (post-Task-9), scoped one level deeper. Create `app/categories/[category]/[subcategory]/page.tsx`:

```tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import Pagination from "@/components/Pagination";
import { Star, ArrowLeft, Box, Filter, ArrowDownUp, MessageSquare, ArrowUpRight } from "@/lib/fa-icons";
import { getSoftwaresBySubcategory, getCategoryWithSubcategories } from "@/app/categories/actions";

const sortOptions = [
  { value: "rating", label: "Highest rated" },
  { value: "newest", label: "Newest" },
  { value: "name", label: "Name (A-Z)" },
];

function StarRating({ rating }: { rating: number }) {
  const rounded = Math.round(rating);
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={13}
          className={i < rounded ? "text-amber-400 fill-amber-400" : "text-zinc-200 fill-zinc-200"}
        />
      ))}
    </div>
  );
}

export default function SubcategoryPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const categorySlug = params.category as string;
  const subcategorySlug = params.subcategory as string;
  const page = Math.max(parseInt(searchParams.get("page") || "1", 10) || 1, 1);
  const sort = searchParams.get("sort") || "rating";
  const q = searchParams.get("q") || "";

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    softwares: any[];
    total: number;
    totalPages: number;
    categoryName: string | null;
    subcategoryName: string | null;
  } | null>(null);
  const [categoryDetail, setCategoryDetail] = useState<{
    name: string;
    slug: string;
    subcategories: { id: string; name: string; slug: string; isGeneral: boolean; count: number }[];
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const res = await getSoftwaresBySubcategory(categorySlug, subcategorySlug, { page, pageSize: 12, q });
      if (!cancelled && res.success) {
        setData(res.data as any);
      }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [categorySlug, subcategorySlug, page, q]);

  useEffect(() => {
    getCategoryWithSubcategories(categorySlug).then((res) => {
      if (res.success) setCategoryDetail((res.data as any) ?? null);
    });
  }, [categorySlug]);

  const qSuffix = q ? `&q=${encodeURIComponent(q)}` : "";

  const handlePageChange = useCallback(
    (newPage: number) => {
      router.push(`/categories/${categorySlug}/${subcategorySlug}?page=${newPage}&sort=${sort}${qSuffix}`);
    },
    [router, categorySlug, subcategorySlug, sort, qSuffix]
  );

  const handleSortChange = (newSort: string) => {
    router.push(`/categories/${categorySlug}/${subcategorySlug}?page=1&sort=${newSort}${qSuffix}`);
  };

  const sortedSoftwares = data
    ? q
      ? data.softwares
      : [...data.softwares].sort((a, b) => {
          if (sort === "name") return (a.name || "").localeCompare(b.name || "");
          if (sort === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          return (b.rating || 0) - (a.rating || 0);
        })
    : [];

  const subcategoryLabel = data?.subcategoryName || (loading ? "Loading…" : "Subcategory");

  return (
    <main className="min-h-screen bg-zinc-50/40">
      <Navbar onMenuClick={() => setIsMenuOpen(true)} />
      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <section className="border-b border-zinc-100 bg-white pb-10 pt-[120px] lg:pt-[140px]">
        <Container>
          <div className="mb-3 flex flex-wrap items-center gap-1.5 text-xs font-bold text-zinc-500">
            <Link href="/categories" className="hover:text-primary-navy">All categories</Link>
            <span>/</span>
            <Link href={`/categories/${categorySlug}`} className="hover:text-primary-navy">
              {data?.categoryName || categoryDetail?.name || categorySlug}
            </Link>
          </div>
          <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-brand-green-dark">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-green" aria-hidden />
            Subcategory
          </span>
          <h1 className="mt-2 font-brand text-3xl font-bold text-primary-navy lg:text-4xl">
            Best {subcategoryLabel} List
          </h1>
          {data && (
            <p className="mt-2 max-w-xl text-sm text-zinc-500">
              Compare {data.total} admin-verified {subcategoryLabel.toLowerCase()} listing
              {data.total === 1 ? "" : "s"} and find the right fit for your team.
            </p>
          )}
          {q && (
            <p className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-zinc-500">
              Showing results for <span className="text-primary-navy">"{q}"</span>
              <Link href={`/categories/${categorySlug}/${subcategorySlug}`} className="text-brand-green-dark hover:underline">
                Clear search
              </Link>
            </p>
          )}
        </Container>
      </section>

      <section className="py-10">
        <Container>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-6">
                <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                  <div className="mb-4 flex items-center gap-2 text-sm font-bold text-primary-navy">
                    <ArrowDownUp size={14} className="text-brand-green-dark" />
                    Sort by
                  </div>
                  <div className="space-y-1.5">
                    {sortOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => handleSortChange(opt.value)}
                        className={`w-full rounded-lg px-3 py-2 text-left text-sm font-semibold transition-colors ${
                          sort === opt.value
                            ? "bg-brand-green/10 text-brand-green-dark"
                            : "text-zinc-600 hover:bg-zinc-50"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-5">
                  <div className="mb-4 flex items-center gap-2 text-sm font-bold text-primary-navy">
                    <Filter size={14} className="text-brand-green-dark" />
                    Other subcategories
                  </div>
                  <div className="max-h-96 space-y-1 overflow-y-auto">
                    {(categoryDetail?.subcategories ?? [])
                      .filter((s) => !s.isGeneral)
                      .map((sub) => (
                        <Link
                          key={sub.id}
                          href={`/categories/${categorySlug}/${sub.slug}`}
                          className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                            sub.slug === subcategorySlug
                              ? "bg-primary-navy text-white"
                              : "text-zinc-600 hover:bg-zinc-50"
                          }`}
                        >
                          <span className="truncate">{sub.name}</span>
                          <span className="ml-2 shrink-0 text-xs opacity-70">{sub.count}</span>
                        </Link>
                      ))}
                  </div>
                </div>
              </div>
            </aside>

            <div>
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-36 animate-pulse rounded-2xl border border-zinc-100 bg-zinc-50" />
                  ))}
                </div>
              ) : !data || sortedSoftwares.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-white px-6 py-16 text-center">
                  <Box size={28} className="mb-3 text-zinc-300" />
                  <h3 className="mb-1 text-base font-bold text-primary-navy">No softwares found</h3>
                  <p className="max-w-sm text-xs text-zinc-500">
                    We couldn't find any listings for this subcategory yet. Browse other subcategories instead.
                  </p>
                  <Link
                    href={`/categories/${categorySlug}`}
                    className="mt-5 inline-flex items-center justify-center rounded-full bg-brand-green-light px-6 py-2.5 text-sm font-bold text-primary-navy shadow-sm transition-all hover:bg-brand-green hover:text-white"
                  >
                    Browse {data?.categoryName || categoryDetail?.name || "category"}
                  </Link>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {sortedSoftwares.map((software, idx) => (
                      <div
                        key={software.id}
                        className="group flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 transition-all hover:border-brand-green/40 hover:shadow-lg sm:flex-row sm:items-center"
                      >
                        <span className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-400 sm:flex">
                          {(page - 1) * 12 + idx + 1}
                        </span>

                        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-100 bg-zinc-50">
                          {software.logo ? (
                            <img src={software.logo} alt={software.name} className="h-full w-full object-contain p-2" />
                          ) : (
                            <span className="text-xl font-black text-primary-navy/25">
                              {software.name?.charAt(0)}
                            </span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-bold text-primary-navy transition-colors group-hover:text-brand-green-dark">
                              {software.name}
                            </h3>
                            <StarRating rating={software.rating || 0} />
                            <span className="text-xs font-bold text-zinc-400">
                              {(software.rating || 0).toFixed(1)}
                            </span>
                          </div>
                          {software.introduction && (
                            <p className="mt-1.5 line-clamp-2 max-w-2xl text-sm text-zinc-500">
                              {software.introduction}
                            </p>
                          )}
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <Link
                            href={`/softwares/${software.slug}#reviews`}
                            className="hidden items-center gap-1.5 rounded-full border border-zinc-200 px-4 py-2 text-xs font-bold text-zinc-500 transition-colors hover:border-primary-navy hover:text-primary-navy sm:flex"
                          >
                            <MessageSquare size={13} />
                            Reviews
                          </Link>
                          <Link
                            href={`/softwares/${software.slug}`}
                            className="inline-flex items-center gap-1.5 rounded-full bg-primary-navy px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-brand-green-dark"
                          >
                            View Profile
                            <ArrowUpRight size={13} />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Pagination page={page} totalPages={data.totalPages} onPageChange={handlePageChange} />
                </>
              )}

              <div className="mt-12 overflow-hidden rounded-2xl bg-primary-navy px-8 py-10 text-center sm:px-12">
                <h3 className="font-brand text-2xl font-bold text-white">
                  Need help finding the right {subcategoryLabel.toLowerCase()}?
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-zinc-300">
                  Tell us what you're looking for and our team will help you shortlist the best fit
                  from the SoftwareDome directory.
                </p>
                <Link
                  href="/contact"
                  className="mt-6 inline-flex items-center justify-center rounded-full bg-brand-green px-8 py-3 text-sm font-bold text-primary-navy shadow-lg transition-all hover:-translate-y-0.5 hover:bg-brand-green-light"
                >
                  Talk to our team
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Footer />
    </main>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors in the new file.

- [ ] **Step 3: Manual check**

Find any EMR subcategory slug (e.g. `general-emr-software`) and visit `http://localhost:3000/categories/emr-software/general-emr-software` — confirm the 45 software rows appear, and visit an empty one (e.g. `http://localhost:3000/categories/emr-software/cardiology-ehr-emrs`) and confirm the "No softwares found" empty state renders correctly with a working "Browse EMR Software" link back to the aggregate page.

- [ ] **Step 4: Commit**

```bash
git add "app/categories/[category]/[subcategory]/page.tsx"
git commit -m "feat: add subcategory leaf page"
```

---

### Task 11: Dashboard software form — cascading Category/Subcategory selects

**Files:**
- Modify: `app/dashboard/softwares/add/page.tsx`
- Modify: `app/dashboard/softwares/edit/[id]/page.tsx`
- Modify: `app/dashboard/softwares/actions.ts`

**Interfaces:**
- Consumes: `getCategories()` from Task 5.
- Produces: `createSoftware`/`updateSoftware` now read `subcategoryId` from `FormData` instead of `category`.

- [ ] **Step 1: `app/dashboard/softwares/actions.ts` — swap `category` for `subcategoryId` in create/update**

In `createSoftware`, change:
```ts
const category = formData.get("category") as string || "";
```
to:
```ts
const subcategoryId = (formData.get("subcategoryId") as string) || null;
```
and in the `prisma.software.create({ data: { ... } })` call, replace the `category,` line with `subcategoryId,`.

In `updateSoftware`, make the same two changes: replace `const category = formData.get("category") as string || "";` with `const subcategoryId = (formData.get("subcategoryId") as string) || null;`, and in `updateData`, replace `category,` with `subcategoryId,`.

- [ ] **Step 2: `app/dashboard/softwares/add/page.tsx` — cascading selects**

Add to the imports: `import { getCategories } from "@/app/categories/actions";`

Add new state (near the existing `basicInfo` state):
```ts
const [categories, setCategories] = React.useState<
  { id: string; name: string; slug: string; subcategories: { id: string; name: string; isGeneral: boolean }[] }[]
>([]);
const [categorySlug, setCategorySlug] = React.useState("");
const [subcategoryId, setSubcategoryId] = React.useState("");

React.useEffect(() => {
  getCategories().then((res) => {
    if (res.success) setCategories((res.data as any) || []);
  });
}, []);

const selectedCategory = categories.find((c) => c.slug === categorySlug);
const subcategoryOptions = selectedCategory
  ? [...selectedCategory.subcategories].sort((a, b) => (a.isGeneral === b.isGeneral ? 0 : a.isGeneral ? -1 : 1))
  : [];
```

Remove `category: ""` from the `basicInfo` state initializer (it's replaced by `categorySlug`/`subcategoryId` above).

In `handlePublish`, replace:
```ts
formData.append("category", basicInfo.category);
```
with:
```ts
formData.append("subcategoryId", subcategoryId);
```

Replace the Category `<input>` block:
```tsx
<div className="space-y-4">
  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
    <Layers size={16} className="text-brand-green-dark" /> Category
  </label>
  <input
    type="text"
    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-green/15 outline-none transition-all font-medium"
    placeholder="e.g. CRM, Healthcare, ERP"
    value={basicInfo.category}
    onChange={(e) => setBasicInfo({...basicInfo, category: e.target.value})}
  />
</div>
```
with two selects:
```tsx
<div className="space-y-4">
  <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
    <Layers size={16} className="text-brand-green-dark" /> Category
  </label>
  <select
    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-green/15 outline-none transition-all font-medium"
    value={categorySlug}
    onChange={(e) => {
      setCategorySlug(e.target.value);
      setSubcategoryId("");
    }}
  >
    <option value="">Select a category…</option>
    {categories.map((c) => (
      <option key={c.id} value={c.slug}>{c.name}</option>
    ))}
  </select>
  <select
    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-green/15 outline-none transition-all font-medium disabled:opacity-50"
    value={subcategoryId}
    onChange={(e) => setSubcategoryId(e.target.value)}
    disabled={!selectedCategory}
  >
    <option value="">Select a subcategory…</option>
    {subcategoryOptions.map((s) => (
      <option key={s.id} value={s.id}>{s.isGeneral ? s.name : s.name}</option>
    ))}
  </select>
</div>
```

- [ ] **Step 3: `app/dashboard/softwares/edit/[id]/page.tsx` — same cascading selects, plus prefill from the loaded software**

Apply the identical import addition, state additions, `handlePublish` change, and JSX replacement as Step 2.

Additionally, in the `loadData` effect (where `getSoftwareById(id)` result is used to populate `basicInfo`), remove `category: (s as any).category || ""` from the `setBasicInfo` call, and add prefill logic right after `setBasicInfo(...)`:
```ts
const sub = (s as any).subcategory;
if (sub) {
  setCategorySlug(sub.category.slug);
  setSubcategoryId(sub.id);
}
```
This effect runs after `categories` may or may not have loaded yet — since `categorySlug`/`subcategoryId` are plain string state (not derived from `categories`), the prefill works regardless of load order; the `<select>` options will simply render once `categories` arrives, already matching the pre-set `value`.

- [ ] **Step 4: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors in either form file or in `app/dashboard/softwares/actions.ts`.

- [ ] **Step 5: Manual check**

Run `npm run dev`, go to `/dashboard/softwares/add`, pick a category and subcategory, fill in a name, and publish — confirm the new software's edit page (`/dashboard/softwares/edit/[id]`) reopens with the same category/subcategory pre-selected. Then edit one of the 45 existing EMR software rows and confirm it prefills to "EMR Software" / "General EMR Software".

- [ ] **Step 6: Commit**

```bash
git add app/dashboard/softwares/add/page.tsx "app/dashboard/softwares/edit/[id]/page.tsx" app/dashboard/softwares/actions.ts
git commit -m "feat: cascading category/subcategory picker in software form"
```

---

### Task 12: Dashboard software list, CSV importer, and EMR seed scripts

**Files:**
- Modify: `app/dashboard/softwares/page.tsx`
- Modify: `app/dashboard/softwares/actions.ts`
- Modify: `scripts/seed-ehr.ts`
- Modify: `scripts/seed-emr-list.ts`

**Interfaces:**
- Consumes: `subcategory` relation now included on rows returned by `getDashboardSoftwares()` (Task 6).

- [ ] **Step 1: `app/dashboard/softwares/page.tsx` — category badge in the table**

Change:
```tsx
<span className="text-xs text-text-muted">{software.category || "Uncategorized"}</span>
```
to:
```tsx
<span className="text-xs text-text-muted">{software.subcategory?.name || "Uncategorized"}</span>
```

- [ ] **Step 2: `app/dashboard/softwares/actions.ts` — CSV importer resolves category/subcategory names**

Change the `CsvRow` type's `category: string;` field to:
```ts
category: string;
subcategory: string;
```

In `runCsvImportJob`, right before the `prisma.software.create` call inside the `runWithConcurrency` worker, add subcategory resolution. Replace:
```ts
const logoUrl = row.logo ? await uploadFromUrl(row.logo) : "";
```
with:
```ts
const logoUrl = row.logo ? await uploadFromUrl(row.logo) : "";
const subcategoryId = await resolveSubcategoryId(row.category, row.subcategory);
if (!subcategoryId) {
  state.uncategorized = (state.uncategorized ?? 0) + 1;
}
```

Add a new helper above `runCsvImportJob`:
```ts
async function resolveSubcategoryId(categoryName: string | undefined, subcategoryName: string | undefined): Promise<string | null> {
  if (!categoryName) return null;
  const category = await prisma.category.findFirst({
    where: { name: { equals: categoryName.trim(), mode: "insensitive" } },
  });
  if (!category) return null;

  if (subcategoryName?.trim()) {
    const subcategory = await prisma.subcategory.findFirst({
      where: { categoryId: category.id, name: { equals: subcategoryName.trim(), mode: "insensitive" } },
    });
    if (subcategory) return subcategory.id;
  }

  const general = await prisma.subcategory.findFirst({ where: { categoryId: category.id, isGeneral: true } });
  return general?.id ?? null;
}
```

Update the `prisma.software.create` call's `data` object: replace `category: row.category || "",` with `subcategoryId,`.

Update the `ImportJobState` type to add an optional counter:
```ts
type ImportJobState = {
  total: number;
  processed: number;
  created: number;
  skipped: number;
  failed: number;
  uncategorized?: number;
  errors: string[];
  done: boolean;
};
```
And in `importSoftwaresFromCsv`'s job initialization, add `uncategorized: 0,` alongside the other counters.

- [ ] **Step 3: `app/dashboard/softwares/page.tsx` — surface the uncategorized count after import**

In the import-progress/result rendering block, find:
```tsx
<p className="font-semibold text-primary-navy">
  Created {importResult.created} · Skipped {importResult.skipped} · Failed{" "}
  {importResult.failed}
</p>
```
and change it to also show the uncategorized count when present:
```tsx
<p className="font-semibold text-primary-navy">
  Created {importResult.created} · Skipped {importResult.skipped} · Failed{" "}
  {importResult.failed}
  {(importResult as any).uncategorized ? ` · ${(importResult as any).uncategorized} uncategorized (review category/subcategory columns)` : ""}
</p>
```
(The `importResult` state type in this file is a loosely-typed object already — casting to `any` for this one new optional field matches this file's existing style rather than introducing a stricter type just for this.)

- [ ] **Step 4: `scripts/seed-ehr.ts` — assign subcategory instead of category string**

Add near the top of the file, after the existing imports:
```ts
async function getGeneralEmrSubcategoryId(): Promise<string | null> {
  const category = await prisma.category.findUnique({ where: { slug: "emr-software" } });
  if (!category) return null;
  const general = await prisma.subcategory.findFirst({ where: { categoryId: category.id, isGeneral: true } });
  return general?.id ?? null;
}
```

In `main()`, before the loop over `rows`, add:
```ts
const subcategoryId = await getGeneralEmrSubcategoryId();
```

In the `data` object built for each row, replace:
```ts
category: row.category ? String(row.category) : null,
```
with:
```ts
subcategoryId,
```

- [ ] **Step 5: `scripts/seed-emr-list.ts` — same fix for the "genuinely new" software list**

Add the same `getGeneralEmrSubcategoryId` helper (or import it if this script and `seed-ehr.ts` are run in the same process — since they're standalone `tsx` scripts, duplicate the small helper rather than adding a shared module for two lines of logic).

Find where `category: "EHR/EMR",` is set when creating each new software row, and replace it with `subcategoryId,` (computed once via `getGeneralEmrSubcategoryId()` before the loop, same as Step 4).

- [ ] **Step 6: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors in any of the four files.

- [ ] **Step 7: Commit**

```bash
git add app/dashboard/softwares/page.tsx app/dashboard/softwares/actions.ts scripts/seed-ehr.ts scripts/seed-emr-list.ts
git commit -m "feat: subcategory-aware CSV import and EMR seed scripts"
```

---

### Task 13: Dashboard analytics — category breakdown

**Files:**
- Modify: `app/dashboard/actions.ts`

**Interfaces:**
- Consumes: `Subcategory`/`Category` relations (Task 1).

- [ ] **Step 1: Replace the string `groupBy` with a relational aggregation**

Change:
```ts
const categoryGroups = await prisma.software.groupBy({
  by: ["category"],
  where: admin ? undefined : { vendorId: session.userId },
  _count: true,
});
const categoryBreakdown = categoryGroups
  .map((g) => ({ category: g.category || "Uncategorized", count: g._count as unknown as number }))
  .sort((a, b) => b.count - a.count)
  .slice(0, 6);
```
to:
```ts
const softwareWithCategory = await prisma.software.findMany({
  where: admin ? undefined : { vendorId: session.userId },
  select: { subcategory: { select: { category: { select: { name: true } } } } },
});
const categoryCounts = new Map<string, number>();
for (const s of softwareWithCategory) {
  const name = s.subcategory?.category.name ?? "Uncategorized";
  categoryCounts.set(name, (categoryCounts.get(name) ?? 0) + 1);
}
const categoryBreakdown = Array.from(categoryCounts.entries())
  .map(([category, count]) => ({ category, count }))
  .sort((a, b) => b.count - a.count)
  .slice(0, 6);
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no errors in `app/dashboard/actions.ts`.

- [ ] **Step 3: Manual check**

Visit `/dashboard` (logged in as admin) and confirm the "Softwares by category" chart renders a single bar labeled "EMR Software" with a count of 45.

- [ ] **Step 4: Commit**

```bash
git add app/dashboard/actions.ts
git commit -m "feat: relational category breakdown for dashboard analytics"
```

---

### Task 14: Drop `Software.category` and final build verification

**Files:**
- Modify: `prisma/schema.prisma`

**Interfaces:**
- Consumes: confirmation from Task 4 that every `Software` row has a non-null `subcategoryId`, and confirmation from Tasks 6, 7, 11, 12, 13 that no remaining code reads or writes `Software.category`.

- [ ] **Step 1: Re-verify no software rows are unassigned (safety check before dropping the column)**

Run:
```bash
npx tsx -e "
import prisma from './lib/prisma';
(async () => {
  const unassigned = await prisma.software.count({ where: { subcategoryId: null } });
  console.log('unassigned:', unassigned);
  process.exit(unassigned === 0 ? 0 : 1);
})();
"
```
Expected: `unassigned: 0` and exit code 0. **Do not proceed to Step 2 if this fails.**

- [ ] **Step 2: Grep for any remaining `Software.category` references**

Run: `grep -rn "software\.category\|s\.category\b" app components lib scripts --include=*.ts --include=*.tsx`
Expected: no output (or only matches inside comments/unrelated variables named `category` that aren't reading the removed field — inspect any hits manually before proceeding).

- [ ] **Step 3: Remove the field from the schema**

In `prisma/schema.prisma`, remove the line `category           String?` from the `Software` model (it sits between `logo` and `subcategoryId`).

- [ ] **Step 4: Push the schema change**

Run: `npx prisma db push`
Expected output ends with `Your database is now in sync with your Prisma schema.` — Prisma will report the `category` column being dropped; confirm the prompt (or pass `--accept-data-loss` if running non-interactively, since this is an intentional, already-verified-safe removal of a column whose data has been fully migrated to `subcategoryId`).

- [ ] **Step 5: Full build check**

Run: `npm run build`
Expected: build completes successfully with no type errors.

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat: remove legacy Software.category string field"
```

---

### Task 15: Verification script + full manual QA pass

**Files:**
- Create: `scripts/verify-categories-seed.ts`

**Interfaces:**
- Consumes: everything from Tasks 1-14 — this is the final acceptance check for the whole plan.

- [ ] **Step 1: Write `scripts/verify-categories-seed.ts`**

```ts
import assert from "node:assert/strict";
import prisma from "@/lib/prisma";

async function main() {
  const categoryCount = await prisma.category.count();
  assert.ok(
    categoryCount === 27 || categoryCount === 28,
    `Expected 27 or 28 categories (28 if the "Other Software" fallback was created), got ${categoryCount}`
  );

  const categories = await prisma.category.findMany({ include: { subcategories: true } });
  for (const category of categories) {
    const generals = category.subcategories.filter((s) => s.isGeneral);
    assert.equal(generals.length, 1, `Category "${category.name}" should have exactly one General subcategory, found ${generals.length}`);
  }

  const unassigned = await prisma.software.count({ where: { subcategoryId: null } });
  assert.equal(unassigned, 0, `Expected 0 unassigned software rows, found ${unassigned}`);

  const otherCategory = await prisma.category.findUnique({ where: { slug: "other-software" } });
  if (otherCategory) {
    const softwareInOther = await prisma.software.count({
      where: { subcategory: { categoryId: otherCategory.id, isGeneral: true } },
    });
    console.log(`Note: ${softwareInOther} software row(s) fell back to "Other Software" (unmatched old category strings).`);
  }

  const totalSubcategories = await prisma.subcategory.count();
  console.log(`OK: ${categoryCount} categories, ${totalSubcategories} subcategories, 0 unassigned software.`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Verification failed:", e.message);
    process.exit(1);
  });
```

- [ ] **Step 2: Run it**

Run: `npx tsx scripts/verify-categories-seed.ts`
Expected: `OK: 27 categories, <N> subcategories, 0 unassigned software.` and exit code 0.

- [ ] **Step 3: Full manual QA pass**

With `npm run dev` running:
1. `/categories` — all 27 cards render with icons and subcategory grids.
2. `/categories/emr-software` — header, subcategory sidebar, and the 45 real EMR software rows all render.
3. `/categories/emr-software/general-emr-software` — same 45 rows render at the leaf level.
4. `/categories/emr-software/cardiology-ehr-emrs` (or any other genuinely empty EMR subcategory) — "No softwares found" empty state renders with a working link back to the aggregate page.
5. Homepage (`/`) — the EMR software tab in the tabbed section (`components/SoftwareSection.tsx`) still shows the 45 EMR rows.
6. Any `/softwares/[slug]` detail page for one of the 45 EMR rows — breadcrumb shows "EMR Software / General EMR Software", and the badge shows "General EMR Software".
7. Hero search bar and dashboard sidebar search — typing "athenahealth" (an existing EMR software name) navigates to `/categories/emr-software/general-emr-software?q=athenahealth`.
8. `/dashboard/softwares/add` — category/subcategory selects work end-to-end (already checked in Task 11, re-confirm here as part of the full pass).
9. `/dashboard` analytics — category breakdown chart shows real data.

- [ ] **Step 4: Commit**

```bash
git add scripts/verify-categories-seed.ts
git commit -m "test: add category taxonomy verification script"
```

---

## Post-deploy reminder

Per this project's standing deployment process: after this branch is merged and deployed, SSH into the VPS and run `npx prisma db push` there too (schema changes don't reach the VPS database via `git pull` alone). Also re-run `npx tsx scripts/seed-categories.ts` and `npx tsx scripts/backfill-software-subcategories.ts` on the VPS after that `db push`, since the VPS database needs the same taxonomy seed and backfill the local database got in Tasks 3-4 — a fresh schema push alone only creates empty `Category`/`Subcategory` tables.
