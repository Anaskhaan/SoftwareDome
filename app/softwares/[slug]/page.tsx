"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Star,
  FileText,
  ChevronDown,
  ImageIcon,
} from "@/lib/fa-icons";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import Container from "@/components/Container";
import SoftwareReviews from "@/components/SoftwareReviews";
import { getSoftwareBySlug } from "@/app/dashboard/softwares/actions";

type FaqItem = { question?: string; answer?: string };
type SentimentRow = { theme?: string; sentiment?: string; summary?: string };
type SoftwareRecord = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  category?: string | null;
  rating: number | null;
  reportUrl: string | null;
  introduction: string | null;
  ourVerdict: string | null;
  keyTakeaways: string[];
  pros: string[];
  cons: string[];
  pictures: string[];
  howItWorks: string | null;
  whoIsItFor: string | null;
  howItIsDifferent: string | null;
  sentiments: SentimentRow[] | null;
  specifications: Record<string, string> | null;
  faqs: FaqItem[] | null;
  createdAt: Date | string;
  updatedAt: Date | string;
};

const sections = [
  { id: "introduction", label: "Introduction" },
  { id: "verdict", label: "Verdict" },
  { id: "takeaways", label: "Takeaways" },
  { id: "pros-cons", label: "Pros & cons" },
  { id: "gallery", label: "Gallery" },
  { id: "deep-dive", label: "Deep dive" },
  { id: "sentiments", label: "Market sentiment" },
  { id: "specifications", label: "Specifications" },
  { id: "faqs", label: "FAQs" },
  { id: "reviews", label: "Reviews" },
];

function filterStrings(items: string[] | undefined | null) {
  return (items || [])
    .filter((s) => s !== null && s !== undefined)
    .map((s) => (typeof s === "string" ? s : String(s)))
    .filter((s) => s.trim());
}

function formatDate(iso: string | Date) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-primary-navy/45">
      {children}
    </span>
  );
}

function EmptyBlock({ message }: { message: string }) {
  return (
    <p className="text-xs leading-relaxed text-zinc-400">{message}</p>
  );
}

function ProseBlock({ text }: { text: string }) {
  return (
    <p className="text-sm leading-relaxed text-zinc-600 whitespace-pre-line">{text}</p>
  );
}

