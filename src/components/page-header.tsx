export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="mb-6">
      <p className="eyebrow text-meta-blue">{eyebrow}</p>
      <h1 className="mt-1 text-3xl font-bold text-foreground">{title}</h1>
      {description && (
        <p className="mt-2 max-w-2xl leading-relaxed text-muted-foreground">{description}</p>
      )}
    </header>
  );
}

/** Aviso temporário de scaffold — substituído pela replicação visual na Phase 2. */
export function ScaffoldNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card p-8 text-sm text-muted-foreground">
      {children}
    </div>
  );
}
