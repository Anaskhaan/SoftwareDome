"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icons } from "@/assets/icons";
import Logo from "@/components/Logo";
import { GradientButton } from "@/components/Button";

const navLinks = [
  { name: "Software Categories", href: "/categories" },
  { name: "For Vendors", href: "/vendors" },
  { name: "Resource Center", href: "/blog" },
  { name: "Write a Review", href: "/write-review" },
];

export default function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  const [user, setUser] = useState<any>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error("Failed to fetch user", error);
      }
    };
    fetchUser();
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setShowTooltip(false), 300);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 sm:px-6 pt-1">
      <header
        className="flex md:px-2 md:py-5 backdrop-blur-xl backdrop-saturate-150 border border-white/50 rounded-4xl px-3 py-1 w-[1440px] h-[70px] flex-col justify-center"
        style={{
          backgroundColor: "#FFFFFF",
          boxShadow:
            "0 8px 32px rgba(31, 38, 135, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.6)",
        }}
      >
        <div className="flex w-full flex-row md:h-[16px] md:gap-[16px] items-center justify-between">
          {/* ── Logo ── */}
          <div className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.12)]">
            <Logo size="lg" variant="light" />
          </div>

          {/* ── Navigation — desktop only ── */}
          <nav
            className="hidden md:flex flex-row items-center"
            style={{ gap: "4px" }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="whitespace-nowrap transition-colors hover:bg-black/5"
                style={{
                  padding: "8px 14px",
                  borderRadius: "9999px",
                  fontFamily: "var(--font-sora), Sora, sans-serif",
                  fontWeight: 400,
                  fontSize: "15px",
                  lineHeight: "20px",
                  color: "rgba(37, 37, 37, 0.8)",
                }}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* ── Right frame ── */}
          <div className="flex flex-row items-center" style={{ gap: "10px" }}>
            {/* Mobile: hamburger only */}
            <button
              onClick={onMenuClick}
              className="md:hidden flex items-center justify-center rounded-full p-2 transition-colors hover:bg-black/5"
              aria-label="Open menu"
              style={{ color: "rgba(37,37,37,0.8)" }}
            >
              <Icons.Menu size={22} />
            </button>

            {/* Desktop: CTA + divider + user */}
            <div
              className="hidden md:flex items-center"
              style={{ gap: "10px" }}
            >
              {/* ── Green pill CTA button ── */}
              <GradientButton href="/signup">Get started now</GradientButton>

              {/* ── Vertical divider: 1px × 44px ── */}
              <div
                style={{
                  width: "1px",
                  height: "44px",
                  background: "rgba(0, 0, 0, 0.1)",
                  flexShrink: 0,
                }}
              />

              {/* ── User icon: 55×55 circle ── */}
              {user ? (
                <div
                  className="relative"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    className="flex items-center justify-center cursor-pointer"
                    style={{
                      width: "55px",
                      height: "55px",
                      borderRadius: "171.875px",
                      flexShrink: 0,
                    }}
                    aria-label="Account menu"
                  >
                    <LoginIcon />
                  </button>

                  {showTooltip && (
                    <div
                      className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(10,25,47,0.2)] border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in slide-in-from-top-2 duration-200"
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div className="p-4 bg-gray-50 border-b border-gray-100">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {user.name || "User"}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {user.email}
                        </p>
                      </div>
                      <div className="p-2 space-y-1">
                        <Link
                          href="/profile"
                          className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                        >
                          View Profile
                        </Link>
                        {(user.role === "ADMIN" || user.role === "VENDOR") && (
                          <Link
                            href="/dashboard"
                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium"
                          >
                            {user.role === "VENDOR"
                              ? "Vendor Panel"
                              : "Dashboard"}
                          </Link>
                        )}
                        <div className="h-px bg-gray-100 my-1 mx-2" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left font-semibold"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center justify-center"
                  style={{
                    width: "55px",
                    height: "55px",
                    borderRadius: "171.875px",
                    flexShrink: 0,
                  }}
                  aria-label="Login"
                >
                  <LoginIcon />
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

/* User/login icon — matches the Figma spec, includes its own translucent circle backdrop */
function LoginIcon() {
  return (
    <svg
      width="55"
      height="55"
      viewBox="0 0 55 55"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M0 27.5C0 12.3122 12.3122 0 27.5 0C42.6878 0 55 12.3122 55 27.5C55 42.6878 42.6878 55 27.5 55C12.3122 55 0 42.6878 0 27.5Z"
        fill="white"
        fillOpacity="0.2"
      />
      <path
        d="M27.4993 27.5C29.8926 27.5 31.8327 25.5599 31.8327 23.1667C31.8327 20.7735 29.8926 18.8334 27.4993 18.8334C25.1061 18.8334 23.166 20.7735 23.166 23.1667C23.166 25.5599 25.1061 27.5 27.4993 27.5Z"
        fill="#5FC24A"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M27.499 28.5834C23.5232 28.5834 20.2623 31.205 19.9417 34.5417C19.9135 34.8396 20.1583 35.0834 20.4573 35.0834H34.5407C34.6111 35.0852 34.6812 35.0723 34.7463 35.0454C34.8115 35.0185 34.8703 34.9782 34.9189 34.9271C34.9675 34.8761 35.0048 34.8154 35.0285 34.749C35.0522 34.6826 35.0617 34.612 35.0563 34.5417C34.7357 31.205 31.4748 28.5834 27.499 28.5834Z"
        fill="#5FC24A"
        fillOpacity="0.6"
      />
    </svg>
  );
}
