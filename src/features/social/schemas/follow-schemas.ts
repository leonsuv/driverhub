import { z } from "zod";

export const toggleFollowInputSchema = z.object({
  targetUserId: z.string().min(1),
});

export const getFollowStatusInputSchema = z.object({
  targetUserId: z.string().min(1),
});

export const listFollowersInputSchema = z.object({
  userId: z.string().min(1),
  limit: z.number().int().min(1).max(50).optional(),
  cursor: z.string().optional(),
});

export const listFollowingInputSchema = z.object({
  userId: z.string().min(1),
  limit: z.number().int().min(1).max(50).optional(),
  cursor: z.string().optional(),
});

export type ToggleFollowInputSchema = z.infer<typeof toggleFollowInputSchema>;
export type GetFollowStatusInputSchema = z.infer<typeof getFollowStatusInputSchema>;
export type ListFollowersInputSchema = z.infer<typeof listFollowersInputSchema>;
export type ListFollowingInputSchema = z.infer<typeof listFollowingInputSchema>;
