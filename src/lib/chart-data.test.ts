import { describe, expect, it } from "vitest";
import { getExpenseBreakdown } from "@/lib/chart-data";

describe("getExpenseBreakdown", () => {
  it("keeps only categories that already have spending", () => {
    expect(
      getExpenseBreakdown([
        { name: "Food", color: "#22c55e", spentAmount: 120 },
        { name: "Rent", color: "#3b82f6", spentAmount: 0 },
      ]),
    ).toEqual([{ name: "Food", value: 120, color: "#22c55e" }]);
  });
});
