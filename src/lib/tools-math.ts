import { totalProjectedValue } from "@/modules/investments/projections";

export const ALLOCATION_GROUPS = [
  { key: "fixed", percentage: 50 },
  { key: "comfort", percentage: 30 },
  { key: "goals", percentage: 10 },
  { key: "investments", percentage: 10 },
] as const;

export function allocateIncome(monthlyIncome: number) {
  return ALLOCATION_GROUPS.map((g) => ({
    key: g.key,
    percentage: g.percentage,
    amount: (monthlyIncome * g.percentage) / 100,
  }));
}

export function projectInvestment(input: {
  principal: number;
  annualRatePct: number;
  monthlyContribution: number;
  years: number;
}) {
  const rate = input.annualRatePct / 100;
  const horizons = [5, 10, 20].filter((y) => y <= Math.max(input.years, 20));
  if (!horizons.includes(input.years)) horizons.push(input.years);
  horizons.sort((a, b) => a - b);

  return {
    atHorizon: totalProjectedValue(
      input.principal,
      rate,
      input.years,
      input.monthlyContribution,
      "MONTHLY"
    ),
    horizons: horizons.map((years) => ({
      years,
      value: totalProjectedValue(
        input.principal,
        rate,
        years,
        input.monthlyContribution,
        "MONTHLY"
      ),
    })),
  };
}

export function redirectImpact(input: {
  principal: number;
  annualRatePct: number;
  currentMonthly: number;
  redirectMonthly: number;
  years: number;
}) {
  const rate = input.annualRatePct / 100;
  const current = totalProjectedValue(
    input.principal,
    rate,
    input.years,
    input.currentMonthly,
    "MONTHLY"
  );
  const optimized = totalProjectedValue(
    input.principal,
    rate,
    input.years,
    input.currentMonthly + input.redirectMonthly,
    "MONTHLY"
  );
  return {
    current,
    optimized,
    delta: optimized - current,
    optimizedMonthly: input.currentMonthly + input.redirectMonthly,
  };
}
