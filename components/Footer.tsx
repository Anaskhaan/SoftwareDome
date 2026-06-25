"use client";

import Link from "next/link";
import Logo from "@/components/Logo";
import Container from "@/components/Container";
import {
  Phone,
  Mail,
  Facebook,
  LinkedinIcon,
  XTwitter,
  Youtube,
} from "@/lib/fa-icons";

const categoryColumns = [
  {
    title: "Top EMR Software",
    links: [
      "Cerner EMR",
      "AdvancedMD",
      "Epic EMR",
      "Kareo EMR",
      "TherapyNotes EHR",
      "athenaOne",
    ],
  },
  {
    title: "Top HR Software",
    links: [
      "Namely HR",
      "Gusto HR Software",
      "When I Work",
      "Deel",
      "Paylocity HR & Payroll",
      "Hubstaff",
    ],
  },
  {
    title: "Top CRM Software",
    links: [
      "HubSpot CRM",
      "monday.com",
      "Salesforce",
      "Zoho CRM",
      "Pipedrive",
      "Freshsales",
    ],
  },
  {
    title: "Top LMS Software",
    links: [
      "360Learning",
      "Skillsoft",
      "Schoology LMS",
      "Teachmint",
      "TalentLMS",
      "Absorb LMS",
    ],
  },
];

const comparisons = [
  "Cerner EHR Vs. Epic EHR",
  "eClinicalWorks Vs. Athenahealth",
  "HubSpot Vs. Salesforce",
  "monday.com Vs. ClickUp",
  "Absorb LMS Vs. TalentLMS",
];

const resources = [
  "Top 10 Largest EMR/EHR Vendors of 2026",
  "All You Need to Know About Business Collaboration Tools",
  "3 Must-have Tools For Agile Teams",
  "How Much Does an EMR Cost? (2026)",
];

const companyLinks = [
  { name: "About Us", href: "/about" },
  { name: "Contact Us", href: "/contact" },
  { name: "For Vendors", href: "/vendors" },
  { name: "Privacy Choices", href: "/privacy" },
];

const socials = [
  { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { icon: LinkedinIcon, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: XTwitter, href: "https://x.com", label: "X" },
  { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#0c221a] pt-20 pb-10 m-2 rounded-lg text-white">
      <Container className="relative">
        {/* Category columns */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-4">
          {categoryColumns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-6 text-sm font-semibold text-zinc-400">
                {col.title}
              </h4>
              <ul className="flex flex-col gap-3.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <Link
                      href="/categories"
                      className="text-sm font-bold text-white/90 transition-colors hover:text-brand-green-light"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Comparisons / Resources / Company / Brand */}
        <div className="mt-16 grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h4 className="mb-6 text-sm font-semibold text-zinc-400">
              Top Comparisons
            </h4>
            <ul className="flex flex-col gap-3.5">
              {comparisons.map((item) => (
                <li key={item}>
                  <Link
                    href="/categories"
                    className="text-sm font-bold text-white/90 transition-colors hover:text-brand-green-light"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-sm font-semibold text-zinc-400">
              Top Resources
            </h4>
            <ul className="flex flex-col gap-3.5">
              {resources.map((item) => (
                <li key={item}>
                  <Link
                    href="/blog"
                    className="text-sm font-bold leading-snug text-white/90 transition-colors hover:text-brand-green-light"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-sm font-semibold text-zinc-400">
              Company
            </h4>
            <ul className="flex flex-col gap-3.5">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm font-bold text-white/90 transition-colors hover:text-brand-green-light"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-5">
            <Logo size="md" variant="dark" />
            <p className="max-w-xs text-sm leading-relaxed text-zinc-400">
              Right selection to grow your business.
            </p>

            <div>
              <h4 className="mb-3 text-sm font-semibold text-zinc-400">
                Get in touch
              </h4>
              <div className="flex flex-col gap-2.5">
                <a
                  href="tel:+16613847070"
                  className="flex items-center gap-2.5 text-sm font-bold text-white/90 transition-colors hover:text-brand-green-light"
                >
                  <Phone size={14} className="text-zinc-500" />
                  (661)-332-1223
                </a>
                <a
                  href="mailto:info@softwaredome.com"
                  className="flex items-center gap-2.5 text-sm font-bold text-white/90 transition-colors hover:text-brand-green-light"
                >
                  <Mail size={14} className="text-zinc-500" />
                  info@softwaredome.com
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <social.icon size={13} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-sm text-zinc-400">
            SoftwareDome © {new Date().getFullYear()} All Rights Reserved
          </p>
          <div className="flex items-center gap-6 text-sm text-zinc-400">
            <Link
              href="/privacy"
              className="transition-colors hover:text-white"
            >
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-white">
              Terms of Service
            </Link>
            <Link
              href="/vendors"
              className="transition-colors hover:text-white"
            >
              Vendor Terms of Service
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
