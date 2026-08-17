import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { SESSION_HEADER, sessionIdSchema } from "@/lib/session";
import { prisma } from "@/server/db";

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const parsed = sessionIdSchema.safeParse(opts.headers.get(SESSION_HEADER));

  if (!parsed.success) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Missing or invalid x-session-id header",
    });
  }

  return {
    prisma,
    sessionId: parsed.data,
  };
};

const t = initTRPC
  .context<Awaited<ReturnType<typeof createTRPCContext>>>()
  .create({
    transformer: superjson,
  });

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure;
