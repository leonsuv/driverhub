import type { SQL } from "drizzle-orm";
import { and, asc, desc, eq, inArray, isNotNull, lt, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { cars, reviewLikes, reviewMedia, reviews, users } from "@/lib/db/schema";
import {
  CreateReviewInput,
  IncrementReviewViewResult,
  ListReviewsParams,
  ListReviewsResult,
  ReviewDeletionResult,
  ReviewDetail,
  ReviewSummary,
  ReviewUpdateResult,
  ReviewStatus,
  UpdateReviewInput,
} from "@/features/reviews/types";
import {
  createReviewExcerpt,
  createReviewSearchPattern,
  normalizeOptionalField,
  normalizeReviewSearchQuery,
} from "@/features/reviews/domain/review.entity";

export class ReviewNotFoundError extends Error {}

interface ListUserLikedReviewsParams {
  userId: string;
  limit: number;
  cursor?: string | null;
  currentUserId?: string | null;
}

interface ListUserLikedReviewsResult {
  items: ReviewSummary[];
  nextCursor: string | null;
}

function encodeLikedCursor(createdAt: Date, reviewId: number) {
  return Buffer.from(`${createdAt.toISOString()}::${reviewId}`).toString("base64");
}

function decodeLikedCursor(cursor?: string | null) {
  if (!cursor) return null;
  try {
    const [iso, id] = Buffer.from(cursor, "base64").toString("utf8").split("::");
    return { createdAt: new Date(iso), reviewId: Number(id) };
  } catch {
    return null;
  }
}

export async function listUserLikedReviews(
  params: ListUserLikedReviewsParams,
): Promise<ListUserLikedReviewsResult> {
  const normalizedLimit = Math.min(Math.max(params.limit, 1), 50);
  const decoded = decodeLikedCursor(params.cursor ?? null);

  const rows = await db
    .select({
      id: reviews.id,
      title: reviews.title,
      content: reviews.content,
      rating: reviews.rating,
      status: reviews.status,
      publishedAt: reviews.publishedAt,
      createdAt: reviews.createdAt,
      viewCount: reviews.viewCount,
      likeCount: reviews.likeCount,
      commentCount: reviews.commentCount,
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
      likedAt: reviewLikes.createdAt,
    })
    .from(reviewLikes)
    .innerJoin(reviews, and(eq(reviews.id, reviewLikes.reviewId), eq(reviews.status, "published")))
    .innerJoin(users, eq(users.id, reviews.authorId))
    .innerJoin(cars, eq(cars.id, reviews.carId))
    .where(
      decoded
        ? and(eq(reviewLikes.userId, params.userId), lt(reviewLikes.createdAt, decoded.createdAt))
        : eq(reviewLikes.userId, params.userId),
    )
    .orderBy(desc(reviewLikes.createdAt))
    .limit(normalizedLimit + 1);

  const hasNext = rows.length > normalizedLimit;
  const visible = hasNext ? rows.slice(0, normalizedLimit) : rows;

  let likedReviewIds = new Set<number>();
  if (params.currentUserId) {
    const likedRows = await db
      .select({ reviewId: reviewLikes.reviewId })
      .from(reviewLikes)
      .where(and(eq(reviewLikes.userId, params.currentUserId), inArray(reviewLikes.reviewId, visible.map((r) => r.id))));
    likedReviewIds = new Set(likedRows.map((r) => r.reviewId));
  }

  const items: ReviewSummary[] = visible.map((row) => ({
    id: row.id,
    title: row.title,
    excerpt: createReviewExcerpt(row.content),
    rating: row.rating,
    publishedAt: (row.publishedAt ?? row.createdAt).toISOString(),
    status: row.status,
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
      viewCount: row.viewCount,
      likeCount: row.likeCount,
      commentCount: row.commentCount,
    },
    likedByCurrentUser: likedReviewIds.has(row.id),
  }));

  const nextCursor = hasNext ? encodeLikedCursor(visible[visible.length - 1].likedAt as unknown as Date, visible[visible.length - 1].id) : null;

  return { items, nextCursor };
}
export class ReviewPermissionError extends Error {}

