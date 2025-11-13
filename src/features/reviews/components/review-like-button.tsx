"use client";

import { useCallback } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useReviewLike } from "@/features/reviews/hooks/use-review-like";

interface ReviewLikeButtonProps {
	reviewId: number;
	initialLiked: boolean;
	initialLikeCount: number;
	canLike: boolean;
}

export function ReviewLikeButton({
	reviewId,
	initialLiked,
	initialLikeCount,
	canLike,
}: ReviewLikeButtonProps) {
	const { liked, likeCount, toggle, isPending } = useReviewLike({
		reviewId,
		initialLiked,
		initialLikeCount,
	});

	const handleClick = useCallback(async () => {
		if (!canLike) {
			toast.error("Sign in to like reviews.");
			return;
		}

		await toggle();
	}, [canLike, toggle]);

	return (
		<div className="flex items-center gap-2">
			<Button
				variant={liked ? "secondary" : "outline"}
				size="sm"
				onClick={handleClick}
				disabled={isPending}
				aria-pressed={liked}
			>
				<Heart className="mr-2 h-4 w-4" fill={liked ? "currentColor" : "none"} />
				{liked ? "Liked" : "Like"}
			</Button>
			<span className="text-sm text-muted-foreground">{likeCount}</span>
		</div>
	);
}
