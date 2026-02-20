import { z } from "zod";
import { TransactionType, Frequency } from "@prisma/client";

export const recurringSchema = z.object({
  categoryId: z.string().min(1, { error: "Category required" }),
  accountId: z.string().min(1, { error: "Account required" }),
  type: z.nativeEnum(TransactionType),
  amount: z.coerce.number({ error: "Invalid amount" }).positive({ message: "Must be positive" }),
  description: z.string().optional(),
  frequency: z.nativeEnum(Frequency).default("MONTHLY"),
  startDate: z.coerce.date({ error: "Invalid date" }),
  endDate: z.coerce.date().optional(),
});

export type RecurringFormValues = z.infer<typeof recurringSchema>;
