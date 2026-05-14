import React from "react";

interface AdminOutletHeadingProps {
  heading: string;
}

export default function AdminOutletHeading({ heading }: AdminOutletHeadingProps) {
  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-[#0a192f]">
        {heading}
      </h2>
      <hr className="mt-2 border-0 h-px bg-(--lighter-gray)" />
    </div>
  );
}
