export default function PageHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
      {subtitle && <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">{subtitle}</p>}
    </div>
  );
}
