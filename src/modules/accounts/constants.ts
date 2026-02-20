import { AccountType } from "@prisma/client";

// ─── Banks ───────────────────────────────────────────────────────────────────

export const BANK_KEYS = [
  "nubank",
  "itau",
  "bradesco",
  "banco_do_brasil",
  "inter",
  "c6",
  "picpay",
  "caixa",
  "santander",
] as const;

export type BankKey = (typeof BANK_KEYS)[number];

export type Bank = {
  readonly key: BankKey;
  readonly label: string;
  readonly primaryColor: string;
  readonly logoPath: string;
};

export const BANKS: readonly Bank[] = [
  { key: "nubank",         label: "Nubank",          primaryColor: "#8A05BE", logoPath: "/banks/nubank.svg" },
  { key: "itau",           label: "Itaú",            primaryColor: "#EC7000", logoPath: "/banks/itau.svg" },
  { key: "bradesco",       label: "Bradesco",        primaryColor: "#CC092F", logoPath: "/banks/bradesco.svg" },
  { key: "banco_do_brasil",label: "Banco do Brasil", primaryColor: "#FFCC00", logoPath: "/banks/banco_do_brasil.svg" },
  { key: "inter",          label: "Inter",           primaryColor: "#FF6D00", logoPath: "/banks/inter.svg" },
  { key: "c6",             label: "C6 Bank",         primaryColor: "#242424", logoPath: "/banks/c6.svg" },
  { key: "picpay",         label: "PicPay",          primaryColor: "#21C25E", logoPath: "/banks/picpay.svg" },
  { key: "caixa",          label: "Caixa",           primaryColor: "#006CB5", logoPath: "/banks/caixa.svg" },
  { key: "santander",      label: "Santander",       primaryColor: "#EC0000", logoPath: "/banks/santander.svg" },
];

export const BANKS_BY_KEY = Object.fromEntries(
  BANKS.map((b) => [b.key, b]),
) as Record<BankKey, Bank>;

// ─── Account types ────────────────────────────────────────────────────────────

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
