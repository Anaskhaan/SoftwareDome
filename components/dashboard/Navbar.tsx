"use client";

import React from "react";
import { User as UserIcon } from "lucide-react";

interface NavbarProps {
  userRole: "ADMIN" | "VENDOR";
}

export default function Navbar({ userRole }: NavbarProps) {
  return (
    <header className="h-16 bg-[#0a192f] text-white flex items-center justify-between px-6 sticky top-0 z-40 shadow-md">
      <div className="flex items-center gap-4">
        <h1 className="text-sm md:text-base font-semibold opacity-90 uppercase ">
          {userRole} PANEL <span className="text-white/50 ml-2">[Mashhood Butt]</span>
        </h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-3 px-4 py-1.5 bg-white/5 rounded-full border border-white/10">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">
            HB
          </div>
          <span className="text-xs font-medium text-white/80 ">Hogan and Black Trading</span>
        </div>

        <div className="p-2 hover:bg-white/10 rounded-full cursor-pointer transition-colors border border-white/10">
          <UserIcon size={20} />
        </div>
      </div>
    </header>
  );
}
