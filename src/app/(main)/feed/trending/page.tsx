import Link from "next/link";

import { Button } from "@/components/ui/button";
import { TrendingFeedPageClient } from "@/features/feed/components/trending-feed-page-client";
import { FeedNav } from "@/features/feed/components/feed-nav";
import { getTrendingFeed } from "@/features/feed/infrastructure/feed.repository";

export default async function TrendingFeedPage() {
  const initialFeed = await getTrendingFeed({ limit: 10 });

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Trending</h1>
            <p className="text-muted-foreground text-sm">Most liked reviews right now.</p>
          </div>
          <Button asChild>
            <Link href="/reviews/create">Write a review</Link>
          </Button>
        </div>
        <FeedNav />
      </header>
      <TrendingFeedPageClient initialData={initialFeed} />
    </div>
  );
}
