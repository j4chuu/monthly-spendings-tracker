import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { describe, expect, it, vi } from "vitest";
import { createCallerFactory } from "@/server/trpc/init";
import { appRouter } from "@/server/trpc/router";

const SESSION_ID = "550e8400-e29b-41d4-a716-446655440000";
const createCaller = createCallerFactory(appRouter);

function createCallerWithPrisma(prisma: object) {
  return createCaller({
    prisma: prisma as never,
    sessionId: SESSION_ID,
  });
}

describe("category.create", () => {
  it("rejects when allocated amounts would exceed the budget total", async () => {
    const caller = createCallerWithPrisma({
      budget: {
        findFirst: vi.fn().mockResolvedValue({
          id: "budget_1",
          sessionId: SESSION_ID,
          totalAmount: new Prisma.Decimal("1000"),
        }),
      },
      category: {
        aggregate: vi.fn().mockResolvedValue({
          _sum: { allocatedAmount: new Prisma.Decimal("800") },
        }),
        create: vi.fn(),
      },
    });

    await expect(
      caller.category.create({
        budgetId: "budget_1",
        name: "Food",
        allocatedAmount: 250,
        color: "#22c55e",
      }),
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: "Category allocations cannot exceed the budget total",
    } satisfies Partial<TRPCError>);
  });

  it("creates a category when there is still room in the budget", async () => {
    const create = vi.fn().mockResolvedValue({
      id: "cat_1",
      budgetId: "budget_1",
      name: "Food",
      allocatedAmount: new Prisma.Decimal("200"),
      color: "#22c55e",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const caller = createCallerWithPrisma({
      budget: {
        findFirst: vi.fn().mockResolvedValue({
          id: "budget_1",
          sessionId: SESSION_ID,
          totalAmount: new Prisma.Decimal("1000"),
        }),
      },
      category: {
        aggregate: vi.fn().mockResolvedValue({
          _sum: { allocatedAmount: new Prisma.Decimal("800") },
        }),
        create,
      },
    });

    const result = await caller.category.create({
      budgetId: "budget_1",
      name: "Food",
      allocatedAmount: 200,
      color: "#22c55e",
    });

    expect(result).toEqual({
      id: "cat_1",
      budgetId: "budget_1",
      name: "Food",
      allocatedAmount: 200,
      color: "#22c55e",
    });
    expect(create).toHaveBeenCalledOnce();
  });
});

describe("category.update", () => {
  it("allows raising an allocation using the category's own previous amount", async () => {
    const update = vi.fn().mockResolvedValue({
      id: "cat_1",
      budgetId: "budget_1",
      name: "Food",
      allocatedAmount: new Prisma.Decimal("900"),
      color: "#22c55e",
    });

    const caller = createCallerWithPrisma({
      category: {
        findFirst: vi.fn().mockResolvedValue({
          id: "cat_1",
          budgetId: "budget_1",
          allocatedAmount: new Prisma.Decimal("800"),
          budget: { totalAmount: new Prisma.Decimal("1000") },
        }),
        aggregate: vi.fn().mockResolvedValue({
          _sum: { allocatedAmount: new Prisma.Decimal("800") },
        }),
        update,
      },
    });

    const result = await caller.category.update({
      id: "cat_1",
      name: "Food",
      allocatedAmount: 900,
      color: "#22c55e",
    });

    expect(result.allocatedAmount).toBe(900);
    expect(update).toHaveBeenCalledOnce();
  });
});
