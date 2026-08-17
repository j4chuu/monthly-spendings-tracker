import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { createBudgetSchema, getBudgetByMonthSchema, updateBudgetSchema } from "@/lib/schemas/budget";
import { canSetBudgetTotal } from "@/lib/budget-rules";
import { getOwnedBudget } from "@/server/trpc/access";
import { decimalToNumber, numberToDecimal } from "@/server/trpc/money";
import { createTRPCRouter, publicProcedure } from "@/server/trpc/init";

function toDashboard(
  budget: Prisma.BudgetGetPayload<{
    include: { categories: { include: { expenses: true } } };
  }>,
) {
  const categories = budget.categories.map((category) => {
    const spentAmount = category.expenses.reduce(
      (sum, expense) => sum + decimalToNumber(expense.amount),
      0,
    );

    return {
      id: category.id,
      name: category.name,
      color: category.color,
      allocatedAmount: decimalToNumber(category.allocatedAmount),
      spentAmount: Number(spentAmount.toFixed(2)),
      expenses: category.expenses
        .slice()
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .map((expense) => ({
          id: expense.id,
          amount: decimalToNumber(expense.amount),
          description: expense.description,
          date: expense.date,
        })),
    };
  });

  const totalAmount = decimalToNumber(budget.totalAmount);
  const totalAllocated = Number(
    categories
      .reduce((sum, category) => sum + category.allocatedAmount, 0)
      .toFixed(2),
  );
  const totalSpent = Number(
    categories.reduce((sum, category) => sum + category.spentAmount, 0).toFixed(2),
  );

  return {
    id: budget.id,
    month: budget.month,
    year: budget.year,
    totalAmount,
    totalAllocated,
    totalSpent,
    remaining: Number((totalAmount - totalSpent).toFixed(2)),
    unallocated: Number((totalAmount - totalAllocated).toFixed(2)),
    categories,
  };
}

export const budgetRouter = createTRPCRouter({
  getByMonth: publicProcedure
    .input(getBudgetByMonthSchema)
    .query(async ({ ctx, input }) => {
      const budget = await ctx.prisma.budget.findUnique({
        where: {
          sessionId_month_year: {
            sessionId: ctx.sessionId,
            month: input.month,
            year: input.year,
          },
        },
        include: {
          categories: {
            include: { expenses: true },
            orderBy: { createdAt: "asc" },
          },
        },
      });

      return budget ? toDashboard(budget) : null;
    }),

  create: publicProcedure
    .input(createBudgetSchema)
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.prisma.budget.findUnique({
        where: {
          sessionId_month_year: {
            sessionId: ctx.sessionId,
            month: input.month,
            year: input.year,
          },
        },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "A budget for this month already exists",
        });
      }

      try {
        const budget = await ctx.prisma.budget.create({
          data: {
            sessionId: ctx.sessionId,
            month: input.month,
            year: input.year,
            totalAmount: numberToDecimal(input.totalAmount),
          },
          include: {
            categories: {
              include: { expenses: true },
            },
          },
        });

        return toDashboard(budget);
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "A budget for this month already exists",
          });
        }

        throw error;
      }
    }),

  update: publicProcedure
    .input(updateBudgetSchema)
    .mutation(async ({ ctx, input }) => {
      const budget = await getOwnedBudget(ctx.prisma, ctx.sessionId, input.id);

      const allocated = await ctx.prisma.category.aggregate({
        where: { budgetId: budget.id },
        _sum: { allocatedAmount: true },
      });

      const currentlyAllocated = allocated._sum.allocatedAmount
        ? decimalToNumber(allocated._sum.allocatedAmount)
        : 0;

      if (
        !canSetBudgetTotal({
          totalAmount: input.totalAmount,
          currentlyAllocated,
        })
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Budget total cannot be lower than category allocations",
        });
      }

      const updated = await ctx.prisma.budget.update({
        where: { id: budget.id },
        data: { totalAmount: numberToDecimal(input.totalAmount) },
      });

      return {
        id: updated.id,
        totalAmount: decimalToNumber(updated.totalAmount),
      };
    }),
});
