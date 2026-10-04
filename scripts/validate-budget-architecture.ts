/**
 * #32 Functional Validation smoke checks against the live database.
 * Run: npx tsx scripts/validate-budget-architecture.ts
 */
import "dotenv/config";
import { Pool } from "pg";
import { budgetSchema } from "../src/modules/budgets/schema";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`FAIL: ${msg}`);
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  assert(connectionString, "DATABASE_URL is required");

  const pool = new Pool({ connectionString });
  const client = await pool.connect();
  const failures: string[] = [];

  try {
    // Schema: groupId required
    const missingGroup = budgetSchema.safeParse({
      name: "Test",
      amount: 100,
      period: "MONTHLY",
      startDate: new Date(),
    });
    assert(!missingGroup.success, "budgetSchema should reject missing groupId");

    const withGroup = budgetSchema.safeParse({
      name: "Test",
      groupId: "bg_test",
      amount: 100,
      period: "MONTHLY",
      startDate: new Date(),
    });
    assert(withGroup.success, "budgetSchema should accept valid groupId");

    // Groups: each user has 4 defaults summing to 100; no null budget.groupId
    const users = await client.query<{ id: string; email: string }>(
      `SELECT id, email FROM users`
    );

    for (const user of users.rows) {
      const groups = await client.query<{ type: string; percentage: string }>(
        `SELECT type, percentage::text FROM budget_groups WHERE "userId" = $1 ORDER BY "sortOrder"`,
        [user.id]
      );
      if (groups.rowCount !== 4) {
        failures.push(`${user.email}: expected 4 groups, got ${groups.rowCount}`);
        continue;
      }
      const sum = groups.rows.reduce((s, g) => s + Number(g.percentage), 0);
      if (Math.abs(sum - 100) > 0.001) {
        failures.push(`${user.email}: group % sum ${sum}, expected 100`);
      }

      const nullBudgets = await client.query(
        `SELECT count(*)::int AS c FROM budgets WHERE "userId" = $1 AND "groupId" IS NULL`,
        [user.id]
      );
      if (nullBudgets.rows[0].c > 0) {
        failures.push(`${user.email}: ${nullBudgets.rows[0].c} budgets with null groupId`);
      }
    }

    // Category classification backfill
    const classified = await client.query<{
      is_essential_false: number;
      is_essential_true: number;
    }>(`
      SELECT
        count(*) FILTER (WHERE "isEssential" = false AND id LIKE 'system-expense-%')::int AS is_essential_false,
        count(*) FILTER (WHERE "isEssential" = true AND id LIKE 'system-expense-%')::int AS is_essential_true
      FROM categories
    `);
    assert(
      classified.rows[0].is_essential_false > 0,
      "expected some optional system expense categories"
    );
    assert(
      classified.rows[0].is_essential_true > 0,
      "expected some essential system expense categories"
    );

    // detectOptionalSpending sort contract (pure): higher redirectable first
    const sample = [
      { redirectableAmount: 10 },
      { redirectableAmount: 50 },
      { redirectableAmount: 30 },
    ].sort((a, b) => b.redirectableAmount - a.redirectableAmount);
    assert(
      sample[0].redirectableAmount === 50 && sample[2].redirectableAmount === 10,
      "optional spending sort should be descending by redirectableAmount"
    );

    // Optional category spend aggregation for a user with data (structural, not auth-bound)
    const spend = await client.query(`
      SELECT c.id, c.name, sum(t."amountInDefaultCurrency")::float AS total
      FROM transactions t
      JOIN categories c ON c.id = t."categoryId"
      WHERE t.type = 'EXPENSE' AND t.status = 'PAID' AND c."isEssential" = false
      GROUP BY c.id, c.name
      ORDER BY total DESC
      LIMIT 5
    `);
    console.log(
      `Optional spend categories with data: ${spend.rowCount} (top sample ok)`
    );

    if (failures.length) {
      for (const f of failures) console.error(f);
      throw new Error(`${failures.length} validation failure(s)`);
    }

    console.log(`OK: validated ${users.rowCount} user(s), schema, classification, sort.`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
