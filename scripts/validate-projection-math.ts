/**
 * #37 Projection math consistency checks (pure, no auth).
 * Run: npx tsx scripts/validate-projection-math.ts
 */
import { totalProjectedValue } from "../src/modules/investments/projections";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`FAIL: ${msg}`);
}

const principal = 10000;
const rate = 0.1;
const years = 10;
const monthly = 100;

const current = totalProjectedValue(principal, rate, years, monthly, "MONTHLY");
const optimized = totalProjectedValue(principal, rate, years, monthly + 50, "MONTHLY");
const delta = optimized - current;

assert(current > principal, "current projection should exceed principal");
assert(optimized > current, "optimized should exceed current when monthly rises");
assert(delta > 0, "delta must be positive");
assert(
  Math.abs(totalProjectedValue(principal, rate, 0) - principal) < 0.01,
  "zero years should return principal"
);

console.log(
  `OK: projection math current=${current.toFixed(2)} optimized=${optimized.toFixed(2)} delta=${delta.toFixed(2)}`
);
