export function ToolIntro({ title, ask }: { title: string; ask?: string }) {
  return (
    <header className="mb-8 sm:mb-10">
      <h1 className="font-display text-[1.65rem] leading-snug text-[var(--text)] sm:text-3xl md:text-4xl">
        {title}
      </h1>
      {ask ? (
        <p className="mt-3 max-w-md text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">{ask}</p>
      ) : null}
    </header>
  );
}
