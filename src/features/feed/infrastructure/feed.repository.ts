import { and, desc, eq, inArray, isNotNull, lt, or, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { bookmarks, cars, follows, reviewLikes, reviews, users } from "@/lib/db/schema";
import { createReviewExcerpt } from "@/features/reviews/domain/review.entity";
import type { ListReviewsParams, ListReviewsResult, ReviewSummary } from "@/features/reviews/types";

export async function getLatestFeed({ limit, cursor, currentUserId }: ListReviewsParams): Promise<ListReviewsResult> {
  const pageSize = Math.min(Math.max(limit, 1), 50);
  const constraints = cursor
    ? and(eq(reviews.status, "published"), isNotNull(reviews.publishedAt), lt(reviews.id, cursor))
    : and(eq(reviews.status, "published"), isNotNull(reviews.publishedAt));

  const rows = await db
    .select({ review: reviews, author: users, car: cars })
    .from(reviews)
    .innerJoin(users, eq(users.id, reviews.authorId))
    .innerJoin(cars, eq(cars.id, reviews.carId))
    .where(constraints)
    .orderBy(desc(reviews.publishedAt), desc(reviews.id))
    .limit(pageSize + 1);

  const hasNext = rows.length > pageSize;
  const visible = hasNext ? rows.slice(0, pageSize) : rows;
  const reviewIds = visible.map((r) => r.review.id);

  let likedIds = new Set<number>();
  let bookmarkedIds = new Set<number>();
  if (currentUserId && reviewIds.length > 0) {
    const likedRows = await db
      .select({ reviewId: reviewLikes.reviewId })
      .from(reviewLikes)
      .where(and(eq(reviewLikes.userId, currentUserId), inArray(reviewLikes.reviewId, reviewIds)));
    likedIds = new Set(likedRows.map((r) => r.reviewId));

    const bRows = await db
      .select({ reviewId: bookmarks.reviewId })
      .from(bookmarks)
      .where(and(eq(bookmarks.userId, currentUserId), inArray(bookmarks.reviewId, reviewIds)));
    bookmarkedIds = new Set(bRows.map((r) => r.reviewId));
  }

  const items: ReviewSummary[] = visible.map((row) => ({
    id: row.review.id,
    title: row.review.title,
    excerpt: createReviewExcerpt(row.review.content),
    rating: row.review.rating,
    publishedAt: (row.review.publishedAt ?? row.review.createdAt).toISOString(),
    status: row.review.status,
    author: {
      id: row.author.id,
      username: row.author.username,
      displayName: row.author.displayName ?? row.author.username,
      avatarUrl: row.author.avatarUrl ?? null,
    },
    car: {
      id: row.car.id,
      make: row.car.make,
      model: row.car.model,
      year: row.car.year,
      generation: row.car.generation,
    },
    stats: {
      viewCount: row.review.viewCount,
      likeCount: row.review.likeCount,
      commentCount: row.review.commentCount,
    },
    likedByCurrentUser: likedIds.has(row.review.id),
    bookmarkedByCurrentUser: bookmarkedIds.has(row.review.id),
  }));

  const nextCursor = hasNext ? rows[pageSize].review.id : null;
  return { items, nextCursor };
}

export async function getPersonalizedFeed({ limit, cursor, currentUserId }: ListReviewsParams): Promise<ListReviewsResult> {
  if (!currentUserId) return { items: [], nextCursor: null };

  const pageSize = Math.min(Math.max(limit, 1), 50);
  const constraints = cursor
    ? and(
        eq(reviews.status, "published"),
        isNotNull(reviews.publishedAt),
        lt(reviews.id, cursor),
      )
    : and(eq(reviews.status, "published"), isNotNull(reviews.publishedAt));

  const rows = await db
    .select({ review: reviews, author: users, car: cars })
    .from(reviews)
    .innerJoin(users, eq(users.id, reviews.authorId))
    .innerJoin(cars, eq(cars.id, reviews.carId))
    .innerJoin(follows, eq(follows.followingId, reviews.authorId))
    .where(and(constraints, eq(follows.followerId, currentUserId)))
    .orderBy(desc(reviews.publishedAt), desc(reviews.id))
    .limit(pageSize + 1);

  const hasNext = rows.length > pageSize;
  const visible = hasNext ? rows.slice(0, pageSize) : rows;
  const reviewIds = visible.map((r) => r.review.id);

  let likedIds = new Set<number>();
  let bookmarkedIds = new Set<number>();
  if (currentUserId && reviewIds.length > 0) {
    const likedRows = await db
      .select({ reviewId: reviewLikes.reviewId })
      .from(reviewLikes)
      .where(and(eq(reviewLikes.userId, currentUserId), inArray(reviewLikes.reviewId, reviewIds)));
    likedIds = new Set(likedRows.map((r) => r.reviewId));

    const bRows = await db
      .select({ reviewId: bookmarks.reviewId })
      .from(bookmarks)
      .where(and(eq(bookmarks.userId, currentUserId), inArray(bookmarks.reviewId, reviewIds)));
    bookmarkedIds = new Set(bRows.map((r) => r.reviewId));
  }

  const items: ReviewSummary[] = visible.map((row) => ({
    id: row.review.id,
    title: row.review.title,
    excerpt: createReviewExcerpt(row.review.content),
    rating: row.review.rating,
    publishedAt: (row.review.publishedAt ?? row.review.createdAt).toISOString(),
    status: row.review.status,
    author: {
      id: row.author.id,
      username: row.author.username,
      displayName: row.author.displayName ?? row.author.username,
      avatarUrl: row.author.avatarUrl ?? null,
    },
    car: {
      id: row.car.id,
      make: row.car.make,
      model: row.car.model,
      year: row.car.year,
      generation: row.car.generation,
    },
    stats: {
      viewCount: row.review.viewCount,
      likeCount: row.review.likeCount,
      commentCount: row.review.commentCount,
    },
    likedByCurrentUser: likedIds.has(row.review.id),
    bookmarkedByCurrentUser: bookmarkedIds.has(row.review.id),
  }));

  const nextCursor = hasNext ? rows[pageSize].review.id : null;
  return { items, nextCursor };
}

function encodeTrendingCursor(likeCount: number, reviewId: number) {
  return Buffer.from(`${likeCount}::${reviewId}`).toString("base64");
}
function decodeTrendingCursor(cursor?: string | null) {
  if (!cursor) return null;
  try {
    const [likes, id] = Buffer.from(cursor, "base64").toString("utf8").split("::");
    return { likeCount: Number(likes), reviewId: Number(id) };
  } catch {
    return null;
  }
}

export async function getTrendingFeed({ limit, cursor, currentUserId }: ListReviewsParams): Promise<ListReviewsResult> {
  const pageSize = Math.min(Math.max(limit, 1), 50);
  const decoded = decodeTrendingCursor(cursor as unknown as string);

  const base = and(eq(reviews.status, "published"), isNotNull(reviews.publishedAt));
  const constraints = decoded
    ? or(
        lt(reviews.likeCount, decoded.likeCount),
        and(eq(reviews.likeCount, decoded.likeCount), lt(reviews.id, decoded.reviewId)),
      )
    : sql`true`;

  const rows = await db
    .select({ review: reviews, author: users, car: cars })
    .from(reviews)
    .innerJoin(users, eq(users.id, reviews.authorId))
    .innerJoin(cars, eq(cars.id, reviews.carId))
    .where(and(base, constraints))
    .orderBy(desc(reviews.likeCount), desc(reviews.publishedAt), desc(reviews.id))
    .limit(pageSize + 1);

  const hasNext = rows.length > pageSize;
  const visible = hasNext ? rows.slice(0, pageSize) : rows;
  const reviewIds = visible.map((r) => r.review.id);

  let likedIds = new Set<number>();
  let bookmarkedIds = new Set<number>();
  if (currentUserId && reviewIds.length > 0) {
    const likedRows = await db
      .select({ reviewId: reviewLikes.reviewId })
      .from(reviewLikes)
      .where(and(eq(reviewLikes.userId, currentUserId), inArray(reviewLikes.reviewId, reviewIds)));
    likedIds = new Set(likedRows.map((r) => r.reviewId));

    const bRows = await db
      .select({ reviewId: bookmarks.reviewId })
      .from(bookmarks)
      .where(and(eq(bookmarks.userId, currentUserId), inArray(bookmarks.reviewId, reviewIds)));
    bookmarkedIds = new Set(bRows.map((r) => r.reviewId));
  }

  const items: ReviewSummary[] = visible.map((row) => ({
    id: row.review.id,
    title: row.review.title,
    excerpt: createReviewExcerpt(row.review.content),
    rating: row.review.rating,
    publishedAt: (row.review.publishedAt ?? row.review.createdAt).toISOString(),
    status: row.review.status,
    author: {
      id: row.author.id,
      username: row.author.username,
      displayName: row.author.displayName ?? row.author.username,
      avatarUrl: row.author.avatarUrl ?? null,
    },
    car: {
      id: row.car.id,
      make: row.car.make,
      model: row.car.model,
      year: row.car.year,
      generation: row.car.generation,
    },
    stats: {
      viewCount: row.review.viewCount,
      likeCount: row.review.likeCount,
      commentCount: row.review.commentCount,
    },
    likedByCurrentUser: likedIds.has(row.review.id),
    bookmarkedByCurrentUser: bookmarkedIds.has(row.review.id),
  }));

  const last = hasNext ? rows[pageSize] : null;
  const nextCursor = last ? (encodeTrendingCursor(last.review.likeCount, last.review.id) as unknown as number) : null;
  return { items, nextCursor };
}
