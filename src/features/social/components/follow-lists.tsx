"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useFollowers, useFollowing } from "@/features/social/hooks/use-follow-lists";

interface ListProps {
  userId: string;
}

export function FollowersList({ userId }: ListProps) {
  const { data, isLoading, error, loadMore, isFetching } = useFollowers(userId);

  if (isLoading) return <div>Loading followers...</div>;
  if (error) return <div>Failed to load followers.</div>;

  const items = data?.items ?? [];

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed p-6 text-center text-muted-foreground">No followers yet.</div>
      ) : (
        <ul className="space-y-3">
          {items.map((u) => (
            <li key={u.id} className="flex items-center justify-between rounded-lg border bg-background p-3">
              <div className="flex items-center gap-3">
                <Avatar className="size-8">
                  <AvatarImage src={u.avatarUrl ?? undefined} alt={u.displayName} />
                  <AvatarFallback>{(u.displayName ?? u.username).slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <div className="font-medium leading-none">
                    <Link href={`/profile/${u.username}`}>{u.displayName}</Link>
                  </div>
                  <div className="text-muted-foreground">@{u.username}</div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {data?.nextCursor ? (
        <Button size="sm" variant="secondary" disabled={isFetching} onClick={loadMore}>
          {isFetching ? "Loading..." : "Load more"}
        </Button>
      ) : null}
    </div>
  );
}

export function FollowingList({ userId }: ListProps) {
  const { data, isLoading, error, loadMore, isFetching } = useFollowing(userId);

  if (isLoading) return <div>Loading following...</div>;
  if (error) return <div>Failed to load following.</div>;

  const items = data?.items ?? [];

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed p-6 text-center text-muted-foreground">Not following anyone yet.</div>
      ) : (
        <ul className="space-y-3">
          {items.map((u) => (
            <li key={u.id} className="flex items-center justify-between rounded-lg border bg-background p-3">
              <div className="flex items-center gap-3">
                <Avatar className="size-8">
                  <AvatarImage src={u.avatarUrl ?? undefined} alt={u.displayName} />
                  <AvatarFallback>{(u.displayName ?? u.username).slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <div className="font-medium leading-none">
                    <Link href={`/profile/${u.username}`}>{u.displayName}</Link>
                  </div>
                  <div className="text-muted-foreground">@{u.username}</div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {data?.nextCursor ? (
        <Button size="sm" variant="secondary" disabled={isFetching} onClick={loadMore}>
          {isFetching ? "Loading..." : "Load more"}
        </Button>
      ) : null}
    </div>
  );
}
