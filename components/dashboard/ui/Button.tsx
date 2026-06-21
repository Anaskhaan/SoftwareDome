"use client";

import React from "react";
import { Loader2 } from "@/lib/fa-icons";

type Variant = "primary" | "secondary" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ElementType;
  iconPosition?: "left" | "right";
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-brand-green text-white shadow-[0_4px_16px_-2px_rgba(95,194,74,0.45)] hover:bg-brand-green-dark hover:-translate-y-0.5",
  secondary:
    "bg-white text-primary-navy border border-border-subtle hover:bg-surface-muted hover:border-brand-green/30",
  ghost: "bg-transparent text-text-muted hover:bg-surface-muted hover:text-primary-navy",
  destructive:
    "bg-status-danger text-white shadow-[0_4px_16px_-2px_rgba(192,52,31,0.35)] hover:bg-status-danger/90 hover:-translate-y-0.5",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs gap-1.5 rounded-lg",
  md: "px-4 py-2.5 text-sm gap-2 rounded-xl",
  lg: "px-6 py-3 text-base gap-2.5 rounded-xl",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon: Icon,
  iconPosition = "left",
  disabled,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-bold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...rest}
    >
      {loading ? (
        <Loader2 size={size === "sm" ? 14 : 16} />
      ) : (
        Icon && iconPosition === "left" && <Icon size={size === "sm" ? 14 : 16} />
      )}
      {children}
      {!loading && Icon && iconPosition === "right" && <Icon size={size === "sm" ? 14 : 16} />}
    </button>
  );
}
