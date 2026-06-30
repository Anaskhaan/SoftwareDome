"use client";

import { useState } from "react";
import Link from "next/link";

const FAQS = [
  {
    q: "What is SoftwareDome, and how can it help my business?",
    a: "SoftwareDome is a B2B software discovery platform built to help businesses find the right tools, faster. Instead of spending hours researching scattered options, you get unbiased reviews, expert recommendations, and a curated catalog of business software — all in one place.",
  },
  {
    q: "Can I trust SoftwareDome reviews?",
    a: "Yes. SoftwareDome reviews are sourced from real, verified users, not paid placements. We provide transparent pricing breakdowns, product demos, and honest industry insights so you can make decisions based on facts, not sales pitches.",
  },
  {
    q: "Is there a cost to use SoftwareDome?",
    a: "No — SoftwareDome is completely free to use. Every review, comparison, and buying guide on our platform is free to access, because we believe businesses of every size deserve unbiased software guidance without hidden fees or paywalls.",
  },
  {
    q: "How can software vendors benefit from SoftwareDome?",
    a: "Vendors can join the SoftwareDome Vendor Program to generate qualified, ready-to-buy leads at a lower cost per acquisition, strengthen brand visibility, and connect directly with buyers who are actively searching for solutions like theirs.",
  },
  {
    q: "Which software categories does SoftwareDome cover?",
    a: "SoftwareDome covers a wide range of software categories, including Healthcare/Medical, HR, Accounting, CRM, Project Management, CMMS, Field Service Management, and Legal Practice Management — with more added regularly. Whether you're a solo practice or a large enterprise, we help you compare options across every budget and deployment model (cloud, on-premise, or hybrid).",
  },
];

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(0); // First item expanded by default to match screenshot

  return (
    <div
      className="flex flex-col lg:flex-row items-stretch justify-center w-full"
      style={{ gap: "50px" }}
    >
      {/* ── Left Column: Heading + Subtitle + Helper Card ── */}
      <div
        className="flex flex-col items-start justify-between flex-shrink-0 w-full lg:w-[423.75px]"
        style={{ gap: "40px" }}
      >
        {/* Header Text Block */}
        <div
          className="flex flex-col items-start w-full"
          style={{ gap: "16px" }}
        >
          <div className="flex flex-col items-start" style={{ gap: "8px" }}>
            {/* FAQ'S */}
            <span
              style={{
                fontFamily:
                  'var(--font-jakarta), "Plus Jakarta Sans", sans-serif',
                fontWeight: 700,
                fontSize: "16px",
                lineHeight: "28px",
                textTransform: "uppercase",
                color: "#2F6C25",
              }}
            >
              FAQ's
            </span>
            {/* Frequently asked questions */}
            <h2
              style={{
                fontFamily:
                  'var(--font-jakarta), "Plus Jakarta Sans", sans-serif',
                fontWeight: 700,
                fontSize: "clamp(28px, 4vw, 46px)",
                lineHeight: "clamp(36px, 5.5vw, 60px)",
                letterSpacing: "-1.04px",
                color: "#23252C",
                margin: 0,
              }}
            >
              Frequently asked questions
            </h2>
          </div>
          {/* Paragraph */}
          <p
            style={{
              fontFamily: "var(--font-sora), Sora, sans-serif",
              fontWeight: 400,
              fontSize: "clamp(15px, 1.8vw, 20px)",
              lineHeight: "32px",
              color: "#54565B",
              margin: 0,
            }}
          >
            Find quick answers to common questions about the platform, pricing,
            and security.
          </p>
        </div>
      </div>

      {/* ── Right Column: FAQ Accordion List ── */}
      <div
        className="flex flex-col items-stretch flex-grow w-full lg:w-[806.25px]"
        style={{ gap: "20px" }}
      >
        {FAQS.map((faq, i) => {
          const isOpen = open === i;
          return (
            <div
              key={i}
              className="flex flex-col bg-white border border-[#F2F2F2]"
              style={{
                borderRadius: "20px",
                boxSizing: "border-box",
                overflow: "hidden",
                transition: "all 0.3s ease",
              }}
            >
              {/* Accordion Item Header */}
              <div
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex flex-row justify-between items-center cursor-pointer p-5"
                style={{
                  gap: "24px",
                  boxSizing: "border-box",
                  userSelect: "none",
                }}
              >
                <h3
                  style={{
                    fontFamily:
                      'var(--font-jakarta), "Plus Jakarta Sans", sans-serif',
                    fontWeight: 600,
                    fontSize: "clamp(15px, 1.8vw, 20px)",
                    lineHeight: "1.4",
                    color: "#1D1D1D",
                    margin: 0,
                    flexGrow: 1,
                  }}
                >
                  {faq.q}
                </h3>

                {/* Circular Toggle Icon */}
                <div
                  className="flex items-center justify-center shrink-0 relative"
                  style={{
                    width: "30px",
                    height: "30px",
                    background: "#EDF1F4",
                    borderRadius: "100px",
                  }}
                >
                  {/* Horizontal line (always present) */}
                  <div
                    style={{
                      position: "absolute",
                      width: "16px",
                      height: "2px",
                      background: "#1D1D1D",
                      borderRadius: "100px",
                      left: "7px",
                      top: "14px",
                    }}
                  />
                  {/* Vertical line (only present when collapsed, rotates on expand) */}
                  <div
                    style={{
                      position: "absolute",
                      width: "2px",
                      height: "16px",
                      background: "#1D1D1D",
                      borderRadius: "100px",
                      left: "14px",
                      top: "7px",
                      transition: "transform 0.2s ease, opacity 0.2s ease",
                      transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                      opacity: isOpen ? 0 : 1,
                    }}
                  />
                </div>
              </div>

              {/* Accordion Item Answer Area */}
              <div
                style={{
                  maxHeight: isOpen ? "200px" : "0px",
                  overflow: "hidden",
                  transition: "max-height 0.3s ease-in-out",
                }}
              >
                <div
                  style={{
                    padding: "0 20px 20px 20px",
                    boxSizing: "border-box",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "var(--font-sora), Sora, sans-serif",
                      fontWeight: 400,
                      fontSize: "16px",
                      lineHeight: "21px",
                      color: "#4D585F",
                      margin: 0,
                    }}
                  >
                    {faq.a}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
