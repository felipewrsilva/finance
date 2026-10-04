"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { chartColors, chartDefaults, formatAxisCurrency } from "@/lib/chart-config";
import { ChartTooltip } from "@/components/ui/chart-tooltip";

interface DataPoint {
  month: string;
  year: number;
  income: number;
  expense: number;
}

interface Props {
  data: DataPoint[];
  currency: string;
  locale?: string;
}

export default function MonthlyChart({ data, currency, locale = "pt-BR" }: Props) {
  const axisFmt = (v: number) => formatAxisCurrency(v, currency, locale);

  return (
    <ResponsiveContainer width="100%" height={chartDefaults.height}>
      <BarChart data={data} margin={{ ...chartDefaults.margin }}>
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
        <Tooltip
          content={<ChartTooltip currency={currency} locale={locale} />}
        />
        <Legend
          wrapperStyle={{
            fontSize: chartDefaults.legend.fontSize,
            paddingTop: chartDefaults.legend.paddingTop,
          }}
        />
        <Bar
          dataKey="income"
          name="Income"
          fill={chartColors.income}
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="expense"
          name="Expenses"
          fill={chartColors.expense}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
