import { tokens } from "@/lib/design-tokens";

/** Semantic colors for finance charts (Recharts / SVG). */
export const chartColors = {
  income: tokens.color.success,
  expense: tokens.color.danger,
  net: tokens.color.primary,
  investment: tokens.color.investment,
  primary: tokens.color.primary,
  axis: tokens.color.textMuted,
  grid: "#f0f0f0",
  border: tokens.color.border,
  tooltipBg: tokens.color.surface,
  series: [
    tokens.color.primary,
    tokens.color.success,
    tokens.color.warning,
    tokens.color.danger,
    tokens.color.investment,
    "#0ea5e9",
    "#14b8a6",
    "#f97316",
  ],
} as const;

/** Shared Recharts layout/style defaults. */
export const chartDefaults = {
  height: 280,
  margin: { top: 4, right: 4, left: 0, bottom: 0 },
  strokeWidth: 2,
  dot: { r: 3 },
  activeDot: { r: 5 },
  showGrid: false,
  axis: {
    fontSize: 12,
    yFontSize: 11,
    tickFill: chartColors.axis,
    axisLine: false,
    tickLine: false,
    yWidth: 80,
  },
  tooltip: {
    borderRadius: "8px",
    border: `1px solid ${chartColors.border}`,
    fontSize: "12px",
    background: chartColors.tooltipBg,
  },
  legend: {
    fontSize: "12px",
    paddingTop: "8px",
  },
} as const;

export function formatAxisCurrency(
  value: number,
  currency: string,
  locale = "pt-BR"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatTooltipCurrency(
  value: number,
  currency: string,
  locale = "pt-BR"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}
