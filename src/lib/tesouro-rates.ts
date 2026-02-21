/**
 * Fetches current Tesouro Direto rates from the DadosDeMercado public API.
 * No API key required. Used to seed / refresh investment_rate_history.
 */

export interface TesouroDireto {
  name: string;
  rate: number; // annualised yield (e.g. 12.5 = 12.5 %)
  reference_date: string; // ISO date string
}

const API_URL = "https://api.dadosdemercado.com.br/v1/treasury";

/** Map from DadosDeMercado title name fragment → our InvestmentCategory defaultRateSource key */
const TITLE_MAP: Record<string, string> = {
  Prefixado: "TESOURO_PREFIXADO",
  Selic: "TESOURO_SELIC",
  "IPCA+": "TESOURO_IPCA_PLUS",
};

export type RateEntry = {
  source: string; // defaultRateSource key
  name: string; // full title name from API
  rateAnnualPercentage: number;
  sourceDate: Date;
};

/**
 * Fetch current Tesouro Direto rates.
 * Returns null if the API is unreachable (non-blocking on deploy).
 */
export async function fetchTesouroDiretoRates(): Promise<RateEntry[] | null> {
  try {
    const res = await fetch(API_URL, {
      next: { revalidate: 86400 }, // cache 24 h
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      console.warn(`[tesouro-rates] API returned ${res.status}`);
      return null;
    }

    const data: TesouroDireto[] = await res.json();

    const entries: RateEntry[] = [];

    for (const item of data) {
      if (typeof item.rate !== "number" || !item.reference_date) continue;

      let source: string | null = null;
      for (const [fragment, key] of Object.entries(TITLE_MAP)) {
        if (item.name.includes(fragment)) {
          source = key;
          break;
        }
      }
      if (!source) continue;

      entries.push({
        source,
        name: item.name,
        rateAnnualPercentage: item.rate,
        sourceDate: new Date(item.reference_date),
      });
    }

    return entries;
  } catch (err) {
    console.warn("[tesouro-rates] fetch failed:", err);
    return null;
  }
}

/**
 * Computes the 12-month simple moving average for each source key from a
 * list of rate entries ordered from newest to oldest.
 */
export function computeMovingAverages(
  entries: RateEntry[]
): Record<string, number> {
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - 1);

  const grouped: Record<string, number[]> = {};

  for (const e of entries) {
    if (e.sourceDate < cutoff) continue;
    if (!grouped[e.source]) grouped[e.source] = [];
    grouped[e.source].push(e.rateAnnualPercentage);
  }

  const avgs: Record<string, number> = {};
  for (const [src, rates] of Object.entries(grouped)) {
    avgs[src] = rates.reduce((a, b) => a + b, 0) / rates.length;
  }
  return avgs;
}
