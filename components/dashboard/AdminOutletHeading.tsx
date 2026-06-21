import React from "react";

interface AdminOutletHeadingProps {
  heading: string;
  subtitle?: string;
}

export default function AdminOutletHeading({ heading, subtitle }: AdminOutletHeadingProps) {
  return (
    <div>
      <h1 className="font-brand text-2xl font-bold text-primary-navy sm:text-3xl">{heading}</h1>
      {subtitle && <p className="mt-1 text-sm font-medium text-text-muted">{subtitle}</p>}
    </div>
  );
}
