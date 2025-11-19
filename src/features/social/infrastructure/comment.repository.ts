import { and, asc, desc, eq, inArray, lt, sql } from "drizzle-orm";

import { buildCommentTree, mapRowToCommentNode } from "@/features/social/domain/comment-tree";
import type { CommentNode } from "@/features/social/types";
import { db } from "@/lib/db";
import { commentLikes, comments, reviews, users } from "@/lib/db/schema";

export class InvalidParentCommentError extends Error {}

// Lightweight type for listing liked comments
export interface LikedCommentSummary {
  id: number;
  reviewId: number;
  content: string;
  likeCount: number;
  createdAt: string;
  author: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
}

interface ListUserLikedCommentsParams {
  userId: string;
  limit: number;
  cursor?: string | null;
}

interface ListUserLikedCommentsResult {
  items: LikedCommentSummary[];
  nextCursor: string | null;
}

function encodeCommentCursor(createdAt: Date, commentId: number) {
  return Buffer.from(`${createdAt.toISOString()}::${commentId}`).toString("base64");
}

function decodeCommentCursor(cursor?: string | null) {
  if (!cursor) return null;
  try {
    const [iso, id] = Buffer.from(cursor, "base64").toString("utf8").split("::");
    return { createdAt: new Date(iso), commentId: Number(id) };
  } catch {
    return null;
  }
}

export async function listUserLikedComments(
  params: ListUserLikedCommentsParams,
): Promise<ListUserLikedCommentsResult> {
  const normalizedLimit = Math.min(Math.max(params.limit, 1), 50);
  const decoded = decodeCommentCursor(params.cursor ?? null);

  const rows = await db
    .select({
      comment: comments,
      review: reviews,
      author: {
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
      },
      likedAt: commentLikes.createdAt,
    })
    .from(commentLikes)
    .innerJoin(comments, eq(comments.id, commentLikes.commentId))
    .innerJoin(reviews, eq(reviews.id, comments.reviewId))
    .innerJoin(users, eq(users.id, comments.authorId))
    .where(
      decoded
        ? and(eq(commentLikes.userId, params.userId), lt(commentLikes.createdAt, decoded.createdAt))
        : eq(commentLikes.userId, params.userId),
    )
    .orderBy(desc(commentLikes.createdAt))
    .limit(normalizedLimit + 1);

  const hasNext = rows.length > normalizedLimit;
  const visible = hasNext ? rows.slice(0, normalizedLimit) : rows;

  const items: LikedCommentSummary[] = visible.map((row) => ({
    id: row.comment.id,
    reviewId: row.review.id,
    content: row.comment.content,
    likeCount: row.comment.likeCount,
    createdAt: row.comment.createdAt.toISOString(),
    author: {
      id: row.author.id,
      username: row.author.username,
      displayName: row.author.displayName,
      avatarUrl: row.author.avatarUrl,
    },
  }));

  const nextCursor = hasNext
    ? encodeCommentCursor(visible[visible.length - 1].likedAt as unknown as Date, visible[visible.length - 1].comment.id)
    : null;

  return { items, nextCursor };
}
export class CommentNotFoundError extends Error {}
export class CommentPermissionError extends Error {}

interface CreateCommentInternalParams {
	reviewId: number;
	authorId: string;
	content: string;
	parentId?: number | null;
}

export async function listCommentsForReview(
	reviewId: number,
	currentUserId?: string | null,
): Promise<CommentNode[]> {
	const rows = await db
		.select({
			comment: comments,
			author: {
				id: users.id,
				username: users.username,
				displayName: users.displayName,
				avatarUrl: users.avatarUrl,
			},
		})
		.from(comments)
		.innerJoin(users, eq(users.id, comments.authorId))
		.where(eq(comments.reviewId, reviewId))
		.orderBy(asc(comments.createdAt), asc(comments.id));

	const tree = buildCommentTree(rows);

	if (!currentUserId) {
		return tree;
	}

	const commentIds = rows.map((row) => row.comment.id);

	if (commentIds.length === 0) {
		return tree;
	}

	const likedRows = await db
		.select({ commentId: commentLikes.commentId })
		.from(commentLikes)
		.where(
			and(eq(commentLikes.userId, currentUserId), inArray(commentLikes.commentId, commentIds)),
		);

	const likedIds = new Set(likedRows.map((row) => row.commentId));

	const applyLikes = (nodes: CommentNode[]) => {
		for (const node of nodes) {
			node.likedByCurrentUser = likedIds.has(node.id);
			if (node.replies.length > 0) {
				applyLikes(node.replies);
			}
		}
	};

	applyLikes(tree);

	return tree;
}

export async function createCommentForReview(
	params: CreateCommentInternalParams,
): Promise<CommentNode> {
	return db.transaction(async (tx) => {
		const parentId = params.parentId ?? null;

		if (parentId !== null) {
			const parent = await tx.query.comments.findFirst({
				where: (table, { eq }) => eq(table.id, parentId),
			});

			if (!parent || parent.reviewId !== params.reviewId) {
				throw new InvalidParentCommentError("Parent comment does not belong to this review");
			}
		}

		const [inserted] = await tx
			.insert(comments)
			.values({
				reviewId: params.reviewId,
				authorId: params.authorId,
				content: params.content,
				parentId,
			})
			.returning();

		await tx
			.update(reviews)
			.set({
				commentCount: sql`${reviews.commentCount} + 1`,
				updatedAt: new Date(),
			})
			.where(eq(reviews.id, params.reviewId));

		const author = await tx.query.users.findFirst({
			where: (table, operators) => operators.eq(table.id, params.authorId),
			columns: {
				id: true,
				username: true,
				displayName: true,
				avatarUrl: true,
			},
		});

		if (!author) {
			throw new Error("Author not found");
		}

		return mapRowToCommentNode({
			comment: inserted,
			author,
		});
	});
}

