/**
 * Exchange rate service — fetches from frankfurter.app (free, no API key).
 * Maintains an in-process server-side cache with a 6-hour TTL.
 * Always returns 1 as a graceful fallback when the API is unavailable.
 */

const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

interface CacheEntry {
  rates: Record<string, number>;
  fetchedAt: number;
}

// Module-level cache — survives across requests within the same server instance.
const rateCache = new Map<string, CacheEntry>();

/**
 * Returns the exchange rate from `from` to `to`.
 * Example: getExchangeRate("USD", "BRL") → ~5.0
 */
export async function getExchangeRate(from: string, to: string): Promise<number> {
  if (from === to) return 1;

  const cached = rateCache.get(from);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.rates[to] ?? 1;
  }

  try {
    const res = await fetch(`https://api.frankfurter.app/latest?from=${from}`, {
      // Use Next.js fetch cache so multiple SSR renders share the same cached response.
      next: { revalidate: 21600 },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = (await res.json()) as { rates: Record<string, number> };

    rateCache.set(from, { rates: data.rates, fetchedAt: Date.now() });

    return data.rates[to] ?? 1;
  } catch (err) {
    console.error(`[exchange-rates] Failed to fetch ${from}→${to}:`, err);
    return 1; // graceful fallback — no crash, just no conversion
  }
}
