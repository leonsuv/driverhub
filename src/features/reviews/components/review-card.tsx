import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatRelativeDate } from "@/lib/utils/date";
import type { ReviewSummary } from "@/features/reviews/types";
import { ReviewBookmarkButton } from "@/features/reviews/components/review-bookmark-button";

interface ReviewCardProps {
  review: ReviewSummary;
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          <Link href={`/reviews/${review.id}`} className="hover:underline">
            {review.title}
          </Link>
        </CardTitle>
        <CardDescription>
          <span className="font-medium text-foreground">
            {review.car.year} {review.car.make} {review.car.model}
          </span>
          {review.car.generation ? ` - ${review.car.generation}` : ""}
          <span className="text-muted-foreground">
            {" "}- {review.author.displayName} (@{review.author.username})
          </span>
          <span className="text-muted-foreground"> - {formatRelativeDate(review.publishedAt)}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm leading-relaxed">{review.excerpt}</p>
      </CardContent>
      <CardFooter className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        {review.likedByCurrentUser ? (
          <span className="rounded-full bg-rose-100 px-3 py-1 text-rose-600 font-medium">
            Liked
          </span>
        ) : null}
        <span className="rounded-full bg-primary/10 px-3 py-1 text-primary font-medium">
          {review.rating}/10
        </span>
        <span>Views: {review.stats.viewCount}</span>
        <span>Likes: {review.stats.likeCount}</span>
        <span>Comments: {review.stats.commentCount}</span>
        <div className="ml-auto">
          <ReviewBookmarkButton
            reviewId={review.id}
            initialBookmarked={review.bookmarkedByCurrentUser ?? false}
          />
        </div>
      </CardFooter>
    </Card>
  );
}
