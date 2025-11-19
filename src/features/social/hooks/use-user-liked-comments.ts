"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";

export function useUserLikedComments(userId: string, pageSize = 20) {
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const query = trpc.social.comments.userLiked.useQuery(
    { userId, limit: pageSize, cursor },
    { staleTime: 5_000 },
  );
  const loadMore = () => {
    if (query.data?.nextCursor) setCursor(query.data.nextCursor);
  };
  return { ...query, loadMore };
}
