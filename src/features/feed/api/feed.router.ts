import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/lib/trpc/server";
import { listReviewsInputSchema } from "@/features/reviews/schemas/review-schemas";
import { getLatestFeed, getPersonalizedFeed, getTrendingFeed } from "@/features/feed/infrastructure/feed.repository";

export const feedRouter = createTRPCRouter({
	latest: publicProcedure
		.input(listReviewsInputSchema.optional())
		.query(async ({ input, ctx }) => {
			const limit = Math.min(Math.max(input?.limit ?? 10, 1), 50);
			const cursor = input?.cursor;

			return getLatestFeed({ limit, cursor, currentUserId: ctx.user?.id });
		}),
	personalized: protectedProcedure
		.input(listReviewsInputSchema.optional())
		.query(async ({ input, ctx }) => {
			const limit = Math.min(Math.max(input?.limit ?? 10, 1), 50);
			const cursor = input?.cursor;

			return getPersonalizedFeed({ limit, cursor, currentUserId: ctx.user.id });
		}),
	trending: publicProcedure
		.input(listReviewsInputSchema.optional())
		.query(async ({ input, ctx }) => {
			const limit = Math.min(Math.max(input?.limit ?? 10, 1), 50);
			const cursor = input?.cursor;

			return getTrendingFeed({ limit, cursor, currentUserId: ctx.user?.id });
		}),
});
