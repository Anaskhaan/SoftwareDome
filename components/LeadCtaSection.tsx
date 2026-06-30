"use client";

import { useState } from "react";
import Link from "next/link";
import { submitGeneralLead } from "@/app/dashboard/demo-requests/actions";

export default function LeadCtaSection() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    organization: "",
  });
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setStatus({
        type: "error",
        text: "You must agree to the terms and privacy policy.",
      });
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      const result = await submitGeneralLead(formData);
      if (result.success) {
        setStatus({
          type: "success",
          text: "Request sent — we'll be in touch shortly.",
        });
        setForm({ name: "", email: "", phone: "", organization: "" });
        setAgreed(false);
      } else {
        setStatus({
          type: "error",
          text: result.error || "Something went wrong.",
        });
      }
    } catch (err) {
      console.error(err);
      setStatus({
        type: "error",
        text: "An error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="m-1">
      {/* ── Banner Card ── */}
      <div
        className="relative overflow-hidden w-full lg:min-h-[450px]"
        style={{
          borderRadius: "24px",
          backgroundImage: `linear-gradient(90deg, rgba(7, 41, 41, 0.85) 0%, rgba(7, 41, 41, 0.4) 100%), url("https://images.unsplash.com/photo-1472214222541-d510753a4707?auto=format&fit=crop&w=1600&q=80")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Subtle Green Tint Overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, rgba(177, 250, 99, 0.2) 0%, rgba(177, 250, 99, 0.05) 100%)",
            borderRadius: "24px",
            zIndex: 1,
          }}
        />

        {/* Content Container - 1280px Max Width */}
        <div
          className="relative mx-auto w-full px-4 md:px-10 py-8 md:py-16"
          style={{
            maxWidth: "1280px",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "40px",
            zIndex: 2,
          }}
        >
          {/* ── Left Column: Content Block ── */}
          <div
            className="relative flex flex-col items-start justify-center text-white flex-1"
            style={{ gap: "24px" }}
          >
            <div className="flex flex-col items-start" style={{ gap: "16px" }}>
              <div className="flex flex-row items-center flex-wrap gap-4">
                {/* Talk to Solution Experts for Free. */}
                <span
                  style={{
                    fontFamily:
                      'var(--font-jakarta), "Plus Jakarta Sans", sans-serif',
                    fontWeight: 400,
                    fontSize: "16px",
                    lineHeight: "22px",
                    letterSpacing: "-0.32px",
                    color: "#FFFFFF",
                  }}
                >
                  Talk to Solution Experts for Free.
                </span>

                {/* Overlapping Avatars Row */}
                <div
                  className="flex flex-row items-center"
                  style={{ gap: "10px" }}
                >
                  <div
                    className="flex flex-row items-center"
                    style={{ width: "100px" }}
                  >
                    {/* Avatar 1 */}
                    <div
                      className="rounded-full border-2 border-[#072929] overflow-hidden"
                      style={{ width: "40px", height: "40px" }}
                    >
                      <img
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                    {/* Avatar 2 */}
                    <div
                      className="rounded-full border-2 border-[#072929] overflow-hidden -ml-3"
                      style={{ width: "40px", height: "40px" }}
                    >
                      <img
                        src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80"
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                    {/* Avatar 3 */}
                    <div
                      className="rounded-full border-2 border-[#072929] overflow-hidden -ml-3"
                      style={{ width: "40px", height: "40px" }}
                    >
                      <img
                        src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=100&q=80"
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  </div>

                  {/* Plus sign */}
                  <span
                    style={{
                      fontFamily: "var(--font-sans), sans-serif",
                      fontSize: "18px",
                      fontWeight: 700,
                      color: "#FFFFFF",
                    }}
                  >
                    +
                  </span>

                  {/* "You" Blue Badge */}
                  <div
                    className="flex items-center justify-center text-white text-[14px] font-bold"
                    style={{
                      width: "40px",
                      height: "40px",
                      background:
                        "linear-gradient(270deg, #3B82F6 0%, #406AE4 100%)",
                      borderRadius: "100px",
                    }}
                  >
                    You
                  </div>
                </div>
              </div>

              {/* Need Help Deciding? */}
              <h2
                style={{
                  fontFamily:
                    'var(--font-jakarta), "Plus Jakarta Sans", sans-serif',
                  fontWeight: 500,
                  fontSize: "48px",
                  lineHeight: "58px",
                  letterSpacing: "-2.88px",
                  color: "#FFFFFF",
                  margin: 0,
                }}
              >
                Need Help Deciding?
              </h2>
            </div>

            {/* Subtitle / Description text */}
            <p
              style={{
                fontFamily:
                  'var(--font-jakarta), "Plus Jakarta Sans", sans-serif',
                fontWeight: 400,
                fontSize: "16px",
                lineHeight: "22px",
                letterSpacing: "-0.32px",
                color: "#FFFFFF",
                margin: 0,
              }}
            >
              We’ll help you find the right tools that fit your budget and
              business needs. Just fill in the form and we’ll get back to you.
            </p>
          </div>

          {/* ── Right Column: Form Container Card ── */}
          <div
            className="relative bg-[#FBFFF7] p-8 max-w-[416px] flex flex-col justify-between"
            style={{
              borderRadius: "16px",
              height: "450px",
              boxSizing: "border-box",
              zIndex: 2,
              boxShadow: "0px 10px 40px rgba(0, 0, 0, 0.05)",
              flexShrink: 0,
            }}
          >
            <form
              onSubmit={handleSubmit}
              className="flex flex-col justify-between items-stretch h-full w-full"
              style={{ gap: "10px" }}
            >
              {/* Inputs Block */}
              <div className="flex flex-col gap-3 w-full">
                {/* Name Input */}
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full h-[50px] bg-white border border-[#F2F2F2] outline-none placeholder-zinc-400 focus:border-brand-green/45 focus:ring-2 focus:ring-brand-green/10 transition-all"
                  style={{
                    borderRadius: "52px",
                    padding: "12px 16px",
                    fontSize: "16px",
                    fontFamily: "var(--font-sora), Sora, sans-serif",
                    boxSizing: "border-box",
                    color: "#1D1D1D",
                  }}
                />

                {/* Phone Input */}
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  className="w-full h-[50px] bg-white border border-[#F2F2F2] outline-none placeholder-zinc-400 focus:border-brand-green/45 focus:ring-2 focus:ring-brand-green/10 transition-all"
                  style={{
                    borderRadius: "52px",
                    padding: "12px 16px",
                    fontSize: "16px",
                    fontFamily: "var(--font-sora), Sora, sans-serif",
                    boxSizing: "border-box",
                    color: "#1D1D1D",
                  }}
                />

                {/* Email Input */}
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full h-[50px] bg-white border border-[#F2F2F2] outline-none placeholder-zinc-400 focus:border-brand-green/45 focus:ring-2 focus:ring-brand-green/10 transition-all"
                  style={{
                    borderRadius: "52px",
                    padding: "12px 16px",
                    fontSize: "16px",
                    fontFamily: "var(--font-sora), Sora, sans-serif",
                    boxSizing: "border-box",
                    color: "#1D1D1D",
                  }}
                />

                {/* Organization Input */}
                <input
                  type="text"
                  name="organization"
                  placeholder="Organization"
                  value={form.organization}
                  onChange={handleChange}
                  required
                  className="w-full h-[50px] bg-white border border-[#F2F2F2] outline-none placeholder-zinc-400 focus:border-brand-green/45 focus:ring-2 focus:ring-brand-green/10 transition-all"
                  style={{
                    borderRadius: "52px",
                    padding: "12px 16px",
                    fontSize: "16px",
                    fontFamily: "var(--font-sora), Sora, sans-serif",
                    boxSizing: "border-box",
                    color: "#1D1D1D",
                  }}
                />
              </div>

              {/* Checkbox with T&C */}
              <div
                className="flex flex-row items-start"
                style={{ gap: "10px" }}
              >
                <input
                  type="checkbox"
                  id="agreed-lead"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-5 h-5 shrink-0 accent-brand-green cursor-pointer mt-0.5"
                  style={{
                    border: "1px solid #808080",
                    borderRadius: "4px",
                  }}
                />
                <label
                  htmlFor="agreed-lead"
                  className="cursor-pointer select-none text-[10px] leading-[17px] text-[#072929]"
                  style={{ fontFamily: "var(--font-sora), Sora, sans-serif" }}
                >
                  I agree to receive SMS and Email marketing messages and
                  notifications from SoftwareDome. By opting in, I agree to the{" "}
                  <Link
                    href="/terms"
                    className="text-[#5BA40D] font-semibold hover:underline"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="text-[#5BA40D] font-semibold hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  .
                </label>
              </div>

              {/* Submit Button & Status */}
              <div className="flex flex-col w-full" style={{ gap: "4px" }}>
                <div
                  style={{
                    width: "100%",
                    height: "61px",
                    background: "rgba(176, 255, 159, 0.2)",
                    borderRadius: "100px",
                    padding: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxSizing: "border-box",
                  }}
                >
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex flex-row items-center w-full transition-all hover:opacity-95"
                    style={{
                      height: "49px",
                      background:
                        "linear-gradient(180deg, #B0FE5E 0%, #5BA40D 100%)",
                      boxShadow:
                        "0px 5px 23px rgba(214, 253, 112, 0.3), inset -4px -4px 8px rgba(255, 255, 255, 0.3), inset 4px 4px 8px rgba(255, 255, 255, 0.3)",
                      borderRadius: "100px",
                      padding: "12px 24px",
                      border: "none",
                      cursor: "pointer",
                      boxSizing: "border-box",
                    }}
                  >
                    <span
                      className="flex-1 text-center"
                      style={{
                        fontFamily: "var(--font-sora), Sora, sans-serif",
                        fontWeight: 600,
                        fontSize: "16px",
                        lineHeight: "23px",
                        color: "#FFFFFF",
                      }}
                    >
                      {loading ? "Sending..." : "Get Started"}
                    </span>

                    {/* Right Arrow Circle */}
                    <div
                      className="flex items-center justify-center"
                      style={{
                        width: "32px",
                        height: "32px",
                        background: "#FFFFFF",
                        borderRadius: "100px",
                      }}
                    >
                      <svg
                        width="12"
                        height="8"
                        viewBox="0 0 12 8"
                        fill="none"
                        aria-hidden
                      >
                        <path
                          d="M1 4H11M8 1L11 4L8 7"
                          stroke="#1D1D1D"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </button>
                </div>

                {status && (
                  <p
                    className={`text-center text-[11px] font-semibold m-0 mt-1 ${
                      status.type === "success"
                        ? "text-emerald-600"
                        : "text-red-500"
                    }`}
                    style={{ fontFamily: "var(--font-sora), Sora, sans-serif" }}
                  >
                    {status.text}
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
