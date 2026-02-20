import { z } from "zod";
import { BudgetPeriod } from "@prisma/client";

export const budgetSchema = z.object({
  name: z.string().min(1, { error: "Name is required" }),
  categoryId: z.string().optional(),
  amount: z.coerce.number({ error: "Invalid amount" }).positive({ message: "Must be positive" }),
  period: z.nativeEnum(BudgetPeriod).default("MONTHLY"),
  startDate: z.coerce.date({ error: "Invalid date" }),
  endDate: z.coerce.date().optional(),
});

export type BudgetFormValues = z.infer<typeof budgetSchema>;