interface CreateReviewParams extends CreateReviewInput {
  authorId: string;
}

interface UpdateReviewParams extends UpdateReviewInput {
  authorId: string;
}

interface DeleteReviewParams {
  reviewId: number;
  authorId: string;
}

interface UpdateReviewStatusParams {
  reviewId: number;
  authorId: string;
  status: ReviewStatus;
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
  currentUserId,
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
  const reviewIds = visibleRows.map((row) => row.review.id);

  let likedReviewIds = new Set<number>();

  if (currentUserId && reviewIds.length > 0) {
    const likedRows = await db
      .select({ reviewId: reviewLikes.reviewId })
      .from(reviewLikes)
      .where(and(eq(reviewLikes.userId, currentUserId), inArray(reviewLikes.reviewId, reviewIds)));

    likedReviewIds = new Set(likedRows.map((row) => row.reviewId));
  }

  const items: ReviewSummary[] = visibleRows.map((row) => ({
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
    likedByCurrentUser: likedReviewIds.has(row.review.id),
  }));

  const nextCursor = hasNextPage ? rows[limit].review.id : null;

  return { items, nextCursor };
}

export async function listReviews({
  limit,
  cursor,
  currentUserId,
  filters,
}: ListReviewsParams): Promise<ListReviewsResult> {
  const normalizedLimit = Math.min(Math.max(limit, 1), 50);
  const normalizedQuery = normalizeReviewSearchQuery(filters?.query);
  const statusFilter = filters?.status;
  const statusValues = Array.isArray(statusFilter)
    ? statusFilter
    : statusFilter
      ? [statusFilter]
      : [];

  const rows = await db.query.reviews.findMany({
    where: (reviewsTable, { and, eq, inArray: inArrayOp, lt }) => {
      const conditions: SQL[] = [];

      if (cursor) {
        conditions.push(lt(reviewsTable.id, cursor));
      }

      if (filters?.authorId) {
        conditions.push(eq(reviewsTable.authorId, filters.authorId));
      }

      if (filters?.carId) {
        conditions.push(eq(reviewsTable.carId, filters.carId));
      }

      if (statusValues.length > 0) {
        const statusCondition =
          statusValues.length === 1
            ? eq(reviewsTable.status, statusValues[0])
            : inArrayOp(reviewsTable.status, statusValues);

        conditions.push(statusCondition);
      }

      if (normalizedQuery) {
        const pattern = createReviewSearchPattern(normalizedQuery);
        conditions.push(
          sql`${reviewsTable.title} ILIKE ${pattern} OR ${reviewsTable.content} ILIKE ${pattern}`,
        );
      }

      if (conditions.length === 0) {
        return undefined;
      }

      let combined: SQL | undefined;

      for (const condition of conditions) {
        combined = combined ? and(combined, condition) : condition;
      }

      return combined;
    },
    orderBy: (reviewsTable, { desc: descOp }) => [descOp(reviewsTable.id)],
    limit: normalizedLimit + 1,
    with: {
      author: {
        columns: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
      car: {
        columns: {
          id: true,
          make: true,
          model: true,
          year: true,
          generation: true,
        },
      },
    },
  });

  const hasNextPage = rows.length > normalizedLimit;
  const visibleRows = hasNextPage ? rows.slice(0, normalizedLimit) : rows;
  const reviewIds = visibleRows.map((row) => row.id);

  let likedReviewIds = new Set<number>();

  if (currentUserId && reviewIds.length > 0) {
    const likedRows = await db
      .select({ reviewId: reviewLikes.reviewId })
      .from(reviewLikes)
      .where(and(eq(reviewLikes.userId, currentUserId), inArray(reviewLikes.reviewId, reviewIds)));

    likedReviewIds = new Set(likedRows.map((row) => row.reviewId));
  }

  const items: ReviewSummary[] = visibleRows.map((row) => ({
    id: row.id,
    title: row.title,
    excerpt: createReviewExcerpt(row.content),
    rating: row.rating,
    publishedAt: (row.publishedAt ?? row.createdAt).toISOString(),
    status: row.status,
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
      viewCount: row.viewCount,
      likeCount: row.likeCount,
      commentCount: row.commentCount,
    },
    likedByCurrentUser: likedReviewIds.has(row.id),
  }));

  const nextCursor = hasNextPage ? rows[normalizedLimit].id : null;

  return { items, nextCursor };
}

