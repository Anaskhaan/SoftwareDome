import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ error, className = "", ...rest }, ref) => (
    <input
      ref={ref}
      className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-primary-navy placeholder-text-muted/60 outline-none transition-colors focus:ring-2 ${
        error
          ? "border-status-danger focus:border-status-danger focus:ring-status-danger/15"
          : "border-border-subtle focus:border-brand-green focus:ring-brand-green/15"
      } disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-text-muted ${className}`}
      {...rest}
    />
  )
);
Input.displayName = "Input";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, className = "", ...rest }, ref) => (
    <textarea
      ref={ref}
      className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-primary-navy placeholder-text-muted/60 outline-none transition-colors focus:ring-2 ${
        error
          ? "border-status-danger focus:border-status-danger focus:ring-status-danger/15"
          : "border-border-subtle focus:border-brand-green focus:ring-brand-green/15"
      } disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-text-muted ${className}`}
      {...rest}
    />
  )
);
Textarea.displayName = "Textarea";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ error, className = "", children, ...rest }, ref) => (
    <select
      ref={ref}
      className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-primary-navy outline-none transition-colors focus:ring-2 ${
        error
          ? "border-status-danger focus:border-status-danger focus:ring-status-danger/15"
          : "border-border-subtle focus:border-brand-green focus:ring-brand-green/15"
      } disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-text-muted ${className}`}
      {...rest}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";

export function Checkbox({
  label,
  className = "",
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label className={`inline-flex items-center gap-2.5 text-sm text-primary-navy ${className}`}>
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-border-subtle text-brand-green focus:ring-2 focus:ring-brand-green/30"
        {...rest}
      />
      {label}
    </label>
  );
}

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}) {
  return (
    <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
          checked ? "bg-brand-green" : "bg-border-subtle"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-[18px]" : "translate-x-0.5"
          }`}
        />
      </button>
      {label && <span className="text-sm text-primary-navy">{label}</span>}
    </label>
  );
}
