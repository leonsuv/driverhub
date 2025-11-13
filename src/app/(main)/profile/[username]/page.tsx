import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ReviewCard } from "@/features/reviews/components/review-card";
import { UserDraftReviewsSection } from "@/features/reviews/components/user-draft-reviews-section";
import { listReviews } from "@/features/reviews/infrastructure/review.repository";
import { UserProfileHeader } from "@/features/users/components/user-profile-header";
import { getUserProfileByUsername } from "@/features/users/infrastructure/user.repository";
import { getCurrentUser } from "@/lib/auth/session";
import { FollowersList, FollowingList } from "@/features/social/components/follow-lists";
import { LikedReviewsSection } from "@/features/reviews/components/liked-reviews-section";
import { BookmarkedReviewsSection } from "@/features/reviews/components/bookmarked-reviews-section";
import { countFollowers, countFollowing } from "@/features/social/infrastructure/follow.repository";

interface ProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

const PUBLISHED_PAGE_SIZE = 12;

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const [currentUser, profile] = await Promise.all([
    getCurrentUser(),
    getUserProfileByUsername(username),
  ]);

  if (!profile) {
    notFound();
  }

  const isOwner = currentUser?.id === profile.id;

  const [publishedReviews, draftReviews, followersCount, followingCount] = await Promise.all([
    listReviews({
      limit: PUBLISHED_PAGE_SIZE,
      currentUserId: currentUser?.id ?? null,
      filters: { authorId: profile.id, status: "published" },
    }),
    isOwner
      ? listReviews({
          limit: PUBLISHED_PAGE_SIZE,
          currentUserId: currentUser?.id ?? null,
          filters: { authorId: profile.id, status: "draft" },
        })
      : Promise.resolve(null),
    countFollowers(profile.id),
    countFollowing(profile.id),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <UserProfileHeader profile={profile} isOwner={isOwner} />

      {/* Quick navigation */}
      <nav className="flex flex-wrap items-center gap-2">
        <a href="#followers" className="rounded-full border px-3 py-1 text-sm hover:bg-muted">Followers</a>
        <a href="#following" className="rounded-full border px-3 py-1 text-sm hover:bg-muted">Following</a>
        {isOwner ? (
          <>
            <a href="#liked" className="rounded-full border px-3 py-1 text-sm hover:bg-muted">Liked</a>
            <a href="#bookmarked" className="rounded-full border px-3 py-1 text-sm hover:bg-muted">Bookmarked</a>
          </>
        ) : null}
      </nav>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Published reviews</h2>
            <p className="text-muted-foreground text-sm">
              Ownership stories and impressions shared by {profile.displayName}.
            </p>
          </div>
          {isOwner ? (
            <Button asChild>
              <Link href="/reviews/create">Write a new review</Link>
            </Button>
          ) : null}
        </div>
        {publishedReviews.items.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
            No published reviews yet.
          </div>
        ) : (
          <div className="space-y-4">
            {publishedReviews.items.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3" id="followers">
          <h2 className="text-xl font-semibold">Followers ({followersCount})</h2>
          <FollowersList userId={profile.id} />
        </div>
        <div className="space-y-3" id="following">
          <h2 className="text-xl font-semibold">Following ({followingCount})</h2>
          <FollowingList userId={profile.id} />
        </div>
      </section>

      {isOwner ? (
        <div className="space-y-8">
          <div id="liked">
            <LikedReviewsSection userId={profile.id} />
          </div>
          <div id="bookmarked">
            <BookmarkedReviewsSection userId={profile.id} />
          </div>
        </div>
      ) : null}

      {isOwner ? (
        <UserDraftReviewsSection authorId={profile.id} initialData={draftReviews} />
      ) : null}
    </div>
  );
}
