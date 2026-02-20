import { z } from "zod";
import { TransactionType, TransactionStatus, Frequency } from "@prisma/client";

export const transactionSchema = z.object({
  accountId: z.string().min(1, "Account is required"),
  categoryId: z.string().min(1, "Category is required"),
  type: z.nativeEnum(TransactionType),
  amount: z.coerce.number({ error: "Amount is required" }).positive("Must be greater than 0"),
  description: z.string().optional(),
  date: z.coerce.date({ error: "Date is required" }),
  status: z.nativeEnum(TransactionStatus).default("PAID"),
  isRecurring: z
    .string()
    .optional()
    .transform((v) => v === "true"),
  frequency: z
    .nativeEnum(Frequency)
    .optional()
    .nullable()
    .default(null),
  recurrenceEnd: z.coerce.date().optional().nullable().default(null),
  parentTransactionId: z.string().optional().nullable().default(null),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;

