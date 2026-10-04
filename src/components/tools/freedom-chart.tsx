function niceMax(value: number) {
  const padded = Math.max(1, value) * 1.06;
  const exp = Math.pow(10, Math.floor(Math.log10(padded)));
  const m = padded / exp;
  const step = m <= 1 ? 1 : m <= 1.5 ? 1.5 : m <= 2 ? 2 : m <= 3 ? 3 : m <= 5 ? 5 : 10;
  return step * exp;
}

function formatAxis(n: number) {
  if (n < 1) return "R$ 0";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  }).format(n);
}

export function FreedomChart({
  points,
  target,
  title,
  todayLabel,
  yearsLabel,
  targetLabel,
}: {
  points: { year: number; value: number }[];
  target: number;
  title: string;
  todayLabel: string;
  yearsLabel: string;
  targetLabel: string;
}) {
  const width = 720;
  const height = 280;
  const pad = { l: 58, r: 18, t: 18, b: 36 };
  const innerW = width - pad.l - pad.r;
  const innerH = height - pad.t - pad.b;
  const maxX = Math.max(...points.map((p) => p.year), 1);
  const maxY = niceMax(Math.max(...points.map((p) => p.value), target, 1));
  const yTicks = [0, maxY / 2, maxY];

  function x(year: number) {
    return pad.l + (year / maxX) * innerW;
  }
  function y(value: number) {
    return pad.t + innerH - (value / maxY) * innerH;
  }

  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.year).toFixed(1)} ${y(p.value).toFixed(1)}`)
    .join(" ");
  const last = points[points.length - 1];

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[var(--elevation-sm)] sm:p-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label={title}>
        {yTicks.map((tick) => (
          <g key={tick}>
            <line
              x1={pad.l}
              y1={y(tick)}
              x2={pad.l + innerW}
              y2={y(tick)}
              stroke="var(--border)"
              strokeWidth="1"
            />
            <text
              x={pad.l - 8}
              y={y(tick) + 4}
              textAnchor="end"
              fill="var(--text-muted)"
              fontSize="11"
              fontFamily="var(--font-figtree), sans-serif"
            >
              {formatAxis(tick)}
            </text>
          </g>
        ))}
        <line
          x1={pad.l}
          y1={y(target)}
          x2={pad.l + innerW}
          y2={y(target)}
          stroke="var(--success)"
          strokeWidth="1.4"
          strokeDasharray="5 5"
        />
        <path
          d={d}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="2.6"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {last ? (
          <circle
            cx={x(last.year)}
            cy={y(last.value)}
            r="3.2"
            fill="var(--surface)"
            stroke="var(--primary)"
            strokeWidth="2"
          />
        ) : null}
        <text
          x={pad.l}
          y={height - 8}
          fill="var(--text-muted)"
          fontSize="11"
          fontFamily="var(--font-figtree), sans-serif"
        >
          {todayLabel}
        </text>
        <text
          x={pad.l + innerW}
          y={height - 8}
          textAnchor="end"
          fill="var(--text-muted)"
          fontSize="11"
          fontFamily="var(--font-figtree), sans-serif"
        >
          {maxX} {yearsLabel}
        </text>
      </svg>
      <p className="mt-2 text-xs leading-relaxed text-[var(--text-muted)]">{targetLabel}</p>
    </div>
  );
}
