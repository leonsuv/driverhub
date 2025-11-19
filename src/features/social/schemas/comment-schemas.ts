import { z } from "zod";

export const commentContentSchema = z.object({
	content: z
		.string()
		.trim()
		.min(1, "Please enter a comment before submitting")
		.max(2000, "Comments are limited to 2000 characters"),
});

export const listCommentsInputSchema = z.object({
	reviewId: z.number().int().positive(),
});

export const createCommentInputSchema = commentContentSchema.extend({
	reviewId: z.number().int().positive(),
	parentId: z.number().int().positive().optional().nullable(),
});

export const updateCommentInputSchema = commentContentSchema.extend({
	commentId: z.number().int().positive(),
	reviewId: z.number().int().positive(),
});

export const deleteCommentInputSchema = z.object({
	commentId: z.number().int().positive(),
	reviewId: z.number().int().positive(),
});

export const toggleCommentLikeInputSchema = z.object({
	commentId: z.number().int().positive(),
	reviewId: z.number().int().positive(),
});

export const listUserLikedCommentsInputSchema = z.object({
  userId: z.string().min(1),
  limit: z.number().int().positive().max(50).optional(),
  cursor: z.string().optional().nullable(),
});

export type CommentContentInput = z.infer<typeof commentContentSchema>;
export type ListCommentsInputSchema = z.infer<typeof listCommentsInputSchema>;
export type CreateCommentInputSchema = z.infer<typeof createCommentInputSchema>;
export type UpdateCommentInputSchema = z.infer<typeof updateCommentInputSchema>;
export type DeleteCommentInputSchema = z.infer<typeof deleteCommentInputSchema>;
export type ToggleCommentLikeInputSchema = z.infer<typeof toggleCommentLikeInputSchema>;
export type ListUserLikedCommentsInputSchema = z.infer<typeof listUserLikedCommentsInputSchema>;

