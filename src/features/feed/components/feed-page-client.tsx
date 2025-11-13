"use client";

import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FeedList } from "@/features/feed/components/feed-list";
import type { ListReviewsResult } from "@/features/reviews/types";
import { trpc } from "@/lib/trpc/client";

const PAGE_SIZE = 10;

interface FeedPageClientProps {
  initialData?: ListReviewsResult | null;
}

export function FeedPageClient({ initialData }: FeedPageClientProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = trpc.feed.latest.useInfiniteQuery(
    { limit: PAGE_SIZE },
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

  const items = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);
  const showSkeleton = isLoading && items.length === 0;

  return (
    <div className="flex flex-col gap-6">
      {showSkeleton ? <FeedSkeleton /> : <FeedList items={items} />}
      {hasNextPage ? (
        <Button
          className="self-center"
          variant="outline"
          disabled={isFetchingNextPage}
          onClick={() => fetchNextPage()}
        >
          {isFetchingNextPage ? "Loading..." : "Load more"}
        </Button>
      ) : null}
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
          <div className="mt-4 space-y-3">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      ))}
    </div>
  );
}
