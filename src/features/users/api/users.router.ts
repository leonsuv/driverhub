import { TRPCError } from "@trpc/server";

import { getUserProfileByUsername } from "@/features/users/infrastructure/user.repository";
import { getUserByUsernameSchema, searchUsersInputSchema, updateUserProfileSchema } from "@/features/users/schemas/user-schemas";
import { getUserStats, searchUsers, updateUserProfile } from "@/features/users/infrastructure/user.repository";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/lib/trpc/server";
import { z } from "zod";

export const usersRouter = createTRPCRouter({
  byUsername: publicProcedure.input(getUserByUsernameSchema).query(async ({ input }) => {
    const profile = await getUserProfileByUsername(input.username);

    if (!profile) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    return profile;
  }),
  updateProfile: protectedProcedure.input(updateUserProfileSchema).mutation(async ({ input, ctx }) => {
    const result = await updateUserProfile(ctx.user.id, {
      displayName: input.displayName,
      bio: input.bio,
      avatarUrl: input.avatarUrl,
    });
    return result;
  }),
  stats: publicProcedure.input(z.object({ userId: z.string().min(1) })).query(async ({ input }) => {
    return getUserStats(input.userId);
  }),
  search: publicProcedure.input(searchUsersInputSchema).query(async ({ input }) => {
    const limit = Math.min(Math.max(input.limit ?? 20, 1), 50);
    return searchUsers({ query: input.query, limit, cursor: input.cursor ?? null });
  }),
});
