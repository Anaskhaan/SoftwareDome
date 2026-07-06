"use client";

import {
  useState,
  useEffect,
  useRef,
  type SyntheticEvent,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  findBestCategoryForQuery,
  searchSoftwareSuggestions,
} from "@/app/dashboard/softwares/actions";
import { Search as SearchIcon } from "@/lib/fa-icons";

const chips = [
  { label: "CRM Software", value: "CRM" },
  { label: "HR Software", value: "HR" },
  { label: "EMR Software", value: "EMR" },
  { label: "LMS Software", value: "LMS" },
];

type Suggestion = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  category: string | null;
  rating: number | null;
};

type Coords = { top: number; left: number; width: number };

export default function HeroSearch() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [coords, setCoords] = useState<Coords | null>(null);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

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

  const handleSearch = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const term = query.trim();
    setIsOpen(false);
    if (!term) {
      router.push("/categories");
      return;
    }
    await goToBestCategory(term);
  };

  // Debounced typeahead — fetches once the user pauses for 200ms.
  useEffect(() => {
    const term = query.trim();
    const timer = setTimeout(async () => {
      if (term.length < 2) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }
      const res = await searchSoftwareSuggestions(term);
      if (res.success) {
        setSuggestions((res.data as Suggestion[]) || []);
        setIsOpen(true);
        setActiveIndex(-1);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  // Track the search bar's viewport position so the portaled dropdown can follow it —
  // the hero section clips overflowing content, so the dropdown can't be a normal
  // absolutely-positioned child of it; it's rendered into document.body instead.
  useEffect(() => {
    if (!isOpen) return;
    function updateCoords() {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setCoords({ top: rect.bottom + 10, left: rect.left, width: rect.width });
    }
    updateCoords();
    window.addEventListener("scroll", updateCoords, true);
    window.addEventListener("resize", updateCoords);
    return () => {
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
    };
  }, [isOpen]);

  // Close on outside click — the dropdown lives in a portal, so it must be checked
  // separately from the search bar container when deciding what counts as "outside".
  useEffect(() => {
    if (!isOpen) return;
    function onClick(e: MouseEvent) {
      const target = e.target as Node;
      if (containerRef.current?.contains(target)) return;
      if (dropdownRef.current?.contains(target)) return;
      setIsOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [isOpen]);

  const rowCount = suggestions.length + 1; // + "Explore all" row

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % rowCount);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + rowCount) % rowCount);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      if (activeIndex < suggestions.length) {
        router.push(`/softwares/${suggestions[activeIndex].slug}`);
        setIsOpen(false);
      } else {
        setIsOpen(false);
        goToBestCategory(query.trim());
      }
    }
  };

  return (
    /*
     * Frame 8 — 672.47 × 150 px, flex-col, items-center, gap: 16px
     * On mobile: full width with px padding
     */
    <div
      className="flex flex-col items-center"
      style={{ width: "min(672.47px, 100%)", gap: "16px" }}
    >
      {/* ── Frame 2: chips + label ── */}
      <div className="flex flex-col items-center" style={{ gap: "14px" }}>
        {/* "Not sure where to start?" */}
        <span
          style={{
            fontFamily: "var(--font-sora), Sora, sans-serif",
            fontWeight: 400,
            fontSize: "14px",
            lineHeight: "20px",
            textAlign: "center",
            color: "rgba(17, 17, 17, 0.6)",
          }}
        >
          Not sure where to start?
        </span>

        {/* Frame 3: chip row */}
        <div className="flex flex-wrap justify-center" style={{ gap: "10px" }}>
          {chips.map((chip) => (
            <Link
              key={chip.label}
              href={`/categories?q=${encodeURIComponent(chip.value)}`}
              style={{
                display: "flex",
                alignItems: "center",
                height: "34px",
                padding: "6px 16px",
                background: "rgba(255, 255, 255, 0.48)",
                border: "1px solid rgba(255, 255, 255, 0.4)",
                borderRadius: "50px",
                fontFamily: "var(--font-sora), Sora, sans-serif",
                fontWeight: 600,
                fontSize: "14px",
                lineHeight: "20px",
                textAlign: "center",
                color: "#2F6C25",
                whiteSpace: "nowrap",
                textDecoration: "none",
              }}
            >
              {chip.label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Search bar container ── */}
      {/*
       * 672.47 × 66 px, rgba(255,255,255,0.7), border-radius 110px,
       * box-shadow, backdrop-filter, padding 10px 9px
       */}
      <div ref={containerRef} className="relative w-full">
        <form
          onSubmit={handleSearch}
          className="flex w-full flex-row items-center"
          style={{
            height: "66px",
            background: "rgba(255, 255, 255, 0.7)",
            border: "1px solid rgba(47, 108, 37, 0.01)",
            boxShadow: "0px 4px 34px rgba(17, 17, 17, 0.05)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRadius: "110px",
            padding: "10px 9px",
          }}
        >
          {/* Text input — 563.47 × 44 px, padding 12px 0 12px 16px */}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search software, category, or service.."
            autoComplete="off"
            style={{
              flex: 1,
              height: "44px",
              padding: "12px 0 12px 16px",
              background: "transparent",
              border: "none",
              outline: "none",
              fontFamily: "var(--font-sora), Sora, sans-serif",
              fontWeight: 400,
              fontSize: "16px",
              lineHeight: "20px",
              color: "#111111",
            }}
            className="placeholder-[rgba(159,159,169,0.67)]"
          />

          {/* Search button — 89 × 44, lime gradient, border-radius 100px */}
          <button
            type="submit"
            style={{
              flexShrink: 0,
              width: "89px",
              height: "44px",
              background: "linear-gradient(180deg, #B0FE5E 0%, #5BA40D 100%)",
              boxShadow:
                "0px 5px 23px rgba(214, 253, 112, 0.3), inset -4px -4px 8px rgba(255, 255, 255, 0.3), inset 4px 4px 8px rgba(255, 255, 255, 0.3)",
              borderRadius: "100px",
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--font-geist-sans), Geist, sans-serif",
              fontWeight: 700,
              fontSize: "14px",
              lineHeight: "20px",
              textAlign: "center",
              color: "#FFFFFF",
            }}
          >
            Search
          </button>
        </form>

        {/* ── Suggestions dropdown — portaled to <body> so it escapes the hero
             section's overflow-hidden and always renders above every other section ── */}
        {isOpen &&
          suggestions.length > 0 &&
          coords &&
          createPortal(
            <div
              ref={dropdownRef}
              className="fixed z-100 overflow-hidden rounded-3xl border border-border-subtle bg-white text-left shadow-[0_20px_60px_-12px_rgba(10,25,47,0.25)]"
              style={{
                top: coords.top,
                left: coords.left,
                width: coords.width,
              }}
            >
              <ul>
                {suggestions.map((s, idx) => (
                  <li key={s.id}>
                    <Link
                      href={`/softwares/${s.slug}`}
                      onClick={() => setIsOpen(false)}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                        activeIndex === idx ? "bg-surface-muted" : ""
                      }`}
                    >
                      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border-subtle bg-surface-muted">
                        {s.logo ? (
                          <Image
                            src={s.logo}
                            alt=""
                            fill
                            className="object-contain p-1.5"
                            sizes="36px"
                          />
                        ) : (
                          <span className="text-xs font-black text-primary-navy/25">
                            {s.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-primary-navy">
                          {s.name}
                        </p>
                        {s.category && (
                          <p className="truncate text-xs text-text-muted">
                            {s.category}
                          </p>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onMouseEnter={() => setActiveIndex(suggestions.length)}
                onClick={() => {
                  setIsOpen(false);
                  goToBestCategory(query.trim());
                }}
                className={`flex w-full items-center gap-2 border-t border-border-subtle px-4 py-3 text-left text-sm font-bold text-brand-green-dark transition-colors ${
                  activeIndex === suggestions.length ? "bg-surface-muted" : ""
                }`}
              >
                <SearchIcon size={13} />
                Explore all results for &ldquo;{query.trim()}&rdquo;
              </button>
            </div>,
            document.body,
          )}
      </div>
    </div>
  );
}
