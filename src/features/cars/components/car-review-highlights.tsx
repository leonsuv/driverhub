import { ReviewCard } from "@/features/reviews/components/review-card";
import type { ReviewSummary } from "@/features/reviews/types";

interface CarReviewHighlightsProps {
  reviews: ReviewSummary[];
}

export function CarReviewHighlights({ reviews }: CarReviewHighlightsProps) {
  if (reviews.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
        No community reviews for this model yet. Be the first to share your experience.
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}
