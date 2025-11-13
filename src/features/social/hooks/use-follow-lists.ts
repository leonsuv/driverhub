"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";

export function useFollowers(userId: string, pageSize = 20) {
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const query = trpc.social.follows.followers.useQuery({ userId, limit: pageSize, cursor });
  const loadMore = () => {
    if (query.data?.nextCursor) setCursor(query.data.nextCursor);
  };
  return { ...query, loadMore };
}

export function useFollowing(userId: string, pageSize = 20) {
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const query = trpc.social.follows.following.useQuery({ userId, limit: pageSize, cursor });
  const loadMore = () => {
    if (query.data?.nextCursor) setCursor(query.data.nextCursor);
  };
  return { ...query, loadMore };
}
