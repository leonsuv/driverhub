"use client";

import { useCallback } from "react";
import { toast } from "sonner";

import { trpc } from "@/lib/trpc/client";
import type { ReviewStatus } from "@/features/reviews/types";

export function useReviewStatusActions() {
  const utils = trpc.useUtils();

  const updateStatusMutation = trpc.reviews.updateStatus.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.reviews.list.invalidate(),
        utils.reviews.listLatest.invalidate(),
        utils.feed.latest.invalidate(),
      ]);
    },
  });

  const deleteMutation = trpc.reviews.delete.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.reviews.list.invalidate(),
        utils.reviews.listLatest.invalidate(),
        utils.feed.latest.invalidate(),
      ]);
    },
  });

  const setStatus = useCallback(
    async (reviewId: number, status: ReviewStatus) => {
      try {
        await updateStatusMutation.mutateAsync({ reviewId, status });
        toast.success(`Review ${status === "published" ? "published" : "updated"}`);
      } catch (error) {
        handleError(error, "We couldn't update the review status");
      }
    },
    [updateStatusMutation],
  );

  const remove = useCallback(
    async (reviewId: number) => {
      try {
        await deleteMutation.mutateAsync({ reviewId });
        toast.success("Review deleted");
      } catch (error) {
        handleError(error, "We couldn't delete the review");
      }
    },
    [deleteMutation],
  );

  return {
    publish: (reviewId: number) => setStatus(reviewId, "published"),
    unpublish: (reviewId: number) => setStatus(reviewId, "draft"),
    archive: (reviewId: number) => setStatus(reviewId, "archived"),
    remove,
    isPending: updateStatusMutation.isPending || deleteMutation.isPending,
  };
}

function handleError(error: unknown, fallbackMessage: string) {
  if (error instanceof Error && error.message) {
    toast.error(error.message);
  } else {
    toast.error(fallbackMessage);
  }
}
