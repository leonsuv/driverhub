export interface CommentAuthor {
	id: string;
	username: string;
	displayName: string;
	avatarUrl: string | null;
}

export interface CommentNode {
	id: number;
	reviewId: number;
	parentId: number | null;
	content: string;
	likeCount: number;
	likedByCurrentUser: boolean;
	isEdited: boolean;
	createdAt: string;
	updatedAt: string;
	author: CommentAuthor;
	replies: CommentNode[];
}

export interface CreateCommentParams {
	reviewId: number;
	content: string;
	parentId?: number | null;
}

export interface CommentUpdateParams {
	commentId: number;
	reviewId: number;
	content: string;
}

export interface CommentDeletionParams {
	commentId: number;
	reviewId: number;
}
export {};
