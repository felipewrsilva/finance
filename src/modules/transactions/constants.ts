import { TransactionType, TransactionStatus, Frequency } from "@prisma/client";

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  INCOME: "Income",
  EXPENSE: "Expense",
  TRANSFER: "Transfer",
};

export const TRANSACTION_STATUS_LABELS: Record<TransactionStatus, string> = {
  PAID: "Paid",
  PENDING: "Pending",
};

export const TRANSACTION_TYPE_COLORS: Record<TransactionType, string> = {
  INCOME: "text-green-600",
  EXPENSE: "text-red-500",
  TRANSFER: "text-blue-500",
};

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};
