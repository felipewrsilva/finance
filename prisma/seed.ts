import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const INVESTMENT_CATEGORIES = [
  {
    id: "system-invest-tesouro-prefixado",
    name: "Tesouro Prefixado",
    investmentType: "fixedIncome",
    defaultRateSource: "TESOURO_PREFIXADO",
    description: "Título público prefixado com rentabilidade definida no momento da compra.",
    riskLevel: "low",
  },
  {
    id: "system-invest-tesouro-selic",
    name: "Tesouro Selic",
    investmentType: "fixedIncome",
    defaultRateSource: "TESOURO_SELIC",
    description: "Título público pós-fixado atrelado à taxa Selic.",
    riskLevel: "low",
  },
  {
    id: "system-invest-tesouro-ipca",
    name: "Tesouro IPCA+",
    investmentType: "fixedIncome",
    defaultRateSource: "TESOURO_IPCA_PLUS",
    description: "Título público híbrido atrelado ao IPCA mais uma taxa prefixada.",
    riskLevel: "low",
  },
  {
    id: "system-invest-cdb",
    name: "CDB",
    investmentType: "fixedIncome",
    defaultRateSource: null,
    description: "Certificado de Depósito Bancário emitido por bancos.",
    riskLevel: "low",
  },
  {
    id: "system-invest-lci-lca",
    name: "LCI / LCA",
    investmentType: "fixedIncome",
    defaultRateSource: null,
    description: "Letra de Crédito Imobiliário ou do Agronegócio, isenta de IR.",
    riskLevel: "low",
  },
  {
    id: "system-invest-custom",
    name: "Custom Investment",
    investmentType: "custom",
    defaultRateSource: null,
    description: "User-defined investment with a custom name and manually entered rate.",
    riskLevel: null,
  },
];

const INCOME_CATEGORIES = [
  { id: "system-income-salary", name: "Salary", icon: "💼", color: "#22c55e" },
  { id: "system-income-freelance", name: "Freelance", icon: "💻", color: "#10b981" },
  { id: "system-income-investment-returns", name: "Investment Returns", icon: "📈", color: "#14b8a6" },
  { id: "system-income-gift", name: "Gift", icon: "🎁", color: "#a78bfa" },
  { id: "system-income-other-income", name: "Other Income", icon: "💰", color: "#6366f1" },
];

const EXPENSE_CATEGORIES = [
  { id: "system-expense-housing", name: "Housing", icon: "🏠", color: "#f97316", isEssential: true, groupType: "FIXED_COSTS" },
  { id: "system-expense-food", name: "Food", icon: "🍽️", color: "#ef4444", isEssential: false, groupType: "COMFORT" },
  { id: "system-expense-transport", name: "Transport", icon: "🚗", color: "#f59e0b", isEssential: true, groupType: "FIXED_COSTS" },
  { id: "system-expense-health", name: "Health", icon: "🏥", color: "#ec4899", isEssential: true, groupType: "FIXED_COSTS" },
  { id: "system-expense-education", name: "Education", icon: "📚", color: "#8b5cf6", isEssential: true, groupType: "FIXED_COSTS" },
  { id: "system-expense-entertainment", name: "Entertainment", icon: "🎬", color: "#3b82f6", isEssential: false, groupType: "COMFORT" },
  { id: "system-expense-clothing", name: "Clothing", icon: "👕", color: "#06b6d4", isEssential: false, groupType: "COMFORT" },
  { id: "system-expense-subscriptions", name: "Subscriptions", icon: "📱", color: "#64748b", isEssential: false, groupType: "COMFORT" },
  { id: "system-expense-other-expense", name: "Other Expense", icon: "📦", color: "#94a3b8", isEssential: true, groupType: "FIXED_COSTS" },
] as const;

async function main() {
  const client = await pool.connect();
  console.log("Seeding categories...");
  try {
    for (const cat of INVESTMENT_CATEGORIES) {
      await client.query(
        `INSERT INTO investment_categories (id, name, "investmentType", "defaultRateSource", description, "riskLevel", "createdAt")
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         ON CONFLICT (id) DO NOTHING`,
        [cat.id, cat.name, cat.investmentType, cat.defaultRateSource, cat.description, cat.riskLevel]
      );
    }
    console.log(`✓ Seeded ${INVESTMENT_CATEGORIES.length} investment categories.`);

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
        `INSERT INTO categories (id, "userId", name, type, icon, color, "isEssential", "groupType", "createdAt")
         VALUES ($1, NULL, $2, 'EXPENSE', $3, $4, $5, $6::"BudgetGroupType", NOW())
         ON CONFLICT (id) DO UPDATE SET
           "isEssential" = EXCLUDED."isEssential",
           "groupType" = EXCLUDED."groupType"`,
        [cat.id, cat.name, cat.icon, cat.color, cat.isEssential, cat.groupType]
      );
    }
    console.log(`✓ Seeded ${INCOME_CATEGORIES.length} income + ${EXPENSE_CATEGORIES.length} expense categories.`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