interface UpdateCommentInternalParams {
	commentId: number;
	reviewId: number;
	authorId: string;
	content: string;
}

export async function updateComment(params: UpdateCommentInternalParams): Promise<CommentNode> {
	return db.transaction(async (tx) => {
		const existing = await tx.query.comments.findFirst({
			where: (table, { eq }) => eq(table.id, params.commentId),
		});

		if (!existing || existing.reviewId !== params.reviewId) {
			throw new CommentNotFoundError("Comment not found");
		}

		if (existing.authorId !== params.authorId) {
			throw new CommentPermissionError("Only the author can edit this comment");
		}

		const [updated] = await tx
			.update(comments)
			.set({ content: params.content, isEdited: true, updatedAt: new Date() })
			.where(eq(comments.id, params.commentId))
			.returning();

		const author = await tx.query.users.findFirst({
			where: (table, { eq }) => eq(table.id, params.authorId),
			columns: {
				id: true,
				username: true,
				displayName: true,
				avatarUrl: true,
			},
		});

		if (!author) {
			throw new Error("Author not found");
		}

		return mapRowToCommentNode({
			comment: updated,
			author,
		});
	});
}

interface DeleteCommentInternalParams {
	commentId: number;
	reviewId: number;
	authorId: string;
}

export async function deleteComment(params: DeleteCommentInternalParams): Promise<void> {
	return db.transaction(async (tx) => {
		const existing = await tx.query.comments.findFirst({
			where: (table, { eq }) => eq(table.id, params.commentId),
		});

		if (!existing || existing.reviewId !== params.reviewId) {
			throw new CommentNotFoundError("Comment not found");
		}

		if (existing.authorId !== params.authorId) {
			throw new CommentPermissionError("Only the author can delete this comment");
		}

		const commentTree = await tx.query.comments.findMany({
			columns: {
				id: true,
				parentId: true,
			},
			where: (table, { eq }) => eq(table.reviewId, params.reviewId),
		});

		const idsToDelete = new Set<number>([params.commentId]);
		const stack = [params.commentId];
		const childrenByParent = new Map<number, number[]>();

		for (const node of commentTree) {
			if (node.parentId === null) {
				continue;
			}
			const siblings = childrenByParent.get(node.parentId) ?? [];
			siblings.push(node.id);
			childrenByParent.set(node.parentId, siblings);
		}

		while (stack.length > 0) {
			const current = stack.pop();

			if (current === undefined) {
				continue;
			}

			const children = childrenByParent.get(current);

			if (!children) {
				continue;
			}

			for (const childId of children) {
				if (!idsToDelete.has(childId)) {
					idsToDelete.add(childId);
					stack.push(childId);
				}
			}
		}

		await tx.delete(comments).where(inArray(comments.id, Array.from(idsToDelete)));

		await tx
			.update(reviews)
			.set({
				commentCount: sql`${reviews.commentCount} - ${idsToDelete.size}`,
				updatedAt: new Date(),
			})
			.where(eq(reviews.id, params.reviewId));
	});
}

interface ToggleCommentLikeParams {
	commentId: number;
	reviewId: number;
	userId: string;
}

interface ToggleCommentLikeResult {
	commentId: number;
	likeCount: number;
	liked: boolean;
}

export async function toggleCommentLike(
	params: ToggleCommentLikeParams,
): Promise<ToggleCommentLikeResult> {
	return db.transaction(async (tx) => {
		const existing = await tx.query.comments.findFirst({
			where: (table, { eq }) => eq(table.id, params.commentId),
		});

		if (!existing || existing.reviewId !== params.reviewId) {
			throw new CommentNotFoundError("Comment not found");
		}

		const like = await tx.query.commentLikes.findFirst({
			where: (table, operators) =>
				operators.and(
					operators.eq(table.commentId, params.commentId),
					operators.eq(table.userId, params.userId),
				),
		});

		if (like) {
			await tx
				.delete(commentLikes)
				.where(and(eq(commentLikes.commentId, params.commentId), eq(commentLikes.userId, params.userId)));

			const [updated] = await tx
				.update(comments)
				.set({
					likeCount: sql`${comments.likeCount} - 1`,
					updatedAt: new Date(),
				})
				.where(eq(comments.id, params.commentId))
				.returning({ likeCount: comments.likeCount });

			return {
				commentId: params.commentId,
				likeCount: updated?.likeCount ?? Math.max(0, existing.likeCount - 1),
				liked: false,
			};
		}

		await tx
			.insert(commentLikes)
			.values({
				commentId: params.commentId,
				userId: params.userId,
			})
			.onConflictDoNothing();

		const [updated] = await tx
			.update(comments)
			.set({
				likeCount: sql`${comments.likeCount} + 1`,
				updatedAt: new Date(),
			})
			.where(eq(comments.id, params.commentId))
			.returning({ likeCount: comments.likeCount });

		return {
			commentId: params.commentId,
			likeCount: updated?.likeCount ?? existing.likeCount + 1,
			liked: true,
		};
	});
}
