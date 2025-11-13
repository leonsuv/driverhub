import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/lib/trpc/server";
import {
  getFollowStatusInputSchema,
  listFollowersInputSchema,
  listFollowingInputSchema,
  toggleFollowInputSchema,
} from "@/features/social/schemas/follow-schemas";
import {
  FollowValidationError,
  isFollowing,
  listFollowers,
  listFollowing,
  toggleFollow,
} from "@/features/social/infrastructure/follow.repository";

export const followsRouter = createTRPCRouter({
  status: publicProcedure.input(getFollowStatusInputSchema).query(async ({ input, ctx }) => {
    if (!ctx.user) return { following: false } as const;
    const following = await isFollowing({ followerId: ctx.user.id, targetUserId: input.targetUserId });
    return { following } as const;
  }),
  followers: publicProcedure.input(listFollowersInputSchema).query(async ({ input }) => {
    const limit = Math.min(Math.max(input.limit ?? 20, 1), 50);
    return listFollowers({ userId: input.userId, limit, cursor: input.cursor });
  }),
  following: publicProcedure.input(listFollowingInputSchema).query(async ({ input }) => {
    const limit = Math.min(Math.max(input.limit ?? 20, 1), 50);
    return listFollowing({ userId: input.userId, limit, cursor: input.cursor });
  }),
  toggle: protectedProcedure.input(toggleFollowInputSchema).mutation(async ({ input, ctx }) => {
    try {
      return await toggleFollow({ followerId: ctx.user.id, targetUserId: input.targetUserId });
    } catch (error) {
      if (error instanceof FollowValidationError) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot follow yourself" });
      }
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
});
