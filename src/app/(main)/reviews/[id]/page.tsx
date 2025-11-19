import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Separator } from "@/components/ui/separator";
import { ReviewLikeButton } from "@/features/reviews/components/review-like-button";
import { ReviewBookmarkButton } from "@/features/reviews/components/review-bookmark-button";
import { getPublishedReviewById } from "@/features/reviews/infrastructure/review.repository";
import { ReviewCommentsSection } from "@/features/social/components/review-comments-section";
import { FollowButton } from "@/features/social/components/follow-button";
import { getCurrentUser } from "@/lib/auth/session";
import { formatDate, formatRelativeDate } from "@/lib/utils/date";

interface ReviewPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ReviewDetailPage({ params }: ReviewPageProps) {
  const { id } = await params;
  const reviewId = Number(id);

  if (Number.isNaN(reviewId)) {
    notFound();
  }

  const currentUser = await getCurrentUser();
  const review = await getPublishedReviewById(reviewId, currentUser?.id ?? null);

  if (!review) {
    notFound();
  }

  const currentUserSummary = currentUser
    ? {
        id: currentUser.id,
        displayName: currentUser.name ?? currentUser.username ?? "You",
        username: currentUser.username ?? null,
      }
    : null;

  const paragraphs = review.content
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);

  return (
    <div className="flex w-full max-w-4xl flex-col gap-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Feed", href: "/feed" }, { label: review.title }]} />
      <Button asChild variant="outline" className="self-start">
        <Link href="/feed">Back to feed</Link>
      </Button>
      <article className="space-y-10">
        <header className="space-y-4">
          <p className="text-muted-foreground text-sm">
            {formatDate(review.publishedAt)} ({formatRelativeDate(review.publishedAt)})
          </p>
          <h1 className="text-4xl font-semibold leading-tight">{review.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>
              {review.car.year} {review.car.make} {review.car.model}
              {review.car.generation ? ` - ${review.car.generation}` : ""}
            </span>
            <span>
              - By <Link href={`/profile/${review.author.username}`} className="hover:underline">{review.author.displayName}</Link>
            </span>
            <span>- Rating {review.rating}/10</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span>Views {review.stats.viewCount}</span>
            <span>Comments {review.stats.commentCount}</span>
            {currentUser && currentUser.id !== review.author.id ? (
              <FollowButton targetUserId={review.author.id} />
            ) : null}
            <ReviewLikeButton
              reviewId={review.id}
              initialLiked={review.likedByCurrentUser}
              initialLikeCount={review.stats.likeCount}
              canLike={Boolean(currentUser)}
            />
            <ReviewBookmarkButton
              reviewId={review.id}
              initialBookmarked={review.bookmarkedByCurrentUser ?? false}
              canBookmark={Boolean(currentUser)}
            />
          </div>
        </header>
        {review.media.length > 0 ? (
          <section className="grid gap-4 sm:grid-cols-2">
            {review.media.map((item) => (
              <div key={item.id} className="overflow-hidden rounded-xl border">
                {item.type === "video" ? (
                  <video
                    className="h-full w-full object-cover"
                    controls
                    src={item.url}
                    aria-label={item.altText ?? undefined}
                  />
                ) : (
                  <div className="relative aspect-video">
                    <Image
                      src={item.url}
                      alt={item.altText ?? "Review media"}
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                )}
              </div>
            ))}
          </section>
        ) : null}
        <section className="space-y-4 text-base leading-relaxed">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </section>
        <section className="grid gap-6 md:grid-cols-2">
          {review.pros ? (
            <div className="rounded-xl border p-6">
              <h2 className="text-lg font-semibold">Highlights</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">{review.pros}</p>
            </div>
          ) : null}
          {review.cons ? (
            <div className="rounded-xl border p-6">
              <h2 className="text-lg font-semibold">Challenges</h2>
              <p className="text-muted-foreground text-sm leading-relaxed">{review.cons}</p>
            </div>
          ) : null}
        </section>
      </article>
      <Separator />
      <ReviewCommentsSection reviewId={review.id} currentUser={currentUserSummary} />
    </div>
  );
}
