import { initTRPC, TRPCError } from "@trpc/server";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth/config";

export async function createTRPCContext(opts: FetchCreateContextFnOptions) {
  const session = await auth();

  return {
    db,
    session,
    user: session?.user ?? null,
    req: opts.req,
    resHeaders: opts.resHeaders,
  };
}

const t = initTRPC.context<Awaited<ReturnType<typeof createTRPCContext>>>().create();

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
      user: ctx.session.user,
    },
  });
});
