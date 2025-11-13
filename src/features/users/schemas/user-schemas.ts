import { z } from "zod";

export const getUserByUsernameSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username is too short")
    .max(50, "Username is too long")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can include letters, numbers, underscores, and dashes"),
});

export type GetUserByUsernameSchema = z.infer<typeof getUserByUsernameSchema>;
