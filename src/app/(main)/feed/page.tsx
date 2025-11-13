import Link from "next/link";

import { Button } from "@/components/ui/button";
import { FeedPageClient } from "@/features/feed/components/feed-page-client";
import { getLatestFeed } from "@/features/feed/infrastructure/feed.repository";
import { getCurrentUser } from "@/lib/auth/session";

export default async function FeedPage() {
  const currentUser = await getCurrentUser();
  const initialFeed = await getLatestFeed({ limit: 10, currentUserId: currentUser?.id ?? null });

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Community feed</h1>
          <p className="text-muted-foreground text-sm">
            Fresh reviews from drivers around the world.
          </p>
        </div>
        <Button asChild>
          <Link href="/reviews/create">Write a review</Link>
        </Button>
      </header>
      <FeedPageClient initialData={initialFeed} />
    </div>
  );
}
