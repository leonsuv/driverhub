"use client";

import { Button } from "@/components/ui/button";
import { ReviewCard } from "@/features/reviews/components/review-card";
import { useUserLikedReviews } from "@/features/reviews/hooks/use-user-liked-reviews";

interface LikedReviewsSectionProps {
  userId: string;
}

export function LikedReviewsSection({ userId }: LikedReviewsSectionProps) {
  const { data, isLoading, error, isFetching, loadMore } = useUserLikedReviews(userId);

  if (isLoading) return <div>Loading liked reviews...</div>;
  if (error) return <div>Failed to load liked reviews.</div>;

  const items = data?.items ?? [];

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold">Liked reviews</h2>
        <p className="text-sm text-muted-foreground">Reviews you have liked.</p>
      </div>
      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
          You haven't liked any reviews yet.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
      {data?.nextCursor ? (
        <Button size="sm" variant="secondary" disabled={isFetching} onClick={loadMore}>
          {isFetching ? "Loading..." : "Load more"}
        </Button>
      ) : null}
    </section>
  );
}
