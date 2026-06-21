import React from "react";

export default function FormField({
  label,
  htmlFor,
  helperText,
  error,
  required,
  children,
}: {
  label: string;
  htmlFor?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-bold text-primary-navy">
        {label}
        {required && <span className="ml-1 text-status-danger">*</span>}
      </label>
      {children}
      {error ? (
        <p className="text-xs font-medium text-status-danger">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-text-muted">{helperText}</p>
      ) : null}
    </div>
  );
}
