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

function futureValue(principal: number, annualRate: number, years: number): number {
  return principal * Math.pow(1 + annualRate, years);
}

function futureValueMonthly(
  contribution: number,
  annualRate: number,
  years: number
): number {
  const delta = 1 / 12;
  const periods = Math.floor(years / delta);
  let fv = 0;
  for (let n = 1; n <= periods; n++) {
    const remaining = years - n * delta;
    fv += contribution * Math.pow(1 + annualRate, Math.max(remaining, 0));
  }
  return fv;
}

export function totalProjectedValue(
  principal: number,
  annualRate: number,
  years: number,
  monthlyContribution = 0
): number {
  const principalFv = futureValue(principal, annualRate, years);
  if (!monthlyContribution) return principalFv;
  return principalFv + futureValueMonthly(monthlyContribution, annualRate, years);
}

export function projectInvestment(input: {
  principal: number;
  annualRatePct: number;
  monthlyContribution: number;
  years: number;
}) {
  const rate = input.annualRatePct / 100;
  return {
    atHorizon: totalProjectedValue(
      input.principal,
      rate,
      input.years,
      input.monthlyContribution
    ),
  };
}

export function spendHabitFuture(monthly: number, annualRatePct: number, years: number) {
  return totalProjectedValue(0, annualRatePct / 100, Math.max(1, years), monthly);
}
