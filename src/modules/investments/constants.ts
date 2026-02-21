import { InvestmentStatus, RecurrenceInterval, InvestmentCompounding } from "@prisma/client";

export const INVESTMENT_STATUS_LABELS: Record<InvestmentStatus, string> = {
  ACTIVE: "Active",
  CANCELED: "Canceled",
  COMPLETED: "Completed",
};

export const INVESTMENT_STATUS_COLORS: Record<InvestmentStatus, string> = {
  ACTIVE: "text-emerald-600",
  CANCELED: "text-gray-400",
  COMPLETED: "text-indigo-600",
};

export const RECURRENCE_INTERVAL_LABELS: Record<RecurrenceInterval, string> = {
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  YEARLY: "Yearly",
};

export const COMPOUNDING_LABELS: Record<InvestmentCompounding, string> = {
  ANNUAL: "Annual",
  DAILY: "Daily",
};

export const INVESTMENT_TYPE_COLOR = "text-violet-600";

/** Fraction of a year for each recurrence interval */
export const INTERVAL_YEAR_FRACTION: Record<RecurrenceInterval, number> = {
  MONTHLY: 1 / 12,
  QUARTERLY: 1 / 4,
  YEARLY: 1,
};

/** Projection horizons in years */
export const PROJECTION_HORIZONS = [10, 20, 30] as const;
