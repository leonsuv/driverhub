"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";

export function useUserLikedReviews(userId: string, pageSize = 12) {
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const query = trpc.reviews.userLiked.useQuery({ userId, limit: pageSize, cursor }, { staleTime: 5_000 });
  const loadMore = () => {
    if (query.data?.nextCursor) setCursor(query.data.nextCursor);
  };
  return { ...query, loadMore };
}
