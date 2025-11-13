import type { CommentNode } from "@/features/social/types";
import { comments, users } from "@/lib/db/schema";

export type CommentRecord = typeof comments.$inferSelect;
export type UserRecord = typeof users.$inferSelect;

export interface CommentRow {
	comment: CommentRecord;
	author: Pick<UserRecord, "id" | "username" | "displayName" | "avatarUrl">;
}

export function mapRowToCommentNode(row: CommentRow): CommentNode {
	return {
		id: row.comment.id,
		reviewId: row.comment.reviewId,
		parentId: row.comment.parentId ?? null,
		content: row.comment.content,
		likeCount: row.comment.likeCount,
		likedByCurrentUser: false,
		isEdited: row.comment.isEdited,
		createdAt: row.comment.createdAt.toISOString(),
		updatedAt: row.comment.updatedAt.toISOString(),
		author: {
			id: row.author.id,
			username: row.author.username,
			displayName: row.author.displayName ?? row.author.username,
			avatarUrl: row.author.avatarUrl ?? null,
		},
		replies: [],
	};
}

export function buildCommentTree(rows: CommentRow[]): CommentNode[] {
	const nodes = new Map<number, CommentNode>();
	const pendingChildren = new Map<number, CommentNode[]>();
	const roots: CommentNode[] = [];

	for (const row of rows) {
		const node = mapRowToCommentNode(row);
		nodes.set(node.id, node);

		const queuedChildren = pendingChildren.get(node.id);
		if (queuedChildren) {
			node.replies.push(...queuedChildren);
			pendingChildren.delete(node.id);
		}

		if (node.parentId) {
			const parentNode = nodes.get(node.parentId);
			if (parentNode) {
				parentNode.replies.push(node);
			} else {
				const siblings = pendingChildren.get(node.parentId) ?? [];
				siblings.push(node);
				pendingChildren.set(node.parentId, siblings);
			}
		} else {
			roots.push(node);
		}
	}

	return roots;
}
