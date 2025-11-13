"use client";

import { useCallback } from "react";
import { Bookmark } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useReviewBookmark } from "@/features/reviews/hooks/use-review-bookmark";

interface ReviewBookmarkButtonProps {
  reviewId: number;
  initialBookmarked?: boolean;
  canBookmark?: boolean;
}

export function ReviewBookmarkButton({
  reviewId,
  initialBookmarked = false,
  canBookmark = true,
}: ReviewBookmarkButtonProps) {
  const { bookmarked, toggle, isPending } = useReviewBookmark({
    reviewId,
    initialBookmarked,
  });

  const handleClick = useCallback(async () => {
    if (!canBookmark) {
      toast.error("Sign in to bookmark reviews.");
      return;
    }
    await toggle();
  }, [canBookmark, toggle]);

  return (
    <Button
      variant={bookmarked ? "secondary" : "outline"}
      size="sm"
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={bookmarked}
    >
      <Bookmark className="mr-2 h-4 w-4" fill={bookmarked ? "currentColor" : "none"} />
      {bookmarked ? "Bookmarked" : "Bookmark"}
    </Button>
  );
}
