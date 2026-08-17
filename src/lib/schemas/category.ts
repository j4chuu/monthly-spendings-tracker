import { z } from "zod";
import { idSchema, moneySchema } from "@/lib/schemas/common";

export const colorSchema = z
  .string()
  .regex(/^#([0-9a-fA-F]{6})$/, {
    error: "Color must be a hex value like #22c55e",
  });

export const createCategorySchema = z.object({
  budgetId: idSchema,
  name: z.string().trim().min(1).max(50),
  allocatedAmount: moneySchema,
  color: colorSchema,
});
