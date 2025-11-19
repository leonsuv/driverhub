"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserLikedComments } from "@/features/social/hooks/use-user-liked-comments";
import { UserHover } from "@/features/users/components/user-hover-card";

interface LikedCommentsSectionProps {
  userId: string;
}

export function LikedCommentsSection({ userId }: LikedCommentsSectionProps) {
  const { data, isLoading, error, isFetching, loadMore } = useUserLikedComments(userId);

  if (isLoading) return <div>Loading liked comments...</div>;
  if (error) return <div>Failed to load liked comments.</div>;

  const items = data?.items ?? [];

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold">Liked comments</h2>
        <p className="text-sm text-muted-foreground">Comments you have liked.</p>
      </div>
      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
          You haven't liked any comments yet.
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((c) => (
            <li key={c.id} className="flex items-start gap-3 rounded-lg border bg-background p-3">
              <Link href={`/profile/${c.author.username}`} className="shrink-0">
                <Avatar className="size-8">
                  <AvatarImage src={c.author.avatarUrl ?? undefined} alt={c.author.displayName ?? c.author.username} />
                  <AvatarFallback>{(c.author.displayName ?? c.author.username).slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <UserHover user={{ id: c.author.id, username: c.author.username, displayName: c.author.displayName, avatarUrl: c.author.avatarUrl }}>
                    <Link href={`/profile/${c.author.username}`} className="font-medium text-foreground hover:underline">
                      {c.author.displayName ?? c.author.username}
                    </Link>
                  </UserHover>
                  <span>•</span>
                  <Link href={`/reviews/${c.reviewId}`} className="hover:underline">View review</Link>
                  <span>•</span>
                  <span>Likes {c.likeCount}</span>
                </div>
                <p className="mt-1 line-clamp-3 whitespace-pre-line text-sm">{c.content}</p>
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
    </section>
  );
}
