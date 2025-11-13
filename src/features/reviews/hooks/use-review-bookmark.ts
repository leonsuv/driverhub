"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { trpc } from "@/lib/trpc/client";

interface UseReviewBookmarkOptions {
  reviewId: number;
  initialBookmarked: boolean;
}

interface UseReviewBookmarkResult {
  bookmarked: boolean;
  toggle: () => Promise<void>;
  isPending: boolean;
}

export function useReviewBookmark({
  reviewId,
  initialBookmarked,
}: UseReviewBookmarkOptions): UseReviewBookmarkResult {
  const utils = trpc.useUtils();
  const [bookmarked, setBookmarked] = useState(initialBookmarked);

  const mutation = trpc.reviews.toggleBookmark.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.reviews.getById.invalidate({ id: reviewId }),
        utils.feed.latest.invalidate(),
      ]);
    },
  });

  useEffect(() => {
    setBookmarked(initialBookmarked);
  }, [initialBookmarked]);

  const toggle = useCallback(async () => {
    if (mutation.isPending) return;

    const prev = bookmarked;
    const optimistic = !prev;
    setBookmarked(optimistic);

    try {
      const result = await mutation.mutateAsync({ reviewId });
      setBookmarked(result.bookmarked);
    } catch (error) {
      setBookmarked(prev);
      if (error instanceof Error && error.message) {
        toast.error(error.message);
      } else {
        toast.error("We couldn't update your bookmark. Please try again.");
      }
    }
  }, [bookmarked, mutation, reviewId]);

  return { bookmarked, toggle, isPending: mutation.isPending };
}
