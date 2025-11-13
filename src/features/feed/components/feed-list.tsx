import type { FeedItem } from "@/features/feed/types";
import { ReviewCard } from "@/features/reviews/components/review-card";

interface FeedListProps {
  items: FeedItem[];
}

export function FeedList({ items }: FeedListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
        No reviews yet. Be the first to share your experience.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {items.map((item) => (
        <ReviewCard key={item.id} review={item} />
      ))}
    </div>
  );
}
