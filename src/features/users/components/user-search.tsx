"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { trpc } from "@/lib/trpc/client";

export function UserSearch() {
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState<string | undefined>(undefined);

  const enabled = query.trim().length >= 2;
  const search = trpc.users.search.useQuery({ query, limit: 20, cursor }, { enabled });

  const onSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setCursor(undefined);
  }, []);

  const items = search.data?.items ?? [];

  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="flex items-center gap-2">
        <Input
          placeholder="Search users by username or name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button type="submit" disabled={!enabled || search.isFetching}>Search</Button>
      </form>

      {!enabled ? (
        <p className="text-sm text-muted-foreground">Enter at least 2 characters to search.</p>
      ) : search.isLoading ? (
        <p className="text-sm text-muted-foreground">Searching...</p>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed p-6 text-center text-muted-foreground">No users found.</div>
      ) : (
        <ul className="space-y-2">
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

      {search.data?.nextCursor ? (
        <Button
          size="sm"
          variant="secondary"
          disabled={search.isFetching}
          onClick={() => setCursor(search.data?.nextCursor ?? undefined)}
        >
          {search.isFetching ? "Loading..." : "Load more"}
        </Button>
      ) : null}
    </div>
  );
}
