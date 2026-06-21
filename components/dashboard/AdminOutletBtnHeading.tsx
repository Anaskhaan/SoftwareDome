import React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

interface AdminOutletBtnHeadingProps {
  heading: string;
  btnText: string;
  btnUrl: string;
}

export default function AdminOutletBtnHeading({
  heading,
  btnText,
  btnUrl,
}: AdminOutletBtnHeadingProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#0a192f]">
          {heading}
        </h2>
        <Link
          href={btnUrl}
          className="btn btn-navy"
        >
          <Plus size={18} /> {btnText}
        </Link>
      </div>
      <hr className="mt-2 border-0 h-px bg-(--lighter-gray)" />
    </div>
  );
}
