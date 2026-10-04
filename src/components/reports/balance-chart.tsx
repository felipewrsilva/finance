"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { chartColors, chartDefaults, formatAxisCurrency } from "@/lib/chart-config";
import { ChartTooltip } from "@/components/ui/chart-tooltip";

interface AccountInfo {
  id: string;
  name: string;
  color: string | null;
}

interface Props {
  accounts: AccountInfo[];
  dataPoints: Record<string, unknown>[];
  currency: string;
  locale?: string;
}

export default function BalanceChart({
  accounts,
  dataPoints,
  currency,
  locale = "pt-BR",
}: Props) {
  const axisFmt = (v: number) => formatAxisCurrency(v, currency, locale);

  return (
    <ResponsiveContainer width="100%" height={chartDefaults.height}>
      <LineChart data={dataPoints} margin={{ ...chartDefaults.margin }}>
        <XAxis
          dataKey="month"
          tick={{ fontSize: chartDefaults.axis.fontSize, fill: chartDefaults.axis.tickFill }}
          axisLine={chartDefaults.axis.axisLine}
          tickLine={chartDefaults.axis.tickLine}
        />
        <YAxis
          tickFormatter={(v) => axisFmt(v)}
          tick={{ fontSize: chartDefaults.axis.yFontSize, fill: chartDefaults.axis.tickFill }}
          axisLine={chartDefaults.axis.axisLine}
          tickLine={chartDefaults.axis.tickLine}
          width={chartDefaults.axis.yWidth}
        />
        <Tooltip content={<ChartTooltip currency={currency} locale={locale} />} />
        <Legend />
        {accounts.map((account, idx) => (
          <Line
            key={account.id}
            type="monotone"
            dataKey={account.name}
            stroke={
              account.color ?? chartColors.series[idx % chartColors.series.length]
            }
            strokeWidth={chartDefaults.strokeWidth}
            dot={chartDefaults.dot}
            activeDot={chartDefaults.activeDot}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
