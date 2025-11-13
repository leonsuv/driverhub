import { TRPCError } from "@trpc/server";

import { getUserProfileByUsername } from "@/features/users/infrastructure/user.repository";
import { getUserByUsernameSchema } from "@/features/users/schemas/user-schemas";
import { createTRPCRouter, publicProcedure } from "@/lib/trpc/server";

export const usersRouter = createTRPCRouter({
  byUsername: publicProcedure.input(getUserByUsernameSchema).query(async ({ input }) => {
    const profile = await getUserProfileByUsername(input.username);

    if (!profile) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }

    return profile;
  }),
});
