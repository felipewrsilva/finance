"use client";

import { useMemo } from "react";
import { formatCurrency } from "@/lib/utils";

interface DataPoint {
  year: number;
  principalOnly: number;
  total: number;
}

interface Milestone {
  multiple: number;
  years: number;
}

interface GrowthChartProps {
  series: DataPoint[];
  milestones?: Milestone[];
  currency?: string;
  locale?: string;
  height?: number;
}

export function GrowthChart({
  series,
  milestones = [],
  currency = "BRL",
  locale = "pt-BR",
  height = 280,
}: GrowthChartProps) {
  const W = 600;
  const H = height;
  const PAD = { top: 20, right: 20, bottom: 40, left: 70 };

  const maxVal = useMemo(
    () => Math.max(...series.map((d) => d.total), 1),
    [series]
  );
  const maxYear = series[series.length - 1]?.year ?? 1;

  function xScale(year: number) {
    return PAD.left + ((year / maxYear) * (W - PAD.left - PAD.right));
  }
  function yScale(val: number) {
    return H - PAD.bottom - ((val / maxVal) * (H - PAD.top - PAD.bottom));
  }

  const totalPath = series
    .map((d, i) => `${i === 0 ? "M" : "L"}${xScale(d.year).toFixed(1)},${yScale(d.total).toFixed(1)}`)
    .join(" ");
  const principalPath = series
    .map((d, i) => `${i === 0 ? "M" : "L"}${xScale(d.year).toFixed(1)},${yScale(d.principalOnly).toFixed(1)}`)
    .join(" ");

  // Y-axis ticks
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((p) => ({
    value: maxVal * p,
    y: yScale(maxVal * p),
  }));

  // X-axis ticks
  const xTicks = series.filter((d) => d.year % 5 === 0);

  const fmt = (v: number) => {
    if (v >= 1_000_000) return formatCurrency(v / 1_000_000, currency, locale) + "M";
    if (v >= 1_000) return formatCurrency(v / 1_000, currency, locale) + "K";
    return formatCurrency(v, currency, locale);
  };

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={H}
        aria-label="Investment growth chart"
        role="img"
      >
        {/* Grid lines */}
        {yTicks.map(({ value, y }) => (
          <g key={value}>
            <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y} stroke="#f0f0f0" strokeWidth="1" />
            <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#9ca3af">
              {fmt(value)}
            </text>
          </g>
        ))}

        {/* X-axis ticks */}
        {xTicks.map((d) => (
          <g key={d.year}>
            <text x={xScale(d.year)} y={H - PAD.bottom + 16} textAnchor="middle" fontSize="10" fill="#9ca3af">
              {d.year}y
            </text>
          </g>
        ))}

        {/* Milestone vertical lines */}
        {milestones.map((m) => {
          const x = xScale(m.years);
          return (
            <g key={m.multiple}>
              <line
                x1={x} y1={PAD.top} x2={x} y2={H - PAD.bottom}
                stroke="#7c3aed"
                strokeWidth="1"
                strokeDasharray="4 3"
                opacity="0.5"
              />
              <text x={x + 3} y={PAD.top + 10} fontSize="9" fill="#7c3aed">
                {m.multiple}×
              </text>
            </g>
          );
        })}

        {/* Principal-only line */}
        <path d={principalPath} fill="none" stroke="#e5e7eb" strokeWidth="2" strokeDasharray="6 3" />

        {/* Total line */}
        <path d={totalPath} fill="none" stroke="#7c3aed" strokeWidth="2.5" />

        {/* Legend */}
        <g transform={`translate(${PAD.left}, ${H - 10})`}>
          <line x1="0" y1="0" x2="14" y2="0" stroke="#7c3aed" strokeWidth="2.5" />
          <text x="18" y="4" fontSize="10" fill="#6b7280">With contributions</text>
          <line x1="110" y1="0" x2="124" y2="0" stroke="#e5e7eb" strokeWidth="2" strokeDasharray="6 3" />
          <text x="128" y="4" fontSize="10" fill="#6b7280">Principal only</text>
        </g>
      </svg>
    </div>
  );
}
