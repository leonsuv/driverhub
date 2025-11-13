import { createTRPCRouter, publicProcedure } from "@/lib/trpc/server";
import { listReviewsInputSchema } from "@/features/reviews/schemas/review-schemas";
import { getLatestFeed } from "@/features/feed/infrastructure/feed.repository";

export const feedRouter = createTRPCRouter({
  latest: publicProcedure
    .input(listReviewsInputSchema.optional())
    .query(async ({ input }) => {
      const limit = Math.min(Math.max(input?.limit ?? 10, 1), 50);
      const cursor = input?.cursor;

      return getLatestFeed({ limit, cursor });
    }),
});