function SentimentPill({ value }: { value: string }) {
  const v = value.toLowerCase();
  const styles =
    v === "positive"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : v === "negative"
      ? "bg-red-50 text-red-700 ring-red-200"
      : v === "mixed"
      ? "bg-amber-50 text-amber-700 ring-amber-200"
      : "bg-zinc-100 text-zinc-600 ring-zinc-200";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset ${styles}`}>
      {value}
    </span>
  );
}

export default function SoftwareDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [software, setSoftware] = useState<SoftwareRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedFaqs, setExpandedFaqs] = useState<Record<number, boolean>>({});
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    async function loadData() {
      if (!slug) return;
      try {
        const res = await getSoftwareBySlug(slug);
        if (res.success && res.data) {
          setSoftware(res.data as SoftwareRecord);
        } else {
          setSoftware(null);
        }
      } catch (err) {
        console.error("Error loading software detail:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-50">
        <Navbar onMenuClick={() => setIsMenuOpen(true)} />
        <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        <Container className="py-10">
          <div className="mb-6 h-4 w-28 animate-pulse rounded-sm bg-zinc-200" />
          <div className="grid gap-px overflow-hidden rounded-sm border border-zinc-200 bg-zinc-200 lg:grid-cols-12">
            <div className="h-40 animate-pulse bg-white lg:col-span-4" />
            <div className="h-40 animate-pulse bg-white lg:col-span-8" />
          </div>
          <div className="mt-6 h-64 animate-pulse rounded-sm border border-zinc-200 bg-white" />
        </Container>
        <Footer />
      </main>
    );
  }

  if (!software) {
    return (
      <main className="min-h-screen bg-zinc-50">
        <Navbar onMenuClick={() => setIsMenuOpen(true)} />
        <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        <div className="mx-auto max-w-lg px-6 py-28 text-center">
          <SectionLabel>Not found</SectionLabel>
          <h1 className="mt-3 text-xl font-black text-primary-navy">Profile not in index</h1>
          <p className="mt-2 text-sm text-zinc-500">
            This software slug does not exist or was removed from the catalog.
          </p>
          <Link
            href="/#catalog"
            className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary-navy hover:underline"
          >
            <ArrowLeft size={14} />
            Back to catalog
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  const specifications =
    software.specifications && typeof software.specifications === "object"
      ? (software.specifications as Record<string, string>)
      : {};
  const specEntries = Object.entries(specifications)
    .map(([k, v]) => [k, v === null || v === undefined ? "" : typeof v === "string" ? v : String(v)] as [string, string])
    .filter(([, v]) => v.trim());
  const faqs = Array.isArray(software.faqs) ? software.faqs : [];
  const validFaqs = faqs.filter((f) => typeof f?.question === "string" && f.question.trim());
  const sentiments = Array.isArray(software.sentiments) ? software.sentiments : [];
  const validSentiments = sentiments.filter((s) => typeof s?.theme === "string" && s.theme.trim());
  const takeaways = filterStrings(software.keyTakeaways);
  const pros = filterStrings(software.pros);
  const cons = filterStrings(software.cons);
  const pictures = filterStrings(software.pictures);
  const rating = software.rating ?? 0;

  const deepDive = [
    { id: "how-it-works", title: "How it works", body: software.howItWorks },
    { id: "who-is-it-for", title: "Who it is for", body: software.whoIsItFor },
    { id: "how-it-is-different", title: "How it is different", body: software.howItIsDifferent },
  ].filter((s) => s.body?.trim());

  return (
    <main className="min-h-screen bg-zinc-50">
      <Navbar onMenuClick={() => setIsMenuOpen(true)} />
      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <Container className="py-8 lg:py-10">
        {/* Meta rail */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-4">
          <Link
            href="/#catalog"
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 transition-colors hover:text-primary-navy"
          >
            <ArrowLeft size={14} />
            Catalog
          </Link>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] uppercase tracking-wider text-zinc-400">
            <span>{software.slug}</span>
            <span className="hidden h-3 w-px bg-zinc-200 sm:inline" aria-hidden />
            <span>Added {formatDate(software.createdAt)}</span>
            {software.updatedAt !== software.createdAt && (
              <>
                <span className="hidden h-3 w-px bg-zinc-200 sm:inline" aria-hidden />
                <span>Updated {formatDate(software.updatedAt)}</span>
              </>
            )}
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_11rem] lg:gap-10">
          {/* Main column */}
          <div className="space-y-6 min-w-0">
            {/* Header bento */}
            <div className="grid overflow-hidden rounded-sm border border-zinc-200 bg-zinc-200 gap-px lg:grid-cols-12">
              <div className="flex items-center justify-center bg-white p-4 lg:col-span-3">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-sm border border-zinc-100 bg-zinc-50">
                  {software.logo ? (
                    <img
                      src={software.logo}
                      alt=""
                      className="h-full w-full object-contain p-2"
                    />
                  ) : (
                    <span className="text-2xl font-black text-primary-navy/25">
                      {software.name.charAt(0)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col justify-center gap-3 bg-white p-4 sm:p-5 lg:col-span-6">
                <SectionLabel>{software.category || "Uncategorized"}</SectionLabel>
                <h1 className="text-2xl font-black tracking-tight text-primary-navy sm:text-3xl">
                  {software.name}
                </h1>
                {rating > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={12}
                          className={
                            star <= Math.round(rating)
                              ? "fill-primary-navy text-primary-navy"
                              : "text-zinc-200"
                          }
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold tabular-nums text-zinc-600">
                      {rating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid gap-px bg-zinc-200 sm:grid-cols-2 lg:col-span-3 lg:grid-cols-1">
                {software.reportUrl && (
                  <a
                    href={software.reportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between gap-2 bg-white px-4 py-3 text-sm font-bold text-primary-navy transition-colors hover:bg-zinc-50"
                  >
                    Report
                    <FileText size={14} className="text-zinc-400" />
                  </a>
                )}
                {!software.reportUrl && (
                  <div className="flex items-center bg-white px-4 py-3 text-xs text-zinc-400">
                    No external links
                  </div>
                )}
              </div>
            </div>

            {/* Introduction */}
            <section id="introduction" className="scroll-mt-24">
              <div className="overflow-hidden rounded-sm border border-zinc-200 bg-white">
                <div className="border-b border-zinc-100 bg-zinc-50/80 px-4 py-2">
                  <SectionLabel>Introduction</SectionLabel>
                </div>
                <div className="p-4 sm:p-5">
                  {software.introduction?.trim() ? (
                    <ProseBlock text={software.introduction} />
                  ) : (
                    <EmptyBlock message="No introduction added by admin." />
                  )}
                </div>
              </div>
            </section>

            {/* Verdict */}
            <section id="verdict" className="scroll-mt-24">
              <div className="relative overflow-hidden rounded-sm border border-primary-navy/20 bg-primary-navy text-white">
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.1]"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.85) 1px, transparent 0)",
                    backgroundSize: "24px 24px",
                  }}
                  aria-hidden
                />
                <div className="relative border-b border-white/10 px-4 py-2">
                  <SectionLabel>
                    <span className="text-white/45">Our verdict</span>
                  </SectionLabel>
                </div>
                <div className="relative p-4 sm:p-5">
                  {software.ourVerdict?.trim() ? (
                    <p className="text-sm leading-relaxed text-white/85 whitespace-pre-line">
                      {software.ourVerdict}
                    </p>
                  ) : (
                    <p className="text-sm text-white/50">Verdict not published yet.</p>
                  )}
                  {rating > 0 && (
                    <div className="mt-4 flex items-baseline gap-2 border-t border-white/10 pt-4">
                      <span className="text-2xl font-black tabular-nums">{rating.toFixed(1)}</span>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-white/40">
                        Admin rating
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Takeaways */}
            <section id="takeaways" className="scroll-mt-24">
              <div className="overflow-hidden rounded-sm border border-zinc-200 bg-white">
                <div className="border-b border-zinc-100 bg-zinc-50/80 px-4 py-2">
                  <SectionLabel>Key takeaways</SectionLabel>
                </div>
                <div className="p-4 sm:p-5">
                  {takeaways.length > 0 ? (
                    <ul className="space-y-2.5">
                      {takeaways.map((item, idx) => (
                        <li
                          key={idx}
                          className="flex gap-3 text-sm leading-relaxed text-zinc-600"
                        >
                          <span className="shrink-0 font-mono text-[10px] font-bold text-primary-navy/35 pt-0.5">
                            {String(idx + 1).padStart(2, "0")}
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <EmptyBlock message="No key takeaways listed." />
                  )}
                </div>
              </div>
            </section>

            {/* Pros & cons */}
            <section id="pros-cons" className="scroll-mt-24">
              <div className="grid gap-px overflow-hidden rounded-sm border border-zinc-200 bg-zinc-200 sm:grid-cols-2">
                <div className="bg-white">
                  <div className="border-b border-zinc-100 bg-zinc-50/80 px-4 py-2">
                    <SectionLabel>Pros</SectionLabel>
                  </div>
                  <div className="p-4 sm:p-5">
                    {pros.length > 0 ? (
                      <ul className="space-y-2">
                        {pros.map((item, idx) => (
                          <li
                            key={idx}
                            className="border-l-2 border-primary-navy/20 pl-3 text-sm text-zinc-600"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <EmptyBlock message="No pros documented." />
                    )}
                  </div>
                </div>
                <div className="bg-white">
                  <div className="border-b border-zinc-100 bg-zinc-50/80 px-4 py-2">
                    <SectionLabel>Cons</SectionLabel>
                  </div>
                  <div className="p-4 sm:p-5">
                    {cons.length > 0 ? (
                      <ul className="space-y-2">
                        {cons.map((item, idx) => (
                          <li
                            key={idx}
                            className="border-l-2 border-zinc-300 pl-3 text-sm text-zinc-600"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <EmptyBlock message="No cons documented." />
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Gallery — was missing entirely */}
            <section id="gallery" className="scroll-mt-24">
              <div className="overflow-hidden rounded-sm border border-zinc-200 bg-white">
                <div className="border-b border-zinc-100 bg-zinc-50/80 px-4 py-2">
                  <SectionLabel>Gallery</SectionLabel>
                </div>
                <div className="p-4 sm:p-5">
                  {pictures.length > 0 ? (
                    <div className="space-y-3">
                      <div className="relative aspect-video overflow-hidden rounded-sm border border-zinc-100 bg-zinc-50">
                        <img
                          src={pictures[activeImage]}
                          alt={`${software.name} screenshot ${activeImage + 1}`}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      {pictures.length > 1 && (
                        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                          {pictures.map((src, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setActiveImage(idx)}
                              className={`aspect-video overflow-hidden rounded-sm border transition-colors ${
                                activeImage === idx
                                  ? "border-primary-navy"
                                  : "border-zinc-100 hover:border-zinc-300"
                              }`}
                            >
                              <img
                                src={src}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-zinc-400">
                      <ImageIcon size={18} />
                      <EmptyBlock message="No gallery images uploaded." />
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Deep dive */}
            <section id="deep-dive" className="scroll-mt-24">
              <div className="overflow-hidden rounded-sm border border-zinc-200 bg-zinc-200 gap-px">
                <div className="border-b border-zinc-100 bg-zinc-50/80 px-4 py-2 bg-white">
                  <SectionLabel>Deep dive</SectionLabel>
                </div>
                {deepDive.length > 0 ? (
                  <div className="grid gap-px bg-zinc-200">
                    {deepDive.map((block) => (
                      <article key={block.id} className="bg-white p-4 sm:p-5">
                        <h3 className="text-sm font-bold text-primary-navy">{block.title}</h3>
                        <div className="mt-2">
                          <ProseBlock text={block.body!} />
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white p-4 sm:p-5">
                    <EmptyBlock message="Deep dive sections not filled in yet." />
                  </div>
                )}
              </div>
            </section>

            {/* Market sentiment */}
            <section id="sentiments" className="scroll-mt-24">
              <div className="overflow-hidden rounded-sm border border-zinc-200 bg-white">
                <div className="border-b border-zinc-100 bg-zinc-50/80 px-4 py-2">
                  <SectionLabel>Market sentiment</SectionLabel>
                </div>
                {validSentiments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-zinc-100 bg-zinc-50/40 text-xs font-bold uppercase tracking-wider text-zinc-400">
                          <th className="px-4 py-2.5 sm:px-5">Theme</th>
                          <th className="px-4 py-2.5 sm:px-5">Sentiment</th>
                          <th className="px-4 py-2.5 sm:px-5">What users say</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {validSentiments.map((row, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-3 align-top font-bold text-primary-navy sm:px-5">
                              {row.theme}
                            </td>
                            <td className="px-4 py-3 align-top sm:px-5">
                              <SentimentPill value={row.sentiment || "Neutral"} />
                            </td>
                            <td
                              className="px-4 py-3 align-top whitespace-pre-line text-zinc-600 [&_table]:my-2 [&_table]:w-full [&_td]:p-1.5 sm:px-5"
                              dangerouslySetInnerHTML={{
                                __html: row.summary?.trim() || "—",
                              }}
                            />
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-4 sm:p-5">
                    <EmptyBlock message="No sentiment breakdown published for this product." />
                  </div>
                )}
              </div>
            </section>

            {/* Specifications */}
            <section id="specifications" className="scroll-mt-24">
              <div className="overflow-hidden rounded-sm border border-zinc-200 bg-white">
                <div className="border-b border-zinc-100 bg-zinc-50/80 px-4 py-2">
                  <SectionLabel>Specifications</SectionLabel>
                </div>
                {specEntries.length > 0 ? (
                  <dl className="divide-y divide-zinc-100">
                    {specEntries.map(([key, value]) => (
                      <div
                        key={key}
                        className="grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4 sm:px-5"
                      >
                        <dt className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                          {key}
                        </dt>
                        <dd className="text-sm font-medium text-zinc-700">{value}</dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <div className="p-4 sm:p-5">
                    <EmptyBlock message="No specification fields added." />
                  </div>
                )}
              </div>
            </section>

            {/* FAQs */}
            <section id="faqs" className="scroll-mt-24">
              <div className="overflow-hidden rounded-sm border border-zinc-200 bg-white">
                <div className="border-b border-zinc-100 bg-zinc-50/80 px-4 py-2">
                  <SectionLabel>FAQs</SectionLabel>
                </div>
                {validFaqs.length > 0 ? (
                  <div className="divide-y divide-zinc-100">
                    {validFaqs.map((faq, idx) => (
                      <div key={idx}>
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedFaqs((prev) => ({ ...prev, [idx]: !prev[idx] }))
                          }
                          className="flex w-full items-start justify-between gap-4 px-4 py-3.5 text-left transition-colors hover:bg-zinc-50/80 sm:px-5"
                        >
                          <span className="text-sm font-bold text-primary-navy">
                            {faq.question}
                          </span>
                          <ChevronDown
                            size={16}
                            className={`shrink-0 text-zinc-400 transition-transform ${
                              expandedFaqs[idx] ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {expandedFaqs[idx] && faq.answer?.trim() && (
                          <div className="border-t border-zinc-50 bg-zinc-50/50 px-4 pb-4 pt-0 sm:px-5">
                            <p className="pt-3 text-sm leading-relaxed text-zinc-600 whitespace-pre-line">
                              {faq.answer}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 sm:p-5">
                    <EmptyBlock message="No FAQs published for this product." />
                  </div>
                )}
              </div>
            </section>

            <SoftwareReviews slug={software.slug} />
          </div>

          {/* Sticky section index — desktop only */}
          <aside className="hidden lg:block">
            <nav
              className="sticky top-24 overflow-hidden rounded-sm border border-zinc-200 bg-white"
              aria-label="On this page"
            >
              <div className="border-b border-zinc-100 bg-zinc-50/80 px-3 py-2">
                <SectionLabel>On this page</SectionLabel>
              </div>
              <ul className="p-2">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="block rounded-sm px-2 py-1.5 text-xs font-semibold text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-primary-navy"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        </div>
      </Container>

      <Footer />
    </main>
  );
}
