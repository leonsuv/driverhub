import { createTRPCRouter } from "@/lib/trpc/server";
import { commentsRouter } from "@/features/social/api/comments.router";
import { followsRouter } from "@/features/social/api/follows.router";

export const socialRouter = createTRPCRouter({
	comments: commentsRouter,
	follows: followsRouter,
});
