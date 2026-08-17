import { createTRPCRouter, publicProcedure } from "@/server/trpc/init";

export const appRouter = createTRPCRouter({
  health: publicProcedure.query(({ ctx }) => ({
    ok: true as const,
    sessionId: ctx.sessionId,
  })),
});

export type AppRouter = typeof appRouter;
