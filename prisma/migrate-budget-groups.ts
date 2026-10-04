/**
 * One-shot backfill: create default budget groups per user and assign
 * existing budgets to FIXED_COSTS.
 *
 * Prerequisites: migration `add_budget_groups` applied; DATABASE_URL set.
 * Usage: npx tsx prisma/migrate-budget-groups.ts
 */
import { randomBytes } from "crypto";
import { Pool } from "pg";
import "dotenv/config";

const DEFAULT_BUDGET_GROUPS = [
  { type: "FIXED_COSTS", name: "Fixed costs", percentage: 50, sortOrder: 0 },
  { type: "COMFORT", name: "Comfort", percentage: 30, sortOrder: 1 },
  { type: "GOALS", name: "Goals", percentage: 10, sortOrder: 2 },
  { type: "INVESTMENTS", name: "Investments", percentage: 10, sortOrder: 3 },
] as const;

function newId(prefix: string): string {
  return `${prefix}_${randomBytes(12).toString("hex")}`;
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required");
  }

  const pool = new Pool({ connectionString });
  const client = await pool.connect();

  try {
    const users = await client.query<{ id: string; email: string }>(
      `SELECT id, email FROM users`
    );
    console.log(`Migrating budget groups for ${users.rowCount} user(s)...`);

    for (const user of users.rows) {
      const existing = await client.query<{ id: string; type: string }>(
        `SELECT id, type FROM budget_groups WHERE "userId" = $1`,
        [user.id]
      );
      const have = new Set(existing.rows.map((r) => r.type));

      for (const g of DEFAULT_BUDGET_GROUPS) {
        if (have.has(g.type)) continue;
        await client.query(
          `INSERT INTO budget_groups (id, "userId", type, name, percentage, "sortOrder", "createdAt", "updatedAt")
           VALUES ($1, $2, $3::"BudgetGroupType", $4, $5, $6, NOW(), NOW())
           ON CONFLICT ("userId", type) DO NOTHING`,
          [newId("bg"), user.id, g.type, g.name, g.percentage, g.sortOrder]
        );
      }

      const fixed = await client.query<{ id: string }>(
        `SELECT id FROM budget_groups WHERE "userId" = $1 AND type = 'FIXED_COSTS' LIMIT 1`,
        [user.id]
      );
      if (fixed.rowCount === 0) {
        throw new Error(`FIXED_COSTS missing for ${user.email}`);
      }

      const updated = await client.query(
        `UPDATE budgets SET "groupId" = $1 WHERE "userId" = $2 AND "groupId" IS NULL`,
        [fixed.rows[0].id, user.id]
      );

      const groups = await client.query<{ c: number }>(
        `SELECT COUNT(*)::int AS c FROM budget_groups WHERE "userId" = $1`,
        [user.id]
      );
      const nulls = await client.query<{ c: number }>(
        `SELECT COUNT(*)::int AS c FROM budgets WHERE "userId" = $1 AND "groupId" IS NULL`,
        [user.id]
      );

      console.log(
        `  ${user.email}: groups=${groups.rows[0].c}, budgetsLinked=${updated.rowCount}, stillNull=${nulls.rows[0].c}`
      );
    }

    const remaining = await client.query<{ c: number }>(
      `SELECT COUNT(*)::int AS c FROM budgets WHERE "groupId" IS NULL`
    );
    if (remaining.rows[0].c > 0) {
      throw new Error(`${remaining.rows[0].c} budget(s) still have null groupId`);
    }

    console.log("Done. All users have groups; no budget has null groupId.");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
