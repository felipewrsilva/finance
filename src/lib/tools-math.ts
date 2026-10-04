export const ALLOCATION_GROUPS = [
  { key: "fixed", percentage: 50 },
  { key: "comfort", percentage: 30 },
  { key: "goals", percentage: 10 },
  { key: "investments", percentage: 10 },
] as const;

export type AllocationGroupKey = (typeof ALLOCATION_GROUPS)[number]["key"];

const ALLOCATION_PARTS: Record<
  AllocationGroupKey,
  { key: string; ofGroup: number }[]
> = {
  fixed: [
    { key: "housing", ofGroup: 0.5 },
    { key: "utilities", ofGroup: 0.25 },
    { key: "groceries", ofGroup: 0.25 },
  ],
  comfort: [
    { key: "transport", ofGroup: 0.4 },
    { key: "out", ofGroup: 0.35 },
    { key: "small", ofGroup: 0.25 },
  ],
  goals: [
    { key: "reserve", ofGroup: 0.6 },
    { key: "wish", ofGroup: 0.4 },
  ],
  investments: [{ key: "grow", ofGroup: 1 }],
};

export function allocateIncome(monthlyIncome: number) {
  const income = Math.max(0, monthlyIncome);
  return ALLOCATION_GROUPS.map((g) => {
    const amount = (income * g.percentage) / 100;
    return {
      key: g.key,
      percentage: g.percentage,
      amount,
      parts: ALLOCATION_PARTS[g.key].map((part) => ({
        key: part.key,
        amount: amount * part.ofGroup,
        ofGroupPct: Math.round(part.ofGroup * 100),
      })),
    };
  });
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

export const MIX_FIXED_MIN = 10;
export const MIX_FIXED_MAX = 90;
export const POUPANCA_SELIC_CUTOFF = 8.5;
export const POUPANCA_HIGH_SELIC_MONTHLY = 0.005;
export const DEFAULT_SELIC_PCT = 8;
export const DEFAULT_CDB_CDI_PCT = 100;
export const DEFAULT_WRLD_ANNUAL_PCT = 6;

export function mixFixedPctFromYears(years: number): number {
  const y = Math.max(0, years);
  if (y <= 3) return 85;
  if (y <= 6) return 70;
  if (y <= 10) return 50;
  return 35;
}

export function clampMixFixedPct(pct: number): number {
  if (!Number.isFinite(pct)) return MIX_FIXED_MIN;
  return Math.min(MIX_FIXED_MAX, Math.max(MIX_FIXED_MIN, Math.round(pct)));
}

export function mixSlices(amount: number, fixedPct: number) {
  const total = Math.max(0, amount);
  const fixed = clampMixFixedPct(fixedPct);
  const variable = 100 - fixed;
  return {
    fixedPct: fixed,
    variablePct: variable,
    fixedAmount: (total * fixed) / 100,
    variableAmount: (total * variable) / 100,
  };
}

export function poupancaAnnualRatePct(selicPct: number): number {
  const selic = Math.max(0, selicPct);
  if (selic > POUPANCA_SELIC_CUTOFF) {
    return (Math.pow(1 + POUPANCA_HIGH_SELIC_MONTHLY, 12) - 1) * 100;
  }
  return 0.7 * selic;
}

export function tesouroSelicAnnualRatePct(selicPct: number): number {
  return Math.max(0, selicPct);
}

export function cdbAnnualRatePct(selicPct: number, cdiPct = DEFAULT_CDB_CDI_PCT): number {
  return Math.max(0, selicPct) * (Math.max(0, cdiPct) / 100);
}

export function monthlyFromHorizon(atHorizon: number, years: number): number {
  const months = Math.max(1, years) * 12;
  return Math.max(0, atHorizon) / months;
}
