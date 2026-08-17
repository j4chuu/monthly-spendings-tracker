import { z } from "zod";

export const moneySchema = z
  .number()
  .finite()
  .gt(0, { error: "Amount must be greater than 0" });

export const monthSchema = z.int().min(1).max(12);
export const yearSchema = z.int().min(2000).max(2100);
export const idSchema = z.string().min(1);
