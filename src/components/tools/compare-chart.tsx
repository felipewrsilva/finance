const STROKE: Record<string, string> = {
  poupanca: "var(--text)",
  tesouro: "var(--warning)",
  cdb: "var(--primary)",
  chip: "var(--success)",
};

export function CompareChart({
  series,
  labels,
  title,
}: {
  series: { key: string; points: { year: number; value: number }[] }[];
  labels: Record<string, string>;
  title: string;
}) {
  const width = 640;
  const height = 260;
  const pad = { l: 12, r: 12, t: 16, b: 28 };
  const innerW = width - pad.l - pad.r;
  const innerH = height - pad.t - pad.b;
  const maxY = Math.max(...series.flatMap((s) => s.points.map((p) => p.value)), 1);
  const maxX = Math.max(...series.flatMap((s) => s.points.map((p) => p.year)), 1);

  function x(year: number) {
    return pad.l + (year / maxX) * innerW;
  }
  function y(value: number) {
    return pad.t + innerH - (value / maxY) * innerH;
  }

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label={title}>
        <line
          x1={pad.l}
          y1={pad.t + innerH}
          x2={pad.l + innerW}
          y2={pad.t + innerH}
          stroke="var(--border)"
          strokeWidth="1"
        />
        {series.map((s) => {
          const d = s.points
            .map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.year).toFixed(1)} ${y(p.value).toFixed(1)}`)
            .join(" ");
          return (
            <path
              key={s.key}
              d={d}
              fill="none"
              stroke={STROKE[s.key] ?? "var(--text)"}
              strokeWidth="2.4"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          );
        })}
        <text x={pad.l} y={height - 6} fill="var(--text-muted)" fontSize="11">
          0
        </text>
        <text x={pad.l + innerW - 28} y={height - 6} fill="var(--text-muted)" fontSize="11">
          {maxX} anos
        </text>
      </svg>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--text-muted)]">
        {series.map((s) => (
          <li key={s.key} className="flex items-center gap-1.5">
            <span
              className="inline-block h-0.5 w-4 rounded-full"
              style={{ background: STROKE[s.key] }}
              aria-hidden
            />
            {labels[s.key]}
          </li>
        ))}
      </ul>
    </div>
  );
}
