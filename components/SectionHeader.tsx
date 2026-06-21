export default function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="col-span-12 mb-10 grid grid-cols-1 gap-2">
      <span className="inline-flex items-center gap-2 text-brand-green-dark font-bold tracking-[0.3em] text-[10px] uppercase">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-green" aria-hidden />
        {subtitle}
      </span>
      <h2 className="font-brand text-3xl lg:text-4xl font-bold text-primary-navy">
        {title}
      </h2>
    </header>
  );
}
