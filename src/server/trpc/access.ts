import type { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export async function getOwnedBudget(
  prisma: PrismaClient,
  sessionId: string,
  budgetId: string,
) {
  const budget = await prisma.budget.findFirst({
    where: { id: budgetId, sessionId },
  });

  if (!budget) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Budget not found" });
  }

  return budget;
}

export async function getOwnedCategory(
  prisma: PrismaClient,
  sessionId: string,
  categoryId: string,
) {
  const category = await prisma.category.findFirst({
    where: { id: categoryId, budget: { sessionId } },
    include: { budget: true },
  });

  if (!category) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Category not found" });
  }

  return category;
}
