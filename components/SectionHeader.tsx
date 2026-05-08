export default function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="col-span-12 mb-10 grid grid-cols-1 gap-2">
      <span className="text-primary-navy font-bold tracking-[0.3em] text-[10px] uppercase opacity-50">
        {subtitle}
      </span>
      <h2 className="text-3xl lg:text-4xl font-black text-primary-navy tracking-tight">
        {title}
      </h2>
    </header>
  );
}
