import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/lib/trpc/server";
import {
  createReviewSchema,
  deleteReviewSchema,
  getReviewByIdSchema,
  listReviewsInputSchema,
  listUserLikedReviewsInputSchema,
  listUserBookmarkedReviewsInputSchema,
  toggleReviewLikeInputSchema,
  toggleReviewBookmarkInputSchema,
  updateReviewSchema,
  updateReviewStatusSchema,
  createDraftSchema,
  updateDraftSchema,
  getDraftByIdSchema,
  discardDraftSchema,
  publishDraftSchema,
} from "@/features/reviews/schemas/review-schemas";
import {
  createReview,
  deleteReview,
  getPublishedReviewById,
  incrementReviewViewCount,
  listLatestPublishedReviews,
  listUserLikedReviews,
  listUserBookmarkedReviews,
  listReviews,
  toggleReviewLike,
  toggleReviewBookmark,
  updateReview,
  updateReviewStatus,
  createDraft,
  getDraftByIdForAuthor,
  updateDraft,
  publishDraft,
  discardDraft,
  ReviewNotFoundError,
  ReviewPermissionError,
} from "@/features/reviews/infrastructure/review.repository";

export const reviewsRouter = createTRPCRouter({
  list: publicProcedure
    .input(listReviewsInputSchema.optional())
    .query(async ({ input, ctx }) => {
      const limit = Math.min(Math.max(input?.limit ?? 20, 1), 50);
      const cursor = input?.cursor;
      const statusFilter = input?.status;
      const statuses = Array.isArray(statusFilter)
        ? statusFilter
        : statusFilter
          ? [statusFilter]
          : [];
      const includesNonPublished = statuses.some((status) => status !== "published");

      if (includesNonPublished) {
        if (!ctx.user) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Authentication required" });
        }

        if (!input?.authorId || input.authorId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You can only view drafts for your own reviews",
          });
        }
      }

      return listReviews({
        limit,
        cursor,
        currentUserId: ctx.user?.id,
        filters: input
          ? {
              authorId: input.authorId,
              carId: input.carId,
              status: input.status,
              query: input.query,
            }
          : undefined,
      });
    }),
  listLatest: publicProcedure
    .input(listReviewsInputSchema.optional())
    .query(async ({ input, ctx }) => {
      const limit = Math.min(Math.max(input?.limit ?? 10, 1), 50);
      const cursor = input?.cursor;

      const data = await listLatestPublishedReviews({
        limit,
        cursor,
        currentUserId: ctx.user?.id,
      });
      return data;
    }),
  userLiked: publicProcedure
    .input(listUserLikedReviewsInputSchema)
    .query(async ({ input, ctx }) => {
      const limit = Math.min(Math.max(input.limit ?? 20, 1), 50);
      return listUserLikedReviews({
        userId: input.userId,
        limit,
        cursor: input.cursor ?? null,
        currentUserId: ctx.user?.id ?? null,
      });
    }),
  userBookmarked: protectedProcedure
    .input(listUserBookmarkedReviewsInputSchema)
    .query(async ({ input, ctx }) => {
      const limit = Math.min(Math.max(input.limit ?? 20, 1), 50);
      // Only allow reading your own bookmarks for now
      if (input.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return listUserBookmarkedReviews({
        userId: input.userId,
        limit,
        cursor: input.cursor ?? null,
        currentUserId: ctx.user.id,
      });
    }),
  toggleBookmark: protectedProcedure
    .input(toggleReviewBookmarkInputSchema)
    .mutation(async ({ input, ctx }) => {
      return toggleReviewBookmark({ reviewId: input.reviewId, userId: ctx.user.id });
    }),
  getById: publicProcedure.input(getReviewByIdSchema).query(async ({ input, ctx }) => {
    const review = await getPublishedReviewById(input.id, ctx.user?.id);

    if (!review) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Review not found" });
    }

    return review;
  }),
  create: protectedProcedure.input(createReviewSchema).mutation(async ({ input, ctx }) => {
    const review = await createReview({
      ...input,
      authorId: ctx.user.id,
    });

    return {
      reviewId: review.id,
    };
  }),
  update: protectedProcedure.input(updateReviewSchema).mutation(async ({ input, ctx }) => {
    try {
      return await updateReview({
        ...input,
        authorId: ctx.user.id,
      });
    } catch (error) {
      if (error instanceof ReviewNotFoundError) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Review not found" });
      }

      if (error instanceof ReviewPermissionError) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You cannot edit this review" });
      }

      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  updateStatus: protectedProcedure
    .input(updateReviewStatusSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        return await updateReviewStatus({
          reviewId: input.reviewId,
          status: input.status,
          authorId: ctx.user.id,
        });
      } catch (error) {
        if (error instanceof ReviewNotFoundError) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Review not found" });
        }

        if (error instanceof ReviewPermissionError) {
          throw new TRPCError({ code: "FORBIDDEN", message: "You cannot edit this review" });
        }

        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  delete: protectedProcedure.input(deleteReviewSchema).mutation(async ({ input, ctx }) => {
    try {
      return await deleteReview({
        reviewId: input.reviewId,
        authorId: ctx.user.id,
      });
    } catch (error) {
      if (error instanceof ReviewNotFoundError) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Review not found" });
      }

      if (error instanceof ReviewPermissionError) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You cannot delete this review" });
      }

      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  incrementView: publicProcedure.input(getReviewByIdSchema).mutation(async ({ input }) => {
    try {
      return await incrementReviewViewCount(input.id);
    } catch (error) {
      if (error instanceof ReviewNotFoundError) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Review not found" });
      }

      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  toggleLike: protectedProcedure
    .input(toggleReviewLikeInputSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        return await toggleReviewLike({
          reviewId: input.reviewId,
          userId: ctx.user.id,
        });
      } catch (error) {
        if (error instanceof ReviewNotFoundError) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Review not found" });
        }

        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  // Drafts
  createDraft: protectedProcedure.input(createDraftSchema).mutation(async ({ input, ctx }) => {
    const draft = await createDraft({ authorId: ctx.user.id, carId: input.carId, title: input.title ?? null });
    return { reviewId: draft.id } as const;
  }),
  getDraft: protectedProcedure.input(getDraftByIdSchema).query(async ({ input, ctx }) => {
    try {
      const draft = await getDraftByIdForAuthor(input.id, ctx.user.id);
      return draft;
    } catch (error) {
      if (error instanceof ReviewNotFoundError) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Draft not found" });
      }
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  updateDraft: protectedProcedure.input(updateDraftSchema).mutation(async ({ input, ctx }) => {
    try {
      return await updateDraft({ authorId: ctx.user.id, ...input });
    } catch (error) {
      if (error instanceof ReviewNotFoundError) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Draft not found" });
      }
      if (error instanceof ReviewPermissionError) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You cannot edit this draft" });
      }
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  publishDraft: protectedProcedure.input(publishDraftSchema).mutation(async ({ input, ctx }) => {
    try {
      return await publishDraft({ reviewId: input.reviewId, authorId: ctx.user.id });
    } catch (error) {
      if (error instanceof ReviewNotFoundError) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Draft not found" });
      }
      if (error instanceof ReviewPermissionError) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You cannot publish this draft" });
      }
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  discardDraft: protectedProcedure.input(discardDraftSchema).mutation(async ({ input, ctx }) => {
    try {
      return await discardDraft({ reviewId: input.reviewId, authorId: ctx.user.id });
    } catch (error) {
      if (error instanceof ReviewNotFoundError) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Draft not found" });
      }
      if (error instanceof ReviewPermissionError) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You cannot delete this draft" });
      }
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
});
