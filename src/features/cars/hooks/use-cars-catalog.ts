import { useMemo } from "react";

import { normalizeCarSearchQuery } from "@/features/cars/domain/car.entity";
import type { ListCarsResult } from "@/features/cars/types";
import { trpc } from "@/lib/trpc/client";

interface UseCarsCatalogOptions {
  query?: string | null;
  limit?: number;
  initialData?: ListCarsResult;
  enabled?: boolean;
}

const DEFAULT_PAGE_SIZE = 12;

export function useCarsCatalog(options: UseCarsCatalogOptions = {}) {
  const normalizedQuery = normalizeCarSearchQuery(options.query);
  const pageSize = Math.min(Math.max(options.limit ?? DEFAULT_PAGE_SIZE, 1), 50);

  const result = trpc.cars.list.useInfiniteQuery(
    {
      limit: pageSize,
      query: normalizedQuery,
    },
    {
      enabled: options.enabled ?? true,
      initialData: options.initialData
        ? {
            pages: [options.initialData],
            pageParams: [undefined],
          }
        : undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    },
  );

  const items = useMemo(
    () => result.data?.pages.flatMap((page) => page.items) ?? [],
    [result.data],
  );

  return {
    ...result,
    items,
  };
}
