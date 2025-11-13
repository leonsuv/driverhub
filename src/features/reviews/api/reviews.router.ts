import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/lib/trpc/server";
import {
  createReviewSchema,
  getReviewByIdSchema,
  listReviewsInputSchema,
} from "@/features/reviews/schemas/review-schemas";
import {
  createReview,
  getPublishedReviewById,
  listLatestPublishedReviews,
} from "@/features/reviews/infrastructure/review.repository";

export const reviewsRouter = createTRPCRouter({
  listLatest: publicProcedure
    .input(listReviewsInputSchema.optional())
    .query(async ({ input }) => {
      const limit = Math.min(Math.max(input?.limit ?? 10, 1), 50);
      const cursor = input?.cursor;

      const data = await listLatestPublishedReviews({ limit, cursor });
      return data;
    }),
  getById: publicProcedure.input(getReviewByIdSchema).query(async ({ input }) => {
    const review = await getPublishedReviewById(input.id);

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
});
