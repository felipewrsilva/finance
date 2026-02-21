import { z } from "zod";
import { InvestmentCompounding, InvestmentStatus, RecurrenceInterval } from "@prisma/client";

export const investmentSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  transactionId: z.string().optional().nullable(),
  startDate: z.coerce.date({ error: "Start date is required" }),
  principalAmount: z
    .coerce
    .number({ error: "Amount is required" })
    .positive("Must be greater than 0"),
  currency: z.string().min(1).default("BRL"),
  annualInterestRate: z
    .coerce
    .number({ error: "Interest rate is required" })
    .positive("Must be greater than 0"),
  recurring: z
    .string()
    .optional()
    .transform((v) => v === "true"),
  recurrenceInterval: z
    .nativeEnum(RecurrenceInterval)
    .optional()
    .nullable()
    .default(null),
  recurrenceAmount: z.coerce.number().optional().nullable().default(null),
  compounding: z.nativeEnum(InvestmentCompounding).default("ANNUAL"),
  status: z.nativeEnum(InvestmentStatus).default("ACTIVE"),
  notes: z.string().optional().nullable(),
});

export type InvestmentFormValues = z.infer<typeof investmentSchema>;
