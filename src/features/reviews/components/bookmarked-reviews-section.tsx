"use client";

import { Button } from "@/components/ui/button";
import { ReviewCard } from "@/features/reviews/components/review-card";
import { useUserBookmarkedReviews } from "@/features/reviews/hooks/use-user-bookmarked-reviews";

interface BookmarkedReviewsSectionProps {
  userId: string;
}

export function BookmarkedReviewsSection({ userId }: BookmarkedReviewsSectionProps) {
  const { data, isLoading, error, isFetching, loadMore } = useUserBookmarkedReviews(userId);

  if (isLoading) return <div>Loading bookmarks...</div>;
  if (error) return <div>Failed to load bookmarks.</div>;

  const items = data?.items ?? [];

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold">Bookmarked reviews</h2>
        <p className="text-sm text-muted-foreground">Your saved reviews.</p>
      </div>
      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
          You haven&apos;t bookmarked any reviews yet.
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
