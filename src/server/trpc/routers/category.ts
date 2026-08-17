import { TRPCError } from "@trpc/server";
import { canAllocate } from "@/lib/budget-rules";
import { createCategorySchema, updateCategorySchema } from "@/lib/schemas/category";
import { getOwnedBudget, getOwnedCategory } from "@/server/trpc/access";
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

  update: publicProcedure
    .input(updateCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const category = await getOwnedCategory(
        ctx.prisma,
        ctx.sessionId,
        input.id,
      );

      const allocated = await ctx.prisma.category.aggregate({
        where: { budgetId: category.budgetId },
        _sum: { allocatedAmount: true },
      });

      const currentlyAllocated = allocated._sum.allocatedAmount
        ? decimalToNumber(allocated._sum.allocatedAmount)
        : 0;
      const allocatedWithoutThis = Number(
        (currentlyAllocated - decimalToNumber(category.allocatedAmount)).toFixed(
          2,
        ),
      );

      if (
        !canAllocate({
          budgetTotal: decimalToNumber(category.budget.totalAmount),
          currentlyAllocated: allocatedWithoutThis,
          additionalAmount: input.allocatedAmount,
        })
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Category allocations cannot exceed the budget total",
        });
      }

      const updated = await ctx.prisma.category.update({
        where: { id: category.id },
        data: {
          name: input.name,
          allocatedAmount: numberToDecimal(input.allocatedAmount),
          color: input.color,
        },
      });

      return {
        id: updated.id,
        budgetId: updated.budgetId,
        name: updated.name,
        allocatedAmount: decimalToNumber(updated.allocatedAmount),
        color: updated.color,
      };
    }),
});
