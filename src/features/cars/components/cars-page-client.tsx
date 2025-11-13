"use client";

import { useDeferredValue, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CarList } from "@/features/cars/components/car-list";
import { normalizeCarSearchQuery } from "@/features/cars/domain/car.entity";
import { useCarsCatalog } from "@/features/cars/hooks/use-cars-catalog";
import type { ListCarsResult } from "@/features/cars/types";

const PAGE_SIZE = 12;

interface CarsPageClientProps {
  initialData: ListCarsResult;
  initialQuery?: string;
}

export function CarsPageClient({ initialData, initialQuery }: CarsPageClientProps) {
  const [searchTerm, setSearchTerm] = useState(initialQuery ?? "");
  const deferredQuery = useDeferredValue(searchTerm);
  const normalizedInitial = normalizeCarSearchQuery(initialQuery) ?? "";
  const normalizedDeferred = normalizeCarSearchQuery(deferredQuery) ?? "";
  const shouldUseInitial = normalizedDeferred === normalizedInitial;

  const { items, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useCarsCatalog({
    query: deferredQuery,
    limit: PAGE_SIZE,
    initialData: shouldUseInitial ? initialData : undefined,
  });

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
