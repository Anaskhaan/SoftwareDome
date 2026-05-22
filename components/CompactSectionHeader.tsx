export default function CompactSectionHeader({
  subtitle,
  title,
}: {
  subtitle: string;
  title: string;
}) {
  return (
    <header className="mb-8">
      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-primary-navy/45">
        {subtitle}
      </span>
      <h2 className="mt-1.5 max-w-xl text-xl font-black tracking-tight text-primary-navy sm:text-2xl">
        {title}
      </h2>
    </header>
  );
}
