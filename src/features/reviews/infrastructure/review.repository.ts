import { and, asc, desc, eq, isNotNull, lt, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { cars, reviewMedia, reviews, users } from "@/lib/db/schema";
import {
  CreateReviewInput,
  ListReviewsParams,
  ListReviewsResult,
  ReviewDetail,
  ReviewSummary,
} from "@/features/reviews/types";
import { createReviewExcerpt, normalizeOptionalField } from "@/features/reviews/domain/review.entity";

interface CreateReviewParams extends CreateReviewInput {
  authorId: string;
}

export async function createReview(params: CreateReviewParams) {
  const publishedAt = new Date();

  return db.transaction(async (tx) => {
    const [row] = await tx
      .insert(reviews)
      .values({
        authorId: params.authorId,
        carId: params.carId,
        title: params.title,
        content: params.content,
        rating: params.rating,
        pros: normalizeOptionalField(params.pros),
        cons: normalizeOptionalField(params.cons),
        status: "published",
        publishedAt,
      })
      .returning();

    if (params.media?.length) {
      await tx.insert(reviewMedia).values(
        params.media.map((item) => ({
          reviewId: row.id,
          url: item.url,
          type: item.type,
          altText: normalizeOptionalField(item.altText ?? null),
          order: item.order,
        })),
      );
    }

    return row;
  });
}

export async function listLatestPublishedReviews({
  limit,
  cursor,
}: ListReviewsParams): Promise<ListReviewsResult> {
  const constraints = cursor
    ? and(eq(reviews.status, "published"), isNotNull(reviews.publishedAt), lt(reviews.id, cursor))
    : and(eq(reviews.status, "published"), isNotNull(reviews.publishedAt));

  const rows = await db
    .select({
      review: reviews,
      author: {
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
      },
      car: {
        id: cars.id,
        make: cars.make,
        model: cars.model,
        year: cars.year,
        generation: cars.generation,
      },
    })
    .from(reviews)
    .innerJoin(users, eq(users.id, reviews.authorId))
    .innerJoin(cars, eq(cars.id, reviews.carId))
    .where(constraints)
    .orderBy(desc(reviews.publishedAt), desc(reviews.id))
    .limit(limit + 1);

  const hasNextPage = rows.length > limit;
  const visibleRows = hasNextPage ? rows.slice(0, limit) : rows;

  const items: ReviewSummary[] = visibleRows.map((row) => ({
    id: row.review.id,
    title: row.review.title,
    excerpt: createReviewExcerpt(row.review.content),
    rating: row.review.rating,
    publishedAt: (row.review.publishedAt ?? row.review.createdAt).toISOString(),
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
  }));

  const nextCursor = hasNextPage ? rows[limit].review.id : null;

  return { items, nextCursor };
}

interface ListCarReviewsParams {
  carId: number;
  limit: number;
}

export async function listPublishedReviewsByCar({ carId, limit }: ListCarReviewsParams) {
  const pageSize = Math.min(Math.max(limit, 1), 12);

  const rows = await db
    .select({
      review: reviews,
      author: {
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
      },
      car: {
        id: cars.id,
        make: cars.make,
        model: cars.model,
        year: cars.year,
        generation: cars.generation,
      },
    })
    .from(reviews)
    .innerJoin(users, eq(users.id, reviews.authorId))
    .innerJoin(cars, eq(cars.id, reviews.carId))
    .where(
      and(eq(reviews.status, "published"), isNotNull(reviews.publishedAt), eq(reviews.carId, carId)),
    )
    .orderBy(desc(reviews.publishedAt), desc(reviews.id))
    .limit(pageSize);

  const items: ReviewSummary[] = rows.map((row) => ({
    id: row.review.id,
    title: row.review.title,
    excerpt: createReviewExcerpt(row.review.content),
    rating: row.review.rating,
    publishedAt: (row.review.publishedAt ?? row.review.createdAt).toISOString(),
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
  }));

  return items;
}

export async function getPublishedReviewById(id: number): Promise<ReviewDetail | null> {
  return db.transaction(async (tx) => {
    const record = await tx.query.reviews.findFirst({
      where: (reviewsTable, { eq }) => eq(reviewsTable.id, id),
      with: {
        author: true,
        car: true,
        media: {
          orderBy: (mediaTable) => [asc(mediaTable.order), asc(mediaTable.id)],
        },
      },
    });

    if (!record || record.status !== "published" || !record.publishedAt) {
      return null;
    }

    await tx
      .update(reviews)
      .set({
        viewCount: sql`${reviews.viewCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(reviews.id, record.id));

    const nextViewCount = record.viewCount + 1;

    return {
      id: record.id,
      title: record.title,
      excerpt: createReviewExcerpt(record.content),
      content: record.content,
      rating: record.rating,
      pros: record.pros,
      cons: record.cons,
      publishedAt: record.publishedAt.toISOString(),
      author: {
        id: record.author.id,
        username: record.author.username,
        displayName: record.author.displayName ?? record.author.username,
        avatarUrl: record.author.avatarUrl ?? null,
      },
      car: {
        id: record.car.id,
        make: record.car.make,
        model: record.car.model,
        year: record.car.year,
        generation: record.car.generation,
      },
      stats: {
        viewCount: nextViewCount,
        likeCount: record.likeCount,
        commentCount: record.commentCount,
      },
      media: record.media.map((item) => ({
        id: item.id,
        url: item.url,
        type: item.type,
        altText: item.altText,
        order: item.order,
      })),
    };
  });
}
