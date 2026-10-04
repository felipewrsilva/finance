const STROKE: Record<string, string> = {
  poupanca: "var(--text)",
  tesouro: "var(--warning)",
  cdb: "var(--primary)",
  bova: "var(--success)",
};

const DASH: Record<string, string | undefined> = {
  tesouro: "7 5",
};

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

function yearTicks(maxX: number) {
  if (maxX <= 5) return Array.from({ length: maxX + 1 }, (_, i) => i);
  if (maxX <= 10) return [0, 5, 10].filter((y) => y <= maxX);
  return [0, 5, 10, 15, 20].filter((y) => y <= maxX);
}

export function CompareChart({
  series,
  labels,
  title,
}: {
  series: { key: string; points: { year: number; value: number }[] }[];
  labels: Record<string, string>;
  title: string;
}) {
  const width = 720;
  const height = 320;
  const pad = { l: 58, r: 108, t: 18, b: 36 };
  const innerW = width - pad.l - pad.r;
  const innerH = height - pad.t - pad.b;
  const rawMax = Math.max(...series.flatMap((s) => s.points.map((p) => p.value)), 1);
  const maxY = niceMax(rawMax);
  const maxX = Math.max(...series.flatMap((s) => s.points.map((p) => p.year)), 1);
  const yTicks = [0, maxY / 2, maxY];
  const xTicks = yearTicks(maxX);

  function x(year: number) {
    return pad.l + (year / maxX) * innerW;
  }
  function y(value: number) {
    return pad.t + innerH - (value / maxY) * innerH;
  }

  const ends = series
    .map((s) => {
      const last = s.points[s.points.length - 1];
      return {
        key: s.key,
        label: labels[s.key] ?? s.key,
        value: last?.value ?? 0,
        x: x(last?.year ?? maxX),
        y: y(last?.value ?? 0),
      };
    })
    .sort((a, b) => a.y - b.y);

  const labelYs: number[] = [];
  const gap = 16;
  ends.forEach((end, i) => {
    const prev = i === 0 ? pad.t + 8 : labelYs[i - 1] + gap;
    labelYs.push(Math.max(end.y, prev));
  });
  const overflow = labelYs[labelYs.length - 1] - (pad.t + innerH - 4);
  if (overflow > 0) {
    for (let i = 0; i < labelYs.length; i++) labelYs[i] -= overflow;
  }

  const leader = series.reduce((best, s) => {
    const last = s.points[s.points.length - 1]?.value ?? 0;
    const bestLast = best.points[best.points.length - 1]?.value ?? 0;
    return last > bestLast ? s : best;
  }, series[0]);

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[var(--elevation-sm)] sm:p-4">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        role="img"
        aria-label={title}
      >
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
        {xTicks.map((tick) => (
          <text
            key={tick}
            x={x(tick)}
            y={height - 8}
            textAnchor={tick === 0 ? "start" : tick === maxX ? "end" : "middle"}
            fill="var(--text-muted)"
            fontSize="11"
            fontFamily="var(--font-figtree), sans-serif"
          >
            {tick === 0 ? "hoje" : `${tick} anos`}
          </text>
        ))}
        {leader ? (
          <path
            d={`${leader.points
              .map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.year).toFixed(1)} ${y(p.value).toFixed(1)}`)
              .join(" ")} L ${x(maxX).toFixed(1)} ${y(0).toFixed(1)} L ${x(0).toFixed(1)} ${y(0).toFixed(1)} Z`}
            fill="var(--success-subtle)"
            opacity="0.55"
          />
        ) : null}
        {series.map((s) => {
          const d = s.points
            .map((p, i) => `${i === 0 ? "M" : "L"} ${x(p.year).toFixed(1)} ${y(p.value).toFixed(1)}`)
            .join(" ");
          const last = s.points[s.points.length - 1];
          return (
            <g key={s.key}>
              <path
                d={d}
                fill="none"
                stroke={STROKE[s.key] ?? "var(--text)"}
                strokeWidth={s.key === leader?.key ? 2.8 : 2.2}
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeDasharray={DASH[s.key]}
              />
              {last ? (
                <circle
                  cx={x(last.year)}
                  cy={y(last.value)}
                  r="3.2"
                  fill="var(--surface)"
                  stroke={STROKE[s.key] ?? "var(--text)"}
                  strokeWidth="2"
                />
              ) : null}
            </g>
          );
        })}
        {ends.map((end, i) => (
          <text
            key={end.key}
            x={end.x + 10}
            y={labelYs[i] + 4}
            fill={STROKE[end.key] ?? "var(--text)"}
            fontSize="12"
            fontFamily="var(--font-figtree), sans-serif"
          >
            {end.label}
          </text>
        ))}
      </svg>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--text-muted)] sm:hidden">
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
