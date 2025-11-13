import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/lib/trpc/server";
import {
	createCommentInputSchema,
	deleteCommentInputSchema,
	listCommentsInputSchema,
	updateCommentInputSchema,
 	toggleCommentLikeInputSchema,
} from "@/features/social/schemas/comment-schemas";
import {
	InvalidParentCommentError,
	createCommentForReview,
	CommentNotFoundError,
	CommentPermissionError,
	deleteComment,
	updateComment,
	listCommentsForReview,
	toggleCommentLike,
} from "@/features/social/infrastructure/comment.repository";

export const commentsRouter = createTRPCRouter({
	listByReview: publicProcedure
		.input(listCommentsInputSchema)
		.query(async ({ input, ctx }) => {
			return listCommentsForReview(input.reviewId, ctx.user?.id);
		}),
	create: protectedProcedure
		.input(createCommentInputSchema)
		.mutation(async ({ input, ctx }) => {
			try {
				const comment = await createCommentForReview({
					reviewId: input.reviewId,
					authorId: ctx.user.id,
					content: input.content,
					parentId: input.parentId ?? null,
				});

				return comment;
			} catch (error) {
				if (error instanceof InvalidParentCommentError) {
					throw new TRPCError({
						code: "BAD_REQUEST",
						message: "Unable to reply to the selected comment",
					});
				}

				throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
			}
		}),
	update: protectedProcedure
		.input(updateCommentInputSchema)
		.mutation(async ({ input, ctx }) => {
			try {
				return await updateComment({
					commentId: input.commentId,
					reviewId: input.reviewId,
					authorId: ctx.user.id,
					content: input.content,
				});
			} catch (error) {
				if (error instanceof CommentNotFoundError) {
					throw new TRPCError({ code: "NOT_FOUND", message: "Comment not found" });
				}

				if (error instanceof CommentPermissionError) {
					throw new TRPCError({ code: "FORBIDDEN", message: "You cannot edit this comment" });
				}

				throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
			}
		}),
	delete: protectedProcedure
		.input(deleteCommentInputSchema)
		.mutation(async ({ input, ctx }) => {
			try {
				await deleteComment({
					commentId: input.commentId,
					reviewId: input.reviewId,
					authorId: ctx.user.id,
				});
			} catch (error) {
				if (error instanceof CommentNotFoundError) {
					throw new TRPCError({ code: "NOT_FOUND", message: "Comment not found" });
				}

				if (error instanceof CommentPermissionError) {
					throw new TRPCError({ code: "FORBIDDEN", message: "You cannot delete this comment" });
				}

				throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
			}
		}),
	toggleLike: protectedProcedure
		.input(toggleCommentLikeInputSchema)
		.mutation(async ({ input, ctx }) => {
			try {
				return await toggleCommentLike({
					commentId: input.commentId,
					reviewId: input.reviewId,
					userId: ctx.user.id,
				});
			} catch (error) {
				if (error instanceof CommentNotFoundError) {
					throw new TRPCError({ code: "NOT_FOUND", message: "Comment not found" });
				}

				throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
			}
		}),
});
