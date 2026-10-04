import { COMPARE_RATES } from "@/lib/compare-rates";

export const FREEDOM_RATES = {
  asOf: COMPARE_RATES.asOf,
  selicPct: COMPARE_RATES.selicPct,
  selicHref: COMPARE_RATES.selicHref,
  irPct: 15,
  ipcaPct: 4.99,
  ipcaSource: "Boletim Focus. Mediana do IPCA para 2026, leitura de setembro de 2026.",
  ipcaHref: "https://www.bcb.gov.br/publicacoes/focus",
} as const;

export function netNominalPct(selicPct: number, irPct: number) {
  return Math.max(0, selicPct) * (1 - Math.min(100, Math.max(0, irPct)) / 100);
}

export function realYieldPct(netPct: number, ipcaPct: number) {
  const net = netPct / 100;
  const ipca = Math.max(-0.99, ipcaPct / 100);
  return ((1 + net) / (1 + ipca) - 1) * 100;
}

export function corpusForMonthlyIncome(monthly: number, annualPct: number) {
  const rate = annualPct / 100;
  if (!(rate > 0)) return 0;
  return (Math.max(0, monthly) * 12) / rate;
}

export function monthlyFromCorpus(corpus: number, annualPct: number) {
  return (Math.max(0, corpus) * Math.max(0, annualPct / 100)) / 12;
}

export function monthlyToReach(input: {
  target: number;
  principal: number;
  annualRatePct: number;
  years: number;
}) {
  const years = Math.max(0, input.years);
  const months = Math.max(1, years) * 12;
  const pv = Math.max(0, input.principal);
  const fv = Math.max(0, input.target);
  const rm = Math.pow(1 + Math.max(0, input.annualRatePct) / 100, 1 / 12) - 1;
  const growth = Math.pow(1 + rm, months);
  const gap = fv - pv * growth;
  if (gap <= 0) return 0;
  if (rm < 1e-12) return gap / months;
  return (gap * rm) / (growth - 1);
}

export function growToTargetByYear(input: {
  principal: number;
  monthly: number;
  annualRatePct: number;
  years: number;
}) {
  const years = Math.max(0, input.years);
  const points: { year: number; value: number }[] = [];
  for (let y = 0; y <= years; y++) {
    const months = y * 12;
    const rm = Math.pow(1 + Math.max(0, input.annualRatePct) / 100, 1 / 12) - 1;
    const growth = Math.pow(1 + rm, months);
    let value = Math.max(0, input.principal) * growth;
    if (months > 0 && rm >= 1e-12) {
      value += input.monthly * ((growth - 1) / rm);
    } else if (months > 0) {
      value += input.monthly * months;
    }
    points.push({ year: y, value });
  }
  return points;
}
