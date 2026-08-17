import { describe, expect, it } from "vitest";
import { canAllocate } from "@/lib/budget-rules";

describe("canAllocate", () => {
  it("allows allocations that fit in the remaining budget", () => {
    expect(
      canAllocate({
        budgetTotal: 1000,
        currentlyAllocated: 400,
        additionalAmount: 600,
      }),
    ).toBe(true);
  });

  it("rejects allocations that exceed the budget total", () => {
    expect(
      canAllocate({
        budgetTotal: 1000,
        currentlyAllocated: 400,
        additionalAmount: 600.01,
      }),
    ).toBe(false);
  });

  it("compares money in cents so 0.1 + 0.2 does not overflow", () => {
    expect(
      canAllocate({
        budgetTotal: 0.3,
        currentlyAllocated: 0.1,
        additionalAmount: 0.2,
      }),
    ).toBe(true);
  });
});
