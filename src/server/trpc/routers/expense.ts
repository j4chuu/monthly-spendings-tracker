import { createExpenseSchema, updateExpenseSchema } from "@/lib/schemas/expense";
import { getOwnedCategory, getOwnedExpense } from "@/server/trpc/access";
import { decimalToNumber, numberToDecimal } from "@/server/trpc/money";
import { createTRPCRouter, publicProcedure } from "@/server/trpc/init";

export const expenseRouter = createTRPCRouter({
  create: publicProcedure
    .input(createExpenseSchema)
    .mutation(async ({ ctx, input }) => {
      await getOwnedCategory(ctx.prisma, ctx.sessionId, input.categoryId);

      const expense = await ctx.prisma.expense.create({
        data: {
          categoryId: input.categoryId,
          amount: numberToDecimal(input.amount),
          description: input.description,
          date: input.date,
        },
      });

      return {
        id: expense.id,
        categoryId: expense.categoryId,
        amount: decimalToNumber(expense.amount),
        description: expense.description,
        date: expense.date,
      };
    }),

  update: publicProcedure
    .input(updateExpenseSchema)
    .mutation(async ({ ctx, input }) => {
      const existing = await getOwnedExpense(
        ctx.prisma,
        ctx.sessionId,
        input.id,
      );

      const expense = await ctx.prisma.expense.update({
        where: { id: existing.id },
        data: {
          amount: numberToDecimal(input.amount),
          description: input.description ?? null,
          date: input.date,
        },
      });

      return {
        id: expense.id,
        categoryId: expense.categoryId,
        amount: decimalToNumber(expense.amount),
        description: expense.description,
        date: expense.date,
      };
    }),
});