interface ListCarReviewsParams {
	carId: number;
	limit: number;
	currentUserId?: string | null;
}

export async function listPublishedReviewsByCar({
	carId,
	limit,
	currentUserId,
}: ListCarReviewsParams) {
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

  const reviewIds = rows.map((row) => row.review.id);
  let likedReviewIds = new Set<number>();

  if (currentUserId && reviewIds.length > 0) {
	const likedRows = await db
		.select({ reviewId: reviewLikes.reviewId })
		.from(reviewLikes)
		.where(and(eq(reviewLikes.userId, currentUserId), inArray(reviewLikes.reviewId, reviewIds)));

	likedReviewIds = new Set(likedRows.map((row) => row.reviewId));
  }

  const items: ReviewSummary[] = rows.map((row) => ({
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
	likedByCurrentUser: likedReviewIds.has(row.review.id),
  }));

  return items;
}

export async function getPublishedReviewById(
  id: number,
  currentUserId?: string | null,
): Promise<ReviewDetail | null> {
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

    let likedByCurrentUser = false;

    if (currentUserId) {
      const existingLike = await tx.query.reviewLikes.findFirst({
        where: (likesTable, operators) =>
          operators.and(
            operators.eq(likesTable.reviewId, record.id),
            operators.eq(likesTable.userId, currentUserId),
          ),
      });

      likedByCurrentUser = Boolean(existingLike);
    }

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
      status: record.status,
      likedByCurrentUser,
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

export async function updateReview(params: UpdateReviewParams): Promise<ReviewUpdateResult> {
  return db.transaction(async (tx) => {
    const existing = await tx.query.reviews.findFirst({
      where: (table, { eq }) => eq(table.id, params.reviewId),
    });

    if (!existing) {
      throw new ReviewNotFoundError("Review not found");
    }

    if (existing.authorId !== params.authorId) {
      throw new ReviewPermissionError("You cannot edit this review");
    }

    const nextStatus = params.status ?? existing.status;
    let nextPublishedAt = existing.publishedAt ?? null;

    if (nextStatus === "published" && !existing.publishedAt) {
      nextPublishedAt = new Date();
    } else if (nextStatus !== "published") {
      nextPublishedAt = null;
    }

    const [updated] = await tx
      .update(reviews)
      .set({
        carId: params.carId,
        title: params.title,
        content: params.content,
        rating: params.rating,
        pros: normalizeOptionalField(params.pros ?? null),
        cons: normalizeOptionalField(params.cons ?? null),
        status: nextStatus,
        publishedAt: nextPublishedAt,
        updatedAt: new Date(),
      })
      .where(eq(reviews.id, params.reviewId))
      .returning({
        id: reviews.id,
        status: reviews.status,
        publishedAt: reviews.publishedAt,
        updatedAt: reviews.updatedAt,
      });

    await tx.delete(reviewMedia).where(eq(reviewMedia.reviewId, params.reviewId));

    if (params.media?.length) {
      await tx.insert(reviewMedia).values(
        params.media.map((item) => ({
          reviewId: params.reviewId,
          url: item.url,
          type: item.type,
          altText: normalizeOptionalField(item.altText ?? null),
          order: item.order,
        })),
      );
    }

    return {
      id: updated.id,
      status: updated.status,
      publishedAt: updated.publishedAt ? updated.publishedAt.toISOString() : null,
      updatedAt: updated.updatedAt.toISOString(),
    };
  });
}

export async function updateReviewStatus(
  params: UpdateReviewStatusParams,
): Promise<ReviewUpdateResult> {
  return db.transaction(async (tx) => {
    const existing = await tx.query.reviews.findFirst({
      where: (table, { eq }) => eq(table.id, params.reviewId),
    });

    if (!existing) {
      throw new ReviewNotFoundError("Review not found");
    }

    if (existing.authorId !== params.authorId) {
      throw new ReviewPermissionError("You cannot edit this review");
    }

    let nextPublishedAt = existing.publishedAt ?? null;

    if (params.status === "published" && !existing.publishedAt) {
      nextPublishedAt = new Date();
    } else if (params.status !== "published") {
      nextPublishedAt = null;
    }

    const [updated] = await tx
      .update(reviews)
      .set({
        status: params.status,
        publishedAt: nextPublishedAt,
        updatedAt: new Date(),
      })
      .where(eq(reviews.id, params.reviewId))
      .returning({
        id: reviews.id,
        status: reviews.status,
        publishedAt: reviews.publishedAt,
        updatedAt: reviews.updatedAt,
      });

    return {
      id: updated.id,
      status: updated.status,
      publishedAt: updated.publishedAt ? updated.publishedAt.toISOString() : null,
      updatedAt: updated.updatedAt.toISOString(),
    };
  });
}

export async function deleteReview(params: DeleteReviewParams): Promise<ReviewDeletionResult> {
  return db.transaction(async (tx) => {
    const existing = await tx.query.reviews.findFirst({
      where: (table, { eq }) => eq(table.id, params.reviewId),
    });

    if (!existing) {
      throw new ReviewNotFoundError("Review not found");
    }

    if (existing.authorId !== params.authorId) {
      throw new ReviewPermissionError("You cannot delete this review");
    }

    await tx.delete(reviewMedia).where(eq(reviewMedia.reviewId, params.reviewId));
    await tx.delete(reviews).where(eq(reviews.id, params.reviewId));

    return { id: params.reviewId };
  });
}

export async function incrementReviewViewCount(
  reviewId: number,
): Promise<IncrementReviewViewResult> {
  const [updated] = await db
    .update(reviews)
    .set({
      viewCount: sql`${reviews.viewCount} + 1`,
      updatedAt: new Date(),
    })
    .where(and(eq(reviews.id, reviewId), eq(reviews.status, "published"), isNotNull(reviews.publishedAt)))
    .returning({ viewCount: reviews.viewCount });

  if (!updated) {
    throw new ReviewNotFoundError("Review not found");
  }

  return { reviewId, viewCount: updated.viewCount };
}

interface ToggleReviewLikeParams {
  reviewId: number;
  userId: string;
}

interface ToggleReviewLikeResult {
  reviewId: number;
  likeCount: number;
  liked: boolean;
}

export async function toggleReviewLike(
  params: ToggleReviewLikeParams,
): Promise<ToggleReviewLikeResult> {
  return db.transaction(async (tx) => {
    const existingReview = await tx.query.reviews.findFirst({
      where: (table, { eq }) => eq(table.id, params.reviewId),
    });

    if (!existingReview || existingReview.status !== "published") {
      throw new ReviewNotFoundError("Review not found");
    }

    const existingLike = await tx.query.reviewLikes.findFirst({
      where: (table, operators) =>
        operators.and(
          operators.eq(table.reviewId, params.reviewId),
          operators.eq(table.userId, params.userId),
        ),
    });

    if (existingLike) {
      await tx
        .delete(reviewLikes)
        .where(and(eq(reviewLikes.reviewId, params.reviewId), eq(reviewLikes.userId, params.userId)));

      const [updated] = await tx
        .update(reviews)
        .set({
          likeCount: sql`${reviews.likeCount} - 1`,
          updatedAt: new Date(),
        })
        .where(eq(reviews.id, params.reviewId))
        .returning({ likeCount: reviews.likeCount });

      return {
        reviewId: params.reviewId,
        likeCount: updated?.likeCount ?? Math.max(existingReview.likeCount - 1, 0),
        liked: false,
      };
    }

    await tx
      .insert(reviewLikes)
      .values({
        reviewId: params.reviewId,
        userId: params.userId,
      })
      .onConflictDoNothing();

    const [updated] = await tx
      .update(reviews)
      .set({
        likeCount: sql`${reviews.likeCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(reviews.id, params.reviewId))
      .returning({ likeCount: reviews.likeCount });

    return {
      reviewId: params.reviewId,
      likeCount: updated?.likeCount ?? existingReview.likeCount + 1,
      liked: true,
    };
  });
}
