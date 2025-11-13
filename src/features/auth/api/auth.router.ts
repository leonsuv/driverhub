import { TRPCError } from "@trpc/server";

import { createTRPCRouter, publicProcedure } from "@/lib/trpc/server";
import { registerSchema } from "@/features/auth/schemas/register-schema";
import { hashPassword } from "@/features/auth/domain/password.service";
import {
  createUser,
  findUserByEmail,
  findUserByUsername,
} from "@/features/auth/infrastructure/user.repository";

export const authRouter = createTRPCRouter({
  register: publicProcedure.input(registerSchema).mutation(async ({ input }) => {
    const [emailExists, usernameExists] = await Promise.all([
      findUserByEmail(input.email),
      findUserByUsername(input.username),
    ]);

    if (emailExists) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Email is already in use",
      });
    }

    if (usernameExists) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Username is already taken",
      });
    }

    const passwordHash = await hashPassword(input.password);

    const user = await createUser({
      email: input.email,
      username: input.username,
      passwordHash,
      displayName: input.displayName,
    });

    if (!user) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Unable to create user",
      });
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
      },
    };
  }),
});
