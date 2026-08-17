import { z } from "zod";
import { idSchema, moneySchema } from "@/lib/schemas/common";

export const createExpenseSchema = z.object({
  categoryId: idSchema,
  amount: moneySchema,
  description: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((value) => value || undefined),
  date: z.coerce.date(),
});
