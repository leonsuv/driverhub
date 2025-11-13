import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PersonalizedFeedPageClient } from "@/features/feed/components/personalized-feed-page-client";
import { FeedNav } from "@/features/feed/components/feed-nav";
import { getPersonalizedFeed } from "@/features/feed/infrastructure/feed.repository";
import { getCurrentUser } from "@/lib/auth/session";

export default async function PersonalizedFeedPage() {
  const currentUser = await getCurrentUser();
  const initialFeed = currentUser
    ? await getPersonalizedFeed({ limit: 10, currentUserId: currentUser.id })
    : null;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Your feed</h1>
            <p className="text-muted-foreground text-sm">Latest from people you follow.</p>
          </div>
          <Button asChild>
            <Link href="/reviews/create">Write a review</Link>
          </Button>
        </div>
        <FeedNav />
      </header>
      <PersonalizedFeedPageClient initialData={initialFeed} />
    </div>
  );
}
