import { TRPCError } from "@trpc/server";
import { canAllocate } from "@/lib/budget-rules";
import { createCategorySchema } from "@/lib/schemas/category";
import { getOwnedBudget } from "@/server/trpc/access";
import { decimalToNumber, numberToDecimal } from "@/server/trpc/money";
import { createTRPCRouter, publicProcedure } from "@/server/trpc/init";

export const categoryRouter = createTRPCRouter({
  create: publicProcedure
    .input(createCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const budget = await getOwnedBudget(
        ctx.prisma,
        ctx.sessionId,
        input.budgetId,
      );

      const allocated = await ctx.prisma.category.aggregate({
        where: { budgetId: budget.id },
        _sum: { allocatedAmount: true },
      });

      const currentlyAllocated = allocated._sum.allocatedAmount
        ? decimalToNumber(allocated._sum.allocatedAmount)
        : 0;

      if (
        !canAllocate({
          budgetTotal: decimalToNumber(budget.totalAmount),
          currentlyAllocated,
          additionalAmount: input.allocatedAmount,
        })
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Category allocations cannot exceed the budget total",
        });
      }

      const category = await ctx.prisma.category.create({
        data: {
          budgetId: budget.id,
          name: input.name,
          allocatedAmount: numberToDecimal(input.allocatedAmount),
          color: input.color,
        },
      });

      return {
        id: category.id,
        budgetId: category.budgetId,
        name: category.name,
        allocatedAmount: decimalToNumber(category.allocatedAmount),
        color: category.color,
      };
    }),
});
