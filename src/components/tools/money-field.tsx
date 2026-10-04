"use client";

export function MoneyField({
  label,
  hint,
  value,
  onChange,
  step = 1,
  quiet = false,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (n: number) => void;
  step?: number;
  quiet?: boolean;
}) {
  return (
    <label className="block">
      <span className="block font-display text-base text-[var(--text)] sm:text-lg">{label}</span>
      {hint ? <span className="mt-1 block text-sm leading-relaxed text-[var(--text-secondary)]">{hint}</span> : null}
      <input
        type="number"
        inputMode="decimal"
        step={step}
        min={0}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Number(e.target.value))}
        className={`mt-3 w-full min-h-12 border-0 border-b border-[var(--border-strong)] bg-transparent px-0 py-2 font-display tabular-nums text-[var(--text)] outline-none focus:border-[var(--primary)] ${
          quiet ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl"
        }`}
      />
    </label>
  );
}

export function YearPicks({
  value,
  onChange,
  options = [5, 10, 20],
  captions,
  label,
}: {
  value: number;
  onChange: (n: number) => void;
  options?: number[];
  captions?: string[];
  label: string;
}) {
  return (
    <fieldset>
      <legend className="font-display text-base text-[var(--text)] sm:text-lg">{label}</legend>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {options.map((years, i) => {
          const active = years === value;
          const caption = captions?.[i];
          return (
            <button
              key={years}
              type="button"
              onClick={() => onChange(years)}
              className={`min-h-11 rounded-full px-2 py-2 text-sm transition-colors ${
                active
                  ? "bg-[var(--text)] text-[var(--text-inverse)]"
                  : "bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text)]"
              }`}
            >
              {years} anos
              {caption ? <span className="mt-0.5 block text-[10px] opacity-80">{caption}</span> : null}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function ResultAmount({
  children,
  tone = "primary",
}: {
  children: string;
  tone?: "primary" | "success";
}) {
  const color = tone === "success" ? "text-[var(--success)]" : "text-[var(--primary)]";
  return <p className={`result-figure mt-2 ${color}`}>{children}</p>;
}
