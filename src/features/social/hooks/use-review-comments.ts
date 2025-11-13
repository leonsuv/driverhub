import { trpc } from "@/lib/trpc/client";

export function useReviewComments(reviewId: number, enabled = true) {
	return trpc.social.comments.listByReview.useQuery(
		{ reviewId },
		{ enabled: enabled && reviewId > 0 },
	);
}
