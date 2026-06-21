"use client";

import React, { useEffect, useState } from "react";
import { User as UserIcon } from "lucide-react";

interface NavbarProps {
  userRole: "ADMIN" | "VENDOR";
}

interface UserData {
  name: string | null;
  companyName: string | null;
  organization?: { name: string } | null;
}

function getInitials(name: string | null | undefined): string {
  if (!name?.trim()) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Navbar({ userRole }: NavbarProps) {
  const [user, setUser] = useState<UserData | null>(null);

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

  const displayName = user?.name ?? "—";
  const companyName =
    user?.companyName ||
    user?.organization?.name ||
    "—";
  const initials = getInitials(user?.name);

  return (
    <header className="h-16 bg-[#0a192f] text-white flex items-center justify-between px-6 sticky top-0 z-40 shadow-md">
      <div className="flex items-center gap-4">
        <h1 className="text-sm md:text-base font-semibold opacity-90 uppercase">
          {userRole} PANEL{" "}
          <span className="text-white/50 ml-2">[{displayName}]</span>
        </h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-3 px-4 py-1.5 bg-white/5 rounded-full border border-white/10">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold shrink-0">
            {initials}
          </div>
          <span className="text-xs font-medium text-white/80 truncate max-w-[180px]">
            {companyName}
          </span>
        </div>

        <div className="p-2 hover:bg-white/10 rounded-full cursor-pointer transition-colors border border-white/10">
          <UserIcon size={20} />
        </div>
      </div>
    </header>
  );
}
