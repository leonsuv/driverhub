"use client";

import Link from "next/link";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { ListReviewsResult, ReviewSummary } from "@/features/reviews/types";
import { ReviewStatusBadge } from "@/features/reviews/components/review-status-badge";
import { useReviewStatusActions } from "@/features/reviews/hooks/use-review-status-actions";
import { trpc } from "@/lib/trpc/client";

const PAGE_SIZE = 10;

interface UserDraftReviewsSectionProps {
  authorId: string;
  initialData?: ListReviewsResult | null;
}

export function UserDraftReviewsSection({ authorId, initialData }: UserDraftReviewsSectionProps) {
  const { publish, remove, isPending } = useReviewStatusActions();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = trpc.reviews.list.useInfiniteQuery(
    { limit: PAGE_SIZE, authorId, status: "draft" },
    {
      initialData: initialData
        ? {
            pages: [initialData],
            pageParams: [undefined],
          }
        : undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    },
  );

  const reviews = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);

  if (isLoading && reviews.length === 0) {
    return (
      <section className="space-y-3">
        <header className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">Draft reviews</h2>
          <p className="text-muted-foreground text-sm">
            Start publishing your experiences to share them with the community.
          </p>
        </header>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="animate-pulse space-y-4 rounded-xl border border-dashed p-4">
              <div className="h-5 w-2/3 rounded bg-muted" />
              <div className="h-3 w-1/2 rounded bg-muted" />
              <div className="h-20 rounded bg-muted" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!isLoading && reviews.length === 0) {
    return (
      <section className="space-y-3">
        <header className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">Draft reviews</h2>
          <p className="text-muted-foreground text-sm">
            Start publishing your experiences to share them with the community.
          </p>
        </header>
        <div className="rounded-xl border border-dashed p-6 text-center text-muted-foreground">
          You have no drafts yet.
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <header className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold">Draft reviews</h2>
        <p className="text-muted-foreground text-sm">
          Publish drafts when they are ready or remove ones you no longer need.
        </p>
      </header>
      <div className="space-y-4">
        {reviews.map((review) => (
          <DraftReviewCard
            key={review.id}
            review={review}
            onPublish={() => publish(review.id).catch(() => undefined)}
            onDelete={() => remove(review.id).catch(() => undefined)}
            disabled={isPending}
          />
        ))}
      </div>
      {hasNextPage ? (
        <Button
          variant="outline"
          className="self-start"
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? "Loading..." : "Load more"}
        </Button>
      ) : null}
    </section>
  );
}

interface DraftReviewCardProps {
  review: ReviewSummary;
  onPublish: () => void;
  onDelete: () => void;
  disabled?: boolean;
}

function DraftReviewCard({ review, onPublish, onDelete, disabled = false }: DraftReviewCardProps) {
  return (
    <Card className="border-dashed">
      <CardHeader className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-lg font-semibold">{review.title}</CardTitle>
          <ReviewStatusBadge status={review.status} />
        </div>
        <p className="text-muted-foreground text-sm">
          {review.car.year} {review.car.make} {review.car.model}
        </p>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm leading-relaxed">{review.excerpt}</p>
      </CardContent>
      <CardFooter className="flex flex-wrap items-center gap-2 justify-between">
        <div className="flex items-center gap-3 text-muted-foreground text-sm">
          <span>Likes: {review.stats.likeCount}</span>
          <span>Comments: {review.stats.commentCount}</span>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="ghost">
            <Link href={`/reviews/${review.id}`}>Preview</Link>
          </Button>
          <Button variant="outline" onClick={onDelete} disabled={disabled}>
            Delete
          </Button>
          <Button onClick={onPublish} disabled={disabled}>
            Publish
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
