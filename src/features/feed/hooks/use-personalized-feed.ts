"use client";

import { useMemo } from "react";
import { trpc } from "@/lib/trpc/client";
import type { ListReviewsResult } from "@/features/reviews/types";

const PAGE_SIZE = 10;

export function usePersonalizedFeed(initialData?: ListReviewsResult | null) {
  const query = trpc.feed.personalized.useInfiniteQuery(
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

  const items = useMemo(() => query.data?.pages.flatMap((p) => p.items) ?? [], [query.data]);
  const showSkeleton = query.isLoading && items.length === 0;

  return { ...query, items, showSkeleton };
}
