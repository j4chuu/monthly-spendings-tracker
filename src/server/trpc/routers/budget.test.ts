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

describe("budget.create", () => {
  it("rejects a second budget for the same month and session", async () => {
    const create = vi.fn();
    const caller = createCallerWithPrisma({
      budget: {
        findUnique: vi.fn().mockResolvedValue({ id: "existing" }),
        create,
      },
    });

    await expect(
      caller.budget.create({ month: 8, year: 2026, totalAmount: 4000 }),
    ).rejects.toMatchObject({
      code: "CONFLICT",
    } satisfies Partial<TRPCError>);

    expect(create).not.toHaveBeenCalled();
  });

  it("creates a budget when the month is still free", async () => {
    const create = vi.fn().mockResolvedValue({
      id: "budget_1",
      sessionId: SESSION_ID,
      month: 8,
      year: 2026,
      totalAmount: new Prisma.Decimal("4000"),
      createdAt: new Date("2026-08-01"),
      updatedAt: new Date("2026-08-01"),
      categories: [],
    });

    const caller = createCallerWithPrisma({
      budget: {
        findUnique: vi.fn().mockResolvedValue(null),
        create,
      },
    });

    const result = await caller.budget.create({
      month: 8,
      year: 2026,
      totalAmount: 4000,
    });

    expect(result).toMatchObject({
      id: "budget_1",
      month: 8,
      year: 2026,
      totalAmount: 4000,
      remaining: 4000,
      categories: [],
    });
    expect(create).toHaveBeenCalledOnce();
  });
});

describe("budget.update", () => {
  it("rejects a total below current category allocations", async () => {
    const update = vi.fn();
    const caller = createCallerWithPrisma({
      budget: {
        findFirst: vi.fn().mockResolvedValue({
          id: "budget_1",
          sessionId: SESSION_ID,
        }),
        update,
      },
      category: {
        aggregate: vi.fn().mockResolvedValue({
          _sum: { allocatedAmount: new Prisma.Decimal("3000") },
        }),
      },
    });

    await expect(
      caller.budget.update({ id: "budget_1", totalAmount: 2500 }),
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
    } satisfies Partial<TRPCError>);

    expect(update).not.toHaveBeenCalled();
  });
});
