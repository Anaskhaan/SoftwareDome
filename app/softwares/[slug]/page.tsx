"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Star,
  Globe,
  CheckCircle,
  XCircle,
  HelpCircle,
  Cpu,
  Layers,
  Sparkles,
  Info,
  ListPlus,
  BookOpen
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { getSoftwareBySlug } from "@/app/dashboard/softwares/actions";

export default function SoftwareDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [software, setSoftware] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // FAQ Accordion State
  const [expandedFaqs, setExpandedFaqs] = useState<Record<number, boolean>>({});

  useEffect(() => {
    async function loadData() {
      if (!slug) return;
      try {
        const res = await getSoftwareBySlug(slug);
        if (res.success && res.data) {
          setSoftware(res.data);
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

  const toggleFaq = (index: number) => {
    setExpandedFaqs((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50/50 flex flex-col justify-between">
        <Navbar onMenuClick={() => setIsMenuOpen(true)} />
        <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        <div className="flex-1 max-w-5xl w-full mx-auto px-6 py-20 flex flex-col gap-8">
          <div className="h-6 w-32 bg-slate-200 animate-pulse rounded" />
          <div className="bg-white border border-slate-100 rounded-3xl p-8 animate-pulse flex flex-col gap-6">
            <div className="flex gap-6 items-center">
              <div className="w-20 h-20 bg-slate-200 rounded-2xl" />
              <div className="space-y-3 flex-1">
                <div className="h-6 bg-slate-200 rounded w-1/3" />
                <div className="h-4 bg-slate-200 rounded w-1/4" />
              </div>
            </div>
            <div className="h-20 bg-slate-200 rounded-xl" />
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  if (!software) {
    return (
      <main className="min-h-screen bg-slate-50/50 flex flex-col justify-between">
        <Navbar onMenuClick={() => setIsMenuOpen(true)} />
        <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        <div className="flex-1 flex flex-col items-center justify-center py-32 px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-6">
            <Info size={32} />
          </div>
          <h1 className="text-2xl font-black text-[#0a192f] mb-2">Review Profile Not Found</h1>
          <p className="text-sm text-slate-500 max-w-md mb-8">
            The software page you are trying to view doesn't exist or has been removed by the administrator.
          </p>
          <Link
            href="/"
            className="px-6 py-3 bg-[#0a192f] hover:bg-[#142d52] text-white font-bold rounded-xl shadow-md transition-all text-sm"
          >
            Return to Homepage
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  // Parse custom structures safely
  const specifications = software.specifications as Record<string, string> || {};
  const faqs = (software.faqs as any[]) || [];

  return (
    <main className="min-h-screen bg-slate-50/50 flex flex-col justify-between font-sans">
      <Navbar onMenuClick={() => setIsMenuOpen(true)} />
      <Sidebar isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <div className="flex-1 max-w-5xl w-full mx-auto px-6 py-12">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-[#0a192f] font-bold text-sm mb-8 transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Softwares
        </Link>

        {/* Premium Product Header Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm relative overflow-hidden mb-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/30 rounded-full blur-2xl -z-10" />
          
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              {/* Product Logo */}
              <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                {software.logo ? (
                  <img
                    src={software.logo}
                    alt={software.name}
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <span className="text-3xl font-black text-[#0a192f]/30">
                    {software.name?.charAt(0)}
                  </span>
                )}
              </div>

              {/* Title & Stats */}
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                  <Layers size={12} />
                  {software.category || "Uncategorized"}
                </span>
                <h1 className="text-3xl font-black text-[#0a192f] tracking-tight leading-none mb-2">
                  {software.name}
                </h1>
                
                {software.rating > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          className={`${
                            star <= Math.round(software.rating)
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-slate-200 fill-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-black text-slate-700">
                      {software.rating.toFixed(1)} / 5 Rating
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              {software.website && (
                <a
                  href={software.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0a192f] hover:bg-[#142d52] text-white font-extrabold rounded-xl shadow-sm text-sm transition-all"
                >
                  <Globe size={16} />
                  Visit Website
                </a>
              )}
              {software.reportUrl && (
                <a
                  href={software.reportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-50 hover:bg-slate-100 text-[#0a192f] font-extrabold rounded-xl border border-slate-200 text-sm transition-all"
                >
                  External Report
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 mb-8 overflow-x-auto gap-8 scrollbar-none">
          {[
            { id: "overview", label: "Overview & Verdict", icon: Sparkles },
            { id: "deepdive", label: "Deep Dive Analysis", icon: BookOpen },
            { id: "specs", label: "Specifications", icon: Cpu },
            { id: "faqs", label: "Frequently Asked FAQs", icon: HelpCircle }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 border-b-2 font-bold text-sm shrink-0 transition-all ${
                activeTab === tab.id
                  ? "border-[#0a192f] text-[#0a192f]"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENTS */}
        <div>
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-10">
              {/* Introduction & Verdict */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-xl font-black text-[#0a192f] mb-4">Introduction</h2>
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                      {software.introduction || "No introduction has been provided for this product yet."}
                    </p>
                  </div>

                  {/* Key Takeaways */}
                  {software.keyTakeaways && software.keyTakeaways.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                      <h2 className="text-xl font-black text-[#0a192f] mb-4">Key Takeaways</h2>
                      <ul className="space-y-3.5">
                        {software.keyTakeaways.map((takeaway: string, idx: number) => (
                          takeaway && (
                            <li key={idx} className="flex items-start gap-3">
                              <CheckCircle size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                              <span className="text-slate-600 text-sm">{takeaway}</span>
                            </li>
                          )
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Our Verdict Panel */}
                <div className="bg-gradient-to-br from-[#0a192f] to-[#1a365d] rounded-2xl p-6 text-white shadow-md relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl" />
                  <div>
                    <h3 className="text-lg font-black tracking-tight mb-4 flex items-center gap-2">
                      <Sparkles size={18} className="text-yellow-400 fill-yellow-400" />
                      Our Verdict
                    </h3>
                    <p className="text-slate-200 text-xs leading-relaxed whitespace-pre-line">
                      {software.ourVerdict ||
                        "Our dedicated review experts are compiling testing evaluations for this software. Stay tuned for our finalized review score and in-depth breakdown!"}
                    </p>
                  </div>
                  {software.rating > 0 && (
                    <div className="border-t border-white/10 pt-4 mt-6">
                      <div className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 mb-1">
                        Antigravity Grade
                      </div>
                      <div className="text-3xl font-black">{software.rating.toFixed(1)} / 5.0</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Pros & Cons Side-by-Side */}
              {((software.pros && software.pros.length > 0) || (software.cons && software.cons.length > 0)) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Pros */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-black text-emerald-700 flex items-center gap-2 mb-4">
                      <CheckCircle size={20} className="text-emerald-500" /> Pros
                    </h3>
                    <ul className="space-y-3">
                      {software.pros?.map((pro: string, idx: number) => (
                        pro && (
                          <li key={idx} className="flex items-start gap-2.5">
                            <span className="text-emerald-500 text-sm font-bold mt-0.5">•</span>
                            <span className="text-slate-600 text-sm leading-relaxed">{pro}</span>
                          </li>
                        )
                      ))}
                    </ul>
                  </div>

                  {/* Cons */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-black text-rose-700 flex items-center gap-2 mb-4">
                      <XCircle size={20} className="text-rose-500" /> Cons
                    </h3>
                    <ul className="space-y-3">
                      {software.cons?.map((con: string, idx: number) => (
                        con && (
                          <li key={idx} className="flex items-start gap-2.5">
                            <span className="text-rose-500 text-sm font-bold mt-0.5">•</span>
                            <span className="text-slate-600 text-sm leading-relaxed">{con}</span>
                          </li>
                        )
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DEEP DIVE */}
          {activeTab === "deepdive" && (
            <div className="space-y-8">
              {[
                { title: "How It Works", content: software.howItWorks },
                { title: "Who Is It For?", content: software.whoIsItFor },
                { title: "How It Stands Out", content: software.howItIsDifferent },
                { title: "Market & User Sentiment", content: software.sentiments }
              ].map((section, idx) => (
                section.content && (
                  <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-xl font-black text-[#0a192f] mb-4 flex items-center gap-2">
                      <ListPlus size={18} className="text-blue-500" />
                      {section.title}
                    </h2>
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                      {section.content}
                    </p>
                  </div>
                )
              ))}

              {!software.howItWorks &&
                !software.whoIsItFor &&
                !software.howItIsDifferent &&
                !software.sentiments && (
                  <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <BookOpen size={32} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-base font-bold text-[#0a192f]">Deep Dive Pending</h3>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                      Detailed structural blueprints and architectural analyses are currently compiling.
                    </p>
                  </div>
                )}
            </div>
          )}

          {/* TAB 3: SPECIFICATIONS */}
          {activeTab === "specs" && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-black text-[#0a192f] mb-6 flex items-center gap-2">
                <Cpu size={18} className="text-blue-500" />
                Technical Specifications
              </h2>

              {Object.keys(specifications).length > 0 &&
              Object.values(specifications).some(Boolean) ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(specifications).map(([key, value]) => (
                    value && (
                      <div
                        key={key}
                        className="flex justify-between items-center px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl"
                      >
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                          {key}
                        </span>
                        <span className="text-sm font-extrabold text-slate-800">{value}</span>
                      </div>
                    )
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Cpu size={32} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-xs text-slate-500">No specifications listed for this software profile.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: FAQS */}
          {activeTab === "faqs" && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-black text-[#0a192f] mb-6 flex items-center gap-2">
                <HelpCircle size={18} className="text-blue-500" />
                Frequently Asked Questions
              </h2>

              {faqs.length > 0 && faqs.some((f) => f.question) ? (
                <div className="space-y-4">
                  {faqs.map((faq: any, idx: number) => (
                    faq.question && (
                      <div
                        key={idx}
                        className="border border-slate-100 rounded-xl overflow-hidden transition-all duration-200"
                      >
                        <button
                          onClick={() => toggleFaq(idx)}
                          className="w-full flex justify-between items-center text-left px-5 py-4 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                        >
                          <span className="text-sm font-bold text-[#0a192f] pr-4">
                            {faq.question}
                          </span>
                          <span
                            className={`text-slate-400 font-bold transition-transform duration-200 shrink-0 ${
                              expandedFaqs[idx] ? "rotate-180" : ""
                            }`}
                          >
                            ▼
                          </span>
                        </button>

                        {expandedFaqs[idx] && (
                          <div className="px-5 py-4 bg-white border-t border-slate-50 text-slate-600 text-xs leading-relaxed whitespace-pre-line animate-fadeIn">
                            {faq.answer || "Answer is pending update."}
                          </div>
                        )}
                      </div>
                    )
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <HelpCircle size={32} className="mx-auto text-slate-300 mb-3" />
                  <p className="text-xs text-slate-500">No FAQs have been loaded for this profile yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
