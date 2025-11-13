"use client";

import { trpc } from "@/lib/trpc/client";

export function useFollow(targetUserId: string) {
  const utils = trpc.useUtils();

  const status = trpc.social.follows.status.useQuery({ targetUserId }, { staleTime: 5_000 });

  const toggle = trpc.social.follows.toggle.useMutation({
    onSuccess: () => utils.social.follows.status.invalidate({ targetUserId }),
  });

  return { status, toggle };
}
