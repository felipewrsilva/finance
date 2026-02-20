import { AccountType } from "@prisma/client";

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  CASH: "Cash",
  CHECKING: "Checking Account",
  BANK: "Bank Account",
  CREDIT_CARD: "Credit Card",
  INVESTMENT: "Investment",
};

export const ACCOUNT_TYPE_ICONS: Record<AccountType, string> = {
  CASH: "💵",
  CHECKING: "🏧",
  BANK: "🏦",
  CREDIT_CARD: "💳",
  INVESTMENT: "📈",
};

export const ACCOUNT_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#0ea5e9",
  "#64748b",
];
