import Link from "next/link";

function Mark({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="sd-mark-grad" x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--brand-green-light)" />
          <stop offset="100%" stopColor="var(--brand-green-dark)" />
        </linearGradient>
      </defs>
      <path
        d="M50 8C50 22 38 24 28 30C18 36 14 44 14 56C14 44 24 40 34 34C44 28 50 20 50 8Z"
        fill="url(#sd-mark-grad)"
      />
      <path
        d="M14 56C14 42 26 40 36 34C46 28 50 20 50 8C28 8 14 22 14 56Z"
        fill="var(--brand-green-dark)"
        opacity="0.55"
      />
    </svg>
  );
}

export default function Logo({
  size = "md",
  variant = "light",
  href = "/",
  iconOnly = false,
}: {
  size?: "sm" | "md" | "lg";
  variant?: "light" | "dark";
  href?: string | null;
  iconOnly?: boolean;
}) {
  const dims = { sm: 24, md: 32, lg: 40 }[size];
  const textSize = { sm: "text-lg", md: "text-2xl", lg: "text-3xl" }[size];
  const softwareColor = variant === "light" ? "text-[var(--secondary-black)]" : "text-white";

  const content = (
    <span className="inline-flex items-center gap-2 select-none">
      <Mark size={dims} />
      {!iconOnly && (
        <span className={`font-brand font-bold tracking-tight ${textSize} leading-none`}>
          <span className={softwareColor}>Software</span>{" "}
          <span className="text-brand-green">Dome</span>
        </span>
      )}
    </span>
  );

  if (href === null) return content;

  return (
    <Link href={href} className="flex items-center">
      {content}
    </Link>
  );
}
