"use client";

import React from "react";
import Link from "next/link";
import { Loader2 } from "@/lib/fa-icons";

type Variant = "primary" | "outline" | "dark";
type Size = "sm" | "md";

type BaseProps = {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ElementType;
  iconPosition?: "left" | "right";
  className?: string;
  children: React.ReactNode;
};

type LinkVariantProps = BaseProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className"> & {
    href: string;
  };

type ButtonVariantProps = BaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
    href?: undefined;
  };

export type ButtonProps = LinkVariantProps | ButtonVariantProps;

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-brand-green text-white shadow-[0_4px_16px_-2px_rgba(95,194,74,0.45)] hover:bg-brand-green-dark hover:-translate-y-0.5",
  outline:
    "border border-border-subtle text-primary-navy hover:border-brand-green/40 hover:-translate-y-0.5",
  dark: "bg-[#072929] text-white shadow-[0px_4px_18px_-2px_rgba(95,194,74,0.05)] hover:bg-[#276439]",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-4 py-2 text-xs gap-2",
  md: "px-5 py-2.5 text-sm gap-2",
};

const iconSize: Record<Size, number> = { sm: 13, md: 14 };

/** Shared pill-shaped CTA used across the public site — pass `href` to render a Link, omit it for a `<button>`. */
export default function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    fullWidth = false,
    loading = false,
    icon: Icon,
    iconPosition = "left",
    className = "",
    children,
    ...rest
  } = props;

  const classes = `inline-flex items-center justify-center whitespace-nowrap rounded-full font-bold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? "w-full" : ""} ${className}`;

  const content = (
    <>
      {loading ? (
        <Loader2 size={iconSize[size]} className="animate-spin" />
      ) : (
        Icon && iconPosition === "left" && <Icon size={iconSize[size]} />
      )}
      {children}
      {!loading && Icon && iconPosition === "right" && <Icon size={iconSize[size]} />}
    </>
  );

  if (rest.href) {
    const { href, ...anchorRest } = rest as Omit<LinkVariantProps, keyof BaseProps>;
    return (
      <Link href={href} className={classes} {...anchorRest}>
        {content}
      </Link>
    );
  }

  const { disabled, ...buttonRest } = rest as Omit<ButtonVariantProps, keyof BaseProps>;
  return (
    <button className={classes} disabled={disabled || loading} {...buttonRest}>
      {content}
    </button>
  );
}

function ArrowIcon() {
  return (
    <svg width="13" height="9" viewBox="0 0 13 9" fill="none" aria-hidden>
      <path
        d="M1 4.5H12M8.5 1L12 4.5L8.5 8"
        stroke="#1D1D1D"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type GradientButtonProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className" | "style"> & {
  href: string;
  className?: string;
  children: React.ReactNode;
};

/** The lime-gradient "arrow badge" CTA used for top-level signup/marketing actions (e.g. the navbar CTA). */
export function GradientButton({ href, className = "", children, ...rest }: GradientButtonProps) {
  return (
    <div
      className={`inline-flex items-center justify-center rounded-full p-1.5 ${className}`}
      style={{ background: "rgba(176, 255, 159, 0.2)" }}
    >
      <Link
        href={href}
        className="group relative flex items-center overflow-hidden rounded-full py-3 pl-[30px] pr-[54px] transition-[padding] duration-300 ease-out hover:pl-[54px] hover:pr-[30px]"
        style={{
          background: "linear-gradient(180deg, #B0FE5E 0%, #5BA40D 100%)",
          boxShadow:
            "0px 5px 23px rgba(214,253,112,0.3), inset -4px -4px 8px rgba(255,255,255,0.3), inset 4px 4px 8px rgba(255,255,255,0.3)",
        }}
        {...rest}
      >
        <span
          className="relative z-0 whitespace-nowrap font-semibold text-white"
          style={{ fontFamily: "var(--font-sora), Sora, sans-serif", fontSize: "16px", lineHeight: "23px" }}
        >
          {children}
        </span>
        {/* Default arrow — slides out past the right edge and fades on hover */}
        <span className="absolute right-[8.5px] top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white transition-all duration-300 ease-out group-hover:translate-x-10 group-hover:opacity-0">
          <ArrowIcon />
        </span>
        {/* Hover arrow — slides in from off-canvas left to sit before the text */}
        <span className="absolute left-[8.5px] top-1/2 flex h-8 w-8 -translate-x-10 -translate-y-1/2 items-center justify-center rounded-full bg-white opacity-0 transition-all duration-300 ease-out group-hover:translate-x-0 group-hover:opacity-100">
          <ArrowIcon />
        </span>
      </Link>
    </div>
  );
}
