"use client";

import { useDeferredValue, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CarList } from "@/features/cars/components/car-list";
import type { ListCarsResult } from "@/features/cars/types";
import { trpc } from "@/lib/trpc/client";

const PAGE_SIZE = 12;

interface CarsPageClientProps {
  initialData: ListCarsResult;
  initialQuery?: string;
}

export function CarsPageClient({ initialData, initialQuery }: CarsPageClientProps) {
  const [searchTerm, setSearchTerm] = useState(initialQuery ?? "");
  const deferredQuery = useDeferredValue(searchTerm);
  const normalizedInitial = initialQuery?.trim() ?? "";
  const normalizedQuery = deferredQuery.trim();
  const shouldUseInitial = normalizedQuery === normalizedInitial;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = trpc.cars.list.useInfiniteQuery(
    { limit: PAGE_SIZE, query: normalizedQuery.length ? normalizedQuery : undefined },
    {
      initialData: shouldUseInitial
        ? {
            pages: [initialData],
            pageParams: [undefined],
          }
        : undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    },
  );

  const items = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);
  const showInitialSkeleton = isLoading && items.length === 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-md">
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by make, model, or generation"
            aria-label="Search cars"
          />
        </div>
        {searchTerm ? (
          <Button variant="ghost" size="sm" onClick={() => setSearchTerm("")}>Clear</Button>
        ) : null}
      </div>
      {showInitialSkeleton ? (
        <CarsSkeleton />
      ) : (
        <CarList items={items} />
      )}
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

function CarsSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="animate-pulse space-y-4 rounded-xl border border-border bg-card p-4">
          <div className="h-36 rounded-md bg-muted" />
          <div className="space-y-2">
            <div className="h-4 w-3/4 rounded bg-muted" />
            <div className="h-3 w-1/2 rounded bg-muted" />
            <div className="h-3 w-2/3 rounded bg-muted" />
          </div>
          <div className="h-9 w-full rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}
