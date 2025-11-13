import { authRouter } from "@/features/auth/api/auth.router";
import { carsRouter } from "@/features/cars/api/cars.router";
import { feedRouter } from "@/features/feed/api/feed.router";
import { reviewsRouter } from "@/features/reviews/api/reviews.router";
import { socialRouter } from "@/features/social/api/social.router";
import { createTRPCRouter } from "./server";

export const appRouter = createTRPCRouter({
	auth: authRouter,
	reviews: reviewsRouter,
	feed: feedRouter,
	cars: carsRouter,
	social: socialRouter,
});

export type AppRouter = typeof appRouter;
