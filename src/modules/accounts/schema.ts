import { z } from "zod";
import { AccountType } from "@prisma/client";

export const accountSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  type: z.nativeEnum(AccountType),
  balance: z.coerce.number({ error: "Invalid amount" }),
  color: z.string().optional(),
  icon: z.string().optional(),
});

export type AccountFormData = z.infer<typeof accountSchema>;
