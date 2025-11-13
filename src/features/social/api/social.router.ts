import { createTRPCRouter } from "@/lib/trpc/server";
import { commentsRouter } from "@/features/social/api/comments.router";

export const socialRouter = createTRPCRouter({
	comments: commentsRouter,
});
