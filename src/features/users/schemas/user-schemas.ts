import { z } from "zod";

export const getUserByUsernameSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username is too short")
    .max(50, "Username is too long")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can include letters, numbers, underscores, and dashes"),
});

export const updateUserProfileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "Display name is required")
    .max(100, "Display name too long"),
  bio: z.string().trim().max(1000, "Bio too long").optional(),
  avatarUrl: z
    .union([
      z.string().url(),
      z
        .string()
        .trim()
        .regex(/^\//, "Invalid URL"),
    ])
    .optional(),
});

export const searchUsersInputSchema = z.object({
  query: z.string().trim().min(2).max(100),
  limit: z.number().int().min(1).max(50).optional(),
  cursor: z.string().optional(),
});

export type GetUserByUsernameSchema = z.infer<typeof getUserByUsernameSchema>;
export type UpdateUserProfileSchema = z.infer<typeof updateUserProfileSchema>;
export type SearchUsersInputSchema = z.infer<typeof searchUsersInputSchema>;
