import { describe, expect, it } from "vitest";
import { createBudgetSchema } from "@/lib/schemas/budget";
import { createCategorySchema } from "@/lib/schemas/category";
import { moneySchema } from "@/lib/schemas/common";
import { createExpenseSchema } from "@/lib/schemas/expense";

describe("moneySchema", () => {
  it("accepts positive amounts", () => {
    expect(moneySchema.parse(12.5)).toBe(12.5);
  });

  it("rejects zero and negative amounts", () => {
    expect(moneySchema.safeParse(0).success).toBe(false);
    expect(moneySchema.safeParse(-1).success).toBe(false);
  });
});

describe("createBudgetSchema", () => {
  it("accepts a valid month, year and amount", () => {
    expect(
      createBudgetSchema.parse({
        month: 8,
        year: 2026,
        totalAmount: 4000,
      }),
    ).toEqual({
      month: 8,
      year: 2026,
      totalAmount: 4000,
    });
  });

  it("rejects month outside 1-12", () => {
    expect(
      createBudgetSchema.safeParse({
        month: 13,
        year: 2026,
        totalAmount: 4000,
      }).success,
    ).toBe(false);
  });
});

describe("createCategorySchema", () => {
  it("requires a hex color", () => {
    expect(
      createCategorySchema.safeParse({
        budgetId: "budget_1",
        name: "Food",
        allocatedAmount: 200,
        color: "green",
      }).success,
    ).toBe(false);
  });
});

describe("createExpenseSchema", () => {
  it("turns an empty description into undefined", () => {
    const parsed = createExpenseSchema.parse({
      categoryId: "cat_1",
      amount: 20,
      description: "   ",
      date: "2026-08-17",
    });

    expect(parsed.description).toBeUndefined();
    expect(parsed.date).toBeInstanceOf(Date);
  });
});
