import type { ElementType } from "react";

export default function CompactSectionHeader({
  subtitle,
  title,
  icon: Icon,
}: {
  subtitle: string;
  title: string;
  icon?: ElementType;
}) {
  return (
    <header className="mb-8 flex items-start gap-3.5">
      {Icon && (
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-green/10 text-brand-green-dark">
          <Icon size={16} />
        </span>
      )}
      <div className="min-w-0">
        <span className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-green-800">
          {!Icon && <span className="h-1.5 w-1.5 rounded-full bg-brand-green" aria-hidden />}
          {subtitle}
        </span>
        <h2 className="mt-1 max-w-xl font-brand text-xl font-bold tracking-tight text-primary-navy sm:text-2xl">
          {title}
        </h2>
      </div>
    </header>
  );
}
