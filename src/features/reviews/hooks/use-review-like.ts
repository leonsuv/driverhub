"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { trpc } from "@/lib/trpc/client";

interface UseReviewLikeOptions {
	reviewId: number;
	initialLiked: boolean;
	initialLikeCount: number;
}

interface UseReviewLikeResult {
	liked: boolean;
	likeCount: number;
	toggle: () => Promise<void>;
	isPending: boolean;
}

export function useReviewLike({
	reviewId,
	initialLiked,
	initialLikeCount,
}: UseReviewLikeOptions): UseReviewLikeResult {
	const utils = trpc.useUtils();
	const [liked, setLiked] = useState(initialLiked);
	const [likeCount, setLikeCount] = useState(initialLikeCount);

	const mutation = trpc.reviews.toggleLike.useMutation({
		onSuccess: async () => {
			await Promise.all([
				utils.reviews.getById.invalidate({ id: reviewId }),
				utils.feed.latest.invalidate(),
			]);
		},
	});

	useEffect(() => {
		setLiked(initialLiked);
	}, [initialLiked]);

	useEffect(() => {
		setLikeCount(initialLikeCount);
	}, [initialLikeCount]);

	const toggle = useCallback(async () => {
		if (mutation.isPending) {
			return;
		}

		const previousLiked = liked;
		const previousCount = likeCount;
		const optimisticLiked = !previousLiked;
		const optimisticCount = Math.max(0, previousCount + (optimisticLiked ? 1 : -1));

		setLiked(optimisticLiked);
		setLikeCount(optimisticCount);

		try {
			const result = await mutation.mutateAsync({ reviewId });
			setLiked(result.liked);
			setLikeCount(result.likeCount);
		} catch (error) {
			setLiked(previousLiked);
			setLikeCount(previousCount);
			if (error instanceof Error && error.message) {
				toast.error(error.message);
			} else {
				toast.error("We couldn't update your like. Please try again.");
			}
		}
	}, [likeCount, liked, mutation, reviewId]);

	return {
		liked,
		likeCount,
		toggle,
		isPending: mutation.isPending,
	};
}
