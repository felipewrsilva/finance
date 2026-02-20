import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const INCOME_CATEGORIES = [
  { id: "system-income-salary", name: "Salary", icon: "💼", color: "#22c55e" },
  { id: "system-income-freelance", name: "Freelance", icon: "💻", color: "#10b981" },
  { id: "system-income-investment-returns", name: "Investment Returns", icon: "📈", color: "#14b8a6" },
  { id: "system-income-gift", name: "Gift", icon: "🎁", color: "#a78bfa" },
  { id: "system-income-other-income", name: "Other Income", icon: "💰", color: "#6366f1" },
];

const EXPENSE_CATEGORIES = [
  { id: "system-expense-housing", name: "Housing", icon: "🏠", color: "#f97316" },
  { id: "system-expense-food", name: "Food", icon: "🍽️", color: "#ef4444" },
  { id: "system-expense-transport", name: "Transport", icon: "🚗", color: "#f59e0b" },
  { id: "system-expense-health", name: "Health", icon: "🏥", color: "#ec4899" },
  { id: "system-expense-education", name: "Education", icon: "📚", color: "#8b5cf6" },
  { id: "system-expense-entertainment", name: "Entertainment", icon: "🎬", color: "#3b82f6" },
  { id: "system-expense-clothing", name: "Clothing", icon: "👕", color: "#06b6d4" },
  { id: "system-expense-subscriptions", name: "Subscriptions", icon: "📱", color: "#64748b" },
  { id: "system-expense-other-expense", name: "Other Expense", icon: "📦", color: "#94a3b8" },
];

async function main() {
  const client = await pool.connect();
  console.log("Seeding categories...");
  try {
    for (const cat of INCOME_CATEGORIES) {
      await client.query(
        `INSERT INTO categories (id, "userId", name, type, icon, color, "createdAt")
         VALUES ($1, NULL, $2, 'INCOME', $3, $4, NOW())
         ON CONFLICT (id) DO NOTHING`,
        [cat.id, cat.name, cat.icon, cat.color]
      );
    }
    for (const cat of EXPENSE_CATEGORIES) {
      await client.query(
        `INSERT INTO categories (id, "userId", name, type, icon, color, "createdAt")
         VALUES ($1, NULL, $2, 'EXPENSE', $3, $4, NOW())
         ON CONFLICT (id) DO NOTHING`,
        [cat.id, cat.name, cat.icon, cat.color]
      );
    }
    console.log(`✓ Seeded ${INCOME_CATEGORIES.length} income + ${EXPENSE_CATEGORIES.length} expense categories.`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
