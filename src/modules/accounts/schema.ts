import { z } from "zod";
import { AccountType } from "@prisma/client";
import { BANK_KEYS } from "./constants";

export const accountSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  type: z.nativeEnum(AccountType),
  balance: z.coerce.number({ error: "Invalid amount" }),
  color: z.string().optional(),
  icon: z.string().optional(),
  isDefault: z.boolean().default(false),
  bankKey: z.enum(BANK_KEYS).optional(),
  bankName: z.string().max(50).optional(),
});

export type AccountFormData = z.infer<typeof accountSchema>;
