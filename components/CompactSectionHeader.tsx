export default function CompactSectionHeader({
  subtitle,
  title,
}: {
  subtitle: string;
  title: string;
}) {
  return (
    <header className="mb-8">
      <span className="inline-flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-brand-green-dark">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-green" aria-hidden />
        {subtitle}
      </span>
      <h2 className="mt-1.5 max-w-xl font-brand text-xl font-bold tracking-tight text-primary-navy sm:text-2xl">
        {title}
      </h2>
    </header>
  );
}
