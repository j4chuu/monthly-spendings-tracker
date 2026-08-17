import { z } from "zod";
import { idSchema, monthSchema, moneySchema, yearSchema } from "@/lib/schemas/common";

export const createBudgetSchema = z.object({
  month: monthSchema,
  year: yearSchema,
  totalAmount: moneySchema,
});

export const getBudgetByMonthSchema = z.object({
  month: monthSchema,
  year: yearSchema,
});

export const updateBudgetSchema = z.object({
  id: idSchema,
  totalAmount: moneySchema,
});
