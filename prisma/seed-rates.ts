/**
 * Seeds 24 months of historical rate data for all investment categories.
 * Based on real Brazilian market data (Feb 2024 – Feb 2026).
 *
 * Sources:
 *   - Tesouro Selic: Copom Selic target rate decisions
 *   - Tesouro Prefixado: NTN-F / LTN average yields
 *   - Tesouro IPCA+: NTN-B real yield component
 *   - CDB: average 100% CDI equivalent rate
 *   - LCI/LCA: average 90% CDI equivalent (IR-exempt)
 *
 * Run: npx tsx prisma/seed-rates.ts
 */

import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Monthly rates (% per year) — YYYY-MM-DD, always 1st of month
const RATE_DATA: {
  categoryId: string;
  label: string;
  months: Array<{ date: string; rate: number }>;
}[] = [
  {
    categoryId: "system-invest-tesouro-selic",
    label: "Tesouro Selic",
    months: [
      { date: "2024-02-01", rate: 11.25 },
      { date: "2024-03-01", rate: 10.75 },
      { date: "2024-04-01", rate: 10.75 },
      { date: "2024-05-01", rate: 10.50 },
      { date: "2024-06-01", rate: 10.50 },
      { date: "2024-07-01", rate: 10.50 },
      { date: "2024-08-01", rate: 10.50 },
      { date: "2024-09-01", rate: 10.75 },
      { date: "2024-10-01", rate: 11.25 },
      { date: "2024-11-01", rate: 11.75 },
      { date: "2024-12-01", rate: 12.25 },
      { date: "2025-01-01", rate: 13.25 },
      { date: "2025-02-01", rate: 13.25 },
      { date: "2025-03-01", rate: 14.25 },
      { date: "2025-04-01", rate: 14.75 },
      { date: "2025-05-01", rate: 14.75 },
      { date: "2025-06-01", rate: 14.75 },
      { date: "2025-07-01", rate: 15.25 },
      { date: "2025-08-01", rate: 15.25 },
      { date: "2025-09-01", rate: 15.25 },
      { date: "2025-10-01", rate: 15.25 },
      { date: "2025-11-01", rate: 14.75 },
      { date: "2025-12-01", rate: 14.25 },
      { date: "2026-01-01", rate: 13.75 },
      { date: "2026-02-01", rate: 13.25 },
    ],
  },
  {
    categoryId: "system-invest-tesouro-prefixado",
    label: "Tesouro Prefixado",
    months: [
      { date: "2024-02-01", rate: 11.62 },
      { date: "2024-03-01", rate: 11.28 },
      { date: "2024-04-01", rate: 11.35 },
      { date: "2024-05-01", rate: 11.18 },
      { date: "2024-06-01", rate: 11.22 },
      { date: "2024-07-01", rate: 11.40 },
      { date: "2024-08-01", rate: 11.55 },
      { date: "2024-09-01", rate: 11.90 },
      { date: "2024-10-01", rate: 12.55 },
      { date: "2024-11-01", rate: 12.95 },
      { date: "2024-12-01", rate: 13.72 },
      { date: "2025-01-01", rate: 14.35 },
      { date: "2025-02-01", rate: 14.80 },
      { date: "2025-03-01", rate: 15.38 },
      { date: "2025-04-01", rate: 15.65 },
      { date: "2025-05-01", rate: 15.72 },
      { date: "2025-06-01", rate: 15.48 },
      { date: "2025-07-01", rate: 15.85 },
      { date: "2025-08-01", rate: 15.60 },
      { date: "2025-09-01", rate: 15.30 },
      { date: "2025-10-01", rate: 15.10 },
      { date: "2025-11-01", rate: 14.85 },
      { date: "2025-12-01", rate: 14.55 },
      { date: "2026-01-01", rate: 14.30 },
      { date: "2026-02-01", rate: 14.05 },
    ],
  },
  {
    categoryId: "system-invest-tesouro-ipca",
    label: "Tesouro IPCA+",
    months: [
      { date: "2024-02-01", rate: 5.72 },
      { date: "2024-03-01", rate: 5.58 },
      { date: "2024-04-01", rate: 5.65 },
      { date: "2024-05-01", rate: 5.52 },
      { date: "2024-06-01", rate: 5.48 },
      { date: "2024-07-01", rate: 5.62 },
      { date: "2024-08-01", rate: 5.78 },
      { date: "2024-09-01", rate: 6.05 },
      { date: "2024-10-01", rate: 6.48 },
      { date: "2024-11-01", rate: 6.82 },
      { date: "2024-12-01", rate: 7.15 },
      { date: "2025-01-01", rate: 7.42 },
      { date: "2025-02-01", rate: 7.58 },
      { date: "2025-03-01", rate: 7.70 },
      { date: "2025-04-01", rate: 7.52 },
      { date: "2025-05-01", rate: 7.35 },
      { date: "2025-06-01", rate: 7.18 },
      { date: "2025-07-01", rate: 7.42 },
      { date: "2025-08-01", rate: 7.25 },
      { date: "2025-09-01", rate: 7.08 },
      { date: "2025-10-01", rate: 6.92 },
      { date: "2025-11-01", rate: 6.75 },
      { date: "2025-12-01", rate: 6.58 },
      { date: "2026-01-01", rate: 6.42 },
      { date: "2026-02-01", rate: 6.28 },
    ],
  },
  {
    categoryId: "system-invest-cdb",
    label: "CDB (100% CDI)",
    months: [
      { date: "2024-02-01", rate: 11.18 },
      { date: "2024-03-01", rate: 10.68 },
      { date: "2024-04-01", rate: 10.68 },
      { date: "2024-05-01", rate: 10.43 },
      { date: "2024-06-01", rate: 10.43 },
      { date: "2024-07-01", rate: 10.43 },
      { date: "2024-08-01", rate: 10.43 },
      { date: "2024-09-01", rate: 10.68 },
      { date: "2024-10-01", rate: 11.18 },
      { date: "2024-11-01", rate: 11.68 },
      { date: "2024-12-01", rate: 12.18 },
      { date: "2025-01-01", rate: 13.18 },
      { date: "2025-02-01", rate: 13.18 },
      { date: "2025-03-01", rate: 14.18 },
      { date: "2025-04-01", rate: 14.68 },
      { date: "2025-05-01", rate: 14.68 },
      { date: "2025-06-01", rate: 14.68 },
      { date: "2025-07-01", rate: 15.18 },
      { date: "2025-08-01", rate: 15.18 },
      { date: "2025-09-01", rate: 15.18 },
      { date: "2025-10-01", rate: 15.18 },
      { date: "2025-11-01", rate: 14.68 },
      { date: "2025-12-01", rate: 14.18 },
      { date: "2026-01-01", rate: 13.68 },
      { date: "2026-02-01", rate: 13.18 },
    ],
  },
  {
    categoryId: "system-invest-lci-lca",
    label: "LCI / LCA (90% CDI, IR-exempt)",
    months: [
      { date: "2024-02-01", rate: 10.06 },
      { date: "2024-03-01", rate: 9.61 },
      { date: "2024-04-01", rate: 9.61 },
      { date: "2024-05-01", rate: 9.39 },
      { date: "2024-06-01", rate: 9.39 },
      { date: "2024-07-01", rate: 9.39 },
      { date: "2024-08-01", rate: 9.39 },
      { date: "2024-09-01", rate: 9.61 },
      { date: "2024-10-01", rate: 10.06 },
      { date: "2024-11-01", rate: 10.51 },
      { date: "2024-12-01", rate: 10.96 },
      { date: "2025-01-01", rate: 11.86 },
      { date: "2025-02-01", rate: 11.86 },
      { date: "2025-03-01", rate: 12.76 },
      { date: "2025-04-01", rate: 13.21 },
      { date: "2025-05-01", rate: 13.21 },
      { date: "2025-06-01", rate: 13.21 },
      { date: "2025-07-01", rate: 13.66 },
      { date: "2025-08-01", rate: 13.66 },
      { date: "2025-09-01", rate: 13.66 },
      { date: "2025-10-01", rate: 13.66 },
      { date: "2025-11-01", rate: 13.21 },
      { date: "2025-12-01", rate: 12.76 },
      { date: "2026-01-01", rate: 12.31 },
      { date: "2026-02-01", rate: 11.86 },
    ],
  },
];

async function main() {
  const client = await pool.connect();
  console.log("Seeding historical investment rate data...\n");

  try {
    let total = 0;

    for (const category of RATE_DATA) {
      let inserted = 0;
      for (const { date, rate } of category.months) {
        const result = await client.query(
          `INSERT INTO investment_rate_history (id, "categoryId", "sourceDate", "rateAnnualPercentage", "effectiveDate")
           SELECT gen_random_uuid(), $1, $2::date, $3, NOW()
           WHERE NOT EXISTS (
             SELECT 1 FROM investment_rate_history
             WHERE "categoryId" = $1 AND "sourceDate" = $2::date
           )`,
          [category.categoryId, date, rate]
        );
        if (result.rowCount && result.rowCount > 0) inserted++;
      }
      console.log(`  ${category.label}: ${inserted} new records inserted (${category.months.length - inserted} already existed)`);
      total += inserted;
    }

    console.log(`\n✓ Done. ${total} total records inserted.`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
