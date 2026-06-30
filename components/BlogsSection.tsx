import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";

const PLACEHOLDER_BLOGS = [
  {
    id: "placeholder-1",
    title: "Best HRIS Systems For Large Companies In 2026",
    slug: "best-hris-systems-large-companies-2026",
    coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "placeholder-2",
    title: "Deel Vs Remote: Which Global HR Platform Suits Your Team?",
    slug: "deel-vs-remote-global-hr-platform-suits-team",
    coverImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "placeholder-3",
    title: "Best Compensation Management Software (2026)",
    slug: "best-compensation-management-software-2026",
    coverImage: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=600&q=80",
  }
];

export default async function BlogsSection() {
  let blogs: any[] = [];
  try {
    blogs = await prisma.blog.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [
        { publishedAt: "desc" },
        { createdAt: "desc" }
      ],
      take: 3,
    });
  } catch (err) {
    console.error("Failed to query blogs in server component:", err);
  }

  // Merge loaded blogs with placeholders so we always display exactly 3 high-fidelity cards
  const displayBlogs = [...blogs];
  while (displayBlogs.length < 3) {
    const placeholder = PLACEHOLDER_BLOGS[displayBlogs.length];
    displayBlogs.push(placeholder as any);
  }

  return (
    <div className="w-full">
      {/* ── Header Container ── */}
      <div
        className="flex flex-col lg:flex-row justify-between items-start lg:items-end w-full"
        style={{ gap: "16px", marginBottom: "40px" }}
      >
        <div className="flex flex-col items-start" style={{ gap: "16px", maxWidth: "619px" }}>
          <div className="flex flex-col items-start" style={{ gap: "8px" }}>
            {/* BLOG AND ARTICLES */}
            <span
              style={{
                fontFamily: 'var(--font-brand), Sora, "Plus Jakarta Sans", sans-serif',
                fontWeight: 700,
                fontSize: "16px",
                lineHeight: "28px",
                textTransform: "uppercase",
                color: "#2F6C25",
              }}
            >
              Blog and articles
            </span>
            {/* Latest insights and trends */}
            <h2
              style={{
                fontFamily: 'var(--font-jakarta), "Plus Jakarta Sans", sans-serif',
                fontWeight: 700,
                fontSize: "46px",
                lineHeight: "60px",
                letterSpacing: "-1.04px",
                color: "#23252C",
                margin: 0,
              }}
            >
              Latest insights and trends
            </h2>
          </div>
          {/* Subtitle description */}
          <p
            style={{
              fontFamily: "var(--font-sora), Sora, sans-serif",
              fontWeight: 400,
              fontSize: "20px",
              lineHeight: "32px",
              color: "#54565B",
              margin: 0,
            }}
          >
            Whether you’re optimizing today or building for tomorrow we help you move faster with confidence.
          </p>
        </div>

        {/* View all blogs Button */}
        <div
          style={{
            width: "229px",
            height: "61px",
            background: "rgba(176, 255, 159, 0.2)",
            borderRadius: "100px",
            padding: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxSizing: "border-box",
          }}
        >
          <Link
            href="/blog"
            className="relative flex flex-row items-center justify-center overflow-hidden"
            style={{
              width: "217px",
              height: "49px",
              background: "linear-gradient(180deg, #B0FE5E 0%, #5BA40D 100%)",
              boxShadow:
                "0px 5px 23px rgba(214,253,112,0.3), inset -4px -4px 8px rgba(255,255,255,0.3), inset 4px 4px 8px rgba(255,255,255,0.3)",
              borderRadius: "100px",
              padding: "12px 54px 12px 30px",
              isolation: "isolate",
              textDecoration: "none",
              gap: "10px",
              boxSizing: "border-box",
            }}
          >
            {/* Decorative left circle */}
            <div
              className="absolute flex items-center justify-center"
              style={{
                width: "32px",
                height: "32px",
                left: "-47.71px",
                top: "1.87px",
                background: "#FFFFFF",
                borderRadius: "100px",
                transform: "rotate(-45deg)",
                zIndex: 0,
              }}
            >
              <svg
                width="12"
                height="8"
                viewBox="0 0 12 8"
                fill="none"
                aria-hidden
                style={{ transform: "rotate(-45deg)" }}
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

            <span
              style={{
                fontFamily: "var(--font-sora), Sora, sans-serif",
                fontWeight: 600,
                fontSize: "16px",
                lineHeight: "23px",
                color: "#FFFFFF",
                whiteSpace: "nowrap",
                position: "relative",
                zIndex: 0,
              }}
            >
              View all blogs
            </span>

            {/* Right arrow circle */}
            <div
              className="absolute flex items-center justify-center"
              style={{
                width: "32px",
                height: "32px",
                left: "176.08px",
                top: "8.5px",
                background: "#FFFFFF",
                borderRadius: "100px",
                zIndex: 2,
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
          </Link>
        </div>
      </div>

      {/* ── Blogs Grid Container ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full" style={{ marginTop: "40px" }}>
        {displayBlogs.map((blog) => (
          <Link
            key={blog.id}
            href={`/blog/${blog.slug}`}
            className="group relative overflow-hidden flex flex-col justify-end transition-all duration-300 hover:-translate-y-2"
            style={{
              aspectRatio: "1/1",
              width: "100%",
              borderRadius: "24px",
              backgroundImage: `url(${blog.coverImage || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80"})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              textDecoration: "none",
              boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.03)",
            }}
          >
            {/* Green gradient bottom overlay */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "246px",
                background: "linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(102, 197, 0, 0.5) 100%)",
                zIndex: 1,
                pointerEvents: "none",
              }}
            />

            {/* Black gradient overlay */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "104px",
                background: "linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, #000000 100%)",
                opacity: 0.79,
                zIndex: 2,
                pointerEvents: "none",
              }}
            />

            {/* Blog Title in White */}
            <h3
              style={{
                position: "absolute",
                bottom: "20px",
                left: "20px",
                right: "20px",
                zIndex: 3,
                fontFamily: 'var(--font-jakarta), "Plus Jakarta Sans", sans-serif',
                fontWeight: 500,
                fontSize: "24px",
                lineHeight: "32px",
                letterSpacing: "-0.96px",
                color: "#FFFFFF",
                margin: 0,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {blog.title}
            </h3>
          </Link>
        ))}
      </div>
    </div>
  );
}
