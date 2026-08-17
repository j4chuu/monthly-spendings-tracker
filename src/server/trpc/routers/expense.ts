import { createExpenseSchema } from "@/lib/schemas/expense";
import { getOwnedCategory } from "@/server/trpc/access";
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
});
