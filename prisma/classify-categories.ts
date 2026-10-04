/**
 * One-shot: classify system expense categories as essential / optional.
 *
 * Usage: npx tsx prisma/classify-categories.ts
 */
import { Pool } from "pg";
import "dotenv/config";

/** Non-essential / comfort-oriented system categories. */
const OPTIONAL = [
  "system-expense-entertainment",
  "system-expense-clothing",
  "system-expense-subscriptions",
  "system-expense-food", // dining / eating out treated as optional by default seed
] as const;

const ESSENTIAL_FIXED = [
  "system-expense-housing",
  "system-expense-transport",
  "system-expense-health",
  "system-expense-education",
] as const;

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required");
  }

  const pool = new Pool({ connectionString });
  const client = await pool.connect();

  try {
    for (const id of OPTIONAL) {
      await client.query(
        `UPDATE categories
         SET "isEssential" = false, "groupType" = 'COMFORT'::"BudgetGroupType"
         WHERE id = $1`,
        [id]
      );
    }

    for (const id of ESSENTIAL_FIXED) {
      await client.query(
        `UPDATE categories
         SET "isEssential" = true, "groupType" = 'FIXED_COSTS'::"BudgetGroupType"
         WHERE id = $1`,
        [id]
      );
    }

    await client.query(
      `UPDATE categories
       SET "isEssential" = true, "groupType" = 'FIXED_COSTS'::"BudgetGroupType"
       WHERE id = 'system-expense-other-expense'`
    );

    console.log("Classified system expense categories.");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
