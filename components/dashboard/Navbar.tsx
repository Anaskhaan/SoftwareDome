"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Search, Bell, ChevronRight, LogOut, UserPen, Info } from "@/lib/fa-icons";

interface NavbarProps {
  userRole: "ADMIN" | "VENDOR";
  onMenuClick: () => void;
}

interface UserData {
  name: string | null;
  email?: string;
  companyName: string | null;
  organization?: { name: string } | null;
}

function getInitials(name: string | null | undefined): string {
  if (!name?.trim()) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function useBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean).slice(1); // drop "dashboard"
  const crumbs = segments.map((seg, i) => ({
    label: seg.replace(/-/g, " ").replace(/\[(.+)\]/, "Detail").replace(/^\w/, (c) => c.toUpperCase()),
    href: "/dashboard/" + segments.slice(0, i + 1).join("/"),
  }));
  return crumbs;
}

export default function Navbar({ userRole, onMenuClick }: NavbarProps) {
  const [user, setUser] = useState<UserData | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const crumbs = useBreadcrumbs(pathname);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user ?? null);
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
      router.refresh();
    }
  };

  const displayName = user?.name ?? "—";
  const companyName = user?.companyName || user?.organization?.name || "—";
  const initials = getInitials(user?.name);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-border-subtle bg-white/90 px-4 backdrop-blur-xl sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-primary-navy transition-colors hover:bg-surface-muted lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <nav className="hidden min-w-0 items-center gap-1.5 text-sm sm:flex" aria-label="Breadcrumb">
          <span className="group relative inline-flex items-center gap-1.5">
            <Link href="/dashboard" className="font-bold text-primary-navy hover:text-brand-green-dark">
              {userRole === "ADMIN" ? "Admin" : "Vendor"}
            </Link>
            {userRole === "VENDOR" && (
              <span
                className="inline-flex cursor-help items-center text-text-muted"
                title="Vendor panel — you can manage your own profile, software listings, and vendor details only."
                aria-label="Vendor panel — you can manage your own profile, software listings, and vendor details only."
              >
                <Info size={14} />
              </span>
            )}
          </span>
          {crumbs.map((c, i) => (
            <React.Fragment key={c.href}>
              <ChevronRight size={12} className="text-text-muted" />
              {i === crumbs.length - 1 ? (
                <span className="truncate font-semibold text-text-muted">{c.label}</span>
              ) : (
                <Link href={c.href} className="truncate text-text-muted hover:text-primary-navy">
                  {c.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      <div className="hidden max-w-sm flex-1 md:flex">
        <div className="relative w-full">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search…"
            className="w-full rounded-xl border border-border-subtle bg-surface-muted py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-brand-green focus:bg-white focus:ring-2 focus:ring-brand-green/15"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setShowNotifications((v) => !v)}
            className="relative rounded-full p-2.5 text-text-muted transition-colors hover:bg-surface-muted hover:text-primary-navy"
            aria-label="Notifications"
          >
            <Bell size={18} />
          </button>
          {showNotifications && (
            <div className="anim-pop-in absolute right-0 mt-2 w-72 rounded-xl border border-border-subtle bg-white p-4 text-center shadow-xl">
              <p className="text-sm font-semibold text-primary-navy">No notifications yet</p>
              <p className="mt-1 text-xs text-text-muted">You're all caught up.</p>
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfile((v) => !v)}
            className="flex items-center gap-2.5 rounded-full border border-border-subtle bg-surface-muted px-2 py-1.5 pr-3 transition-colors hover:border-brand-green/30"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-green text-xs font-bold text-white">
              {initials}
            </div>
            <span className="hidden max-w-[140px] truncate text-xs font-semibold text-primary-navy sm:inline">
              {companyName}
            </span>
          </button>

          {showProfile && (
            <div className="anim-pop-in absolute right-0 mt-2 w-60 overflow-hidden rounded-xl border border-border-subtle bg-white shadow-xl">
              <div className="border-b border-border-subtle bg-surface-muted p-4">
                <p className="truncate text-sm font-bold text-primary-navy">{displayName}</p>
                <p className="truncate text-xs text-text-muted">{user?.email ?? "—"}</p>
              </div>
              <div className="p-2">
                <Link
                  href="/dashboard/edit-profile"
                  onClick={() => setShowProfile(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-primary-navy transition-colors hover:bg-surface-muted"
                >
                  <UserPen size={15} />
                  Edit Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-status-danger transition-colors hover:bg-status-danger-bg"
                >
                  <LogOut size={15} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
