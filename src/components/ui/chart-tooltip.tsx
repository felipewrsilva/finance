"use client";

import { formatTooltipCurrency } from "@/lib/chart-config";

type TooltipPayloadItem = {
  name?: string | number;
  value?: number | string;
  color?: string;
  dataKey?: string | number;
};

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
  currency: string;
  locale?: string;
}

export function ChartTooltip({
  active,
  payload,
  label,
  currency,
  locale = "pt-BR",
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-md">
      {label != null && label !== "" && (
        <p className="mb-1 text-xs font-medium text-text-secondary">{label}</p>
      )}
      <ul className="space-y-1">
        {payload.map((item, index) => {
          const value = Number(item.value ?? 0);
          const name = String(item.name ?? item.dataKey ?? "");
          return (
            <li key={`${name}-${index}`} className="flex items-center gap-2 text-xs">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: item.color ?? "currentColor" }}
                aria-hidden
              />
              <span className="text-text-muted">{name}</span>
              <span className="text-numeric text-text ml-auto">
                {formatTooltipCurrency(value, currency, locale)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
