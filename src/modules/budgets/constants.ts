import { BudgetPeriod } from "@prisma/client";

export const BUDGET_PERIOD_LABELS: Record<BudgetPeriod, string> = {
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};
