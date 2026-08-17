import { createTRPCRouter, publicProcedure } from "@/server/trpc/init";
import { budgetRouter } from "@/server/trpc/routers/budget";
import { categoryRouter } from "@/server/trpc/routers/category";
import { expenseRouter } from "@/server/trpc/routers/expense";

export const appRouter = createTRPCRouter({
  health: publicProcedure.query(({ ctx }) => ({
    ok: true as const,
    sessionId: ctx.sessionId,
  })),
  budget: budgetRouter,
  category: categoryRouter,
  expense: expenseRouter,
});

export type AppRouter = typeof appRouter;
