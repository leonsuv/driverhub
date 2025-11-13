"use client";

import { useMemo, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CommentActions } from "@/features/social/components/comment-actions";
import type { CommentNode } from "@/features/social/types";
import { formatRelativeDate } from "@/lib/utils/date";

interface CommentItemProps {
	comment: CommentNode;
	depth?: number;
	canReply: boolean;
	onReply: (content: string, parentId: number) => Promise<void>;
	onEdit: (commentId: number, content: string) => Promise<void>;
	onDelete: (commentId: number) => Promise<void>;
	onToggleLike: (commentId: number) => Promise<void>;
	isSubmitting?: boolean;
	isLiking?: boolean;
	currentUserId?: string | null;
}

export function CommentItem({
	comment,
	depth = 0,
	canReply,
	onReply,
	onEdit,
	onDelete,
	onToggleLike,
	isSubmitting = false,
	isLiking = false,
	currentUserId,
}: CommentItemProps) {
	const [isReplying, setIsReplying] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [replyError, setReplyError] = useState<string | null>(null);
	const [deleteError, setDeleteError] = useState<string | null>(null);
	const [editError, setEditError] = useState<string | null>(null);
	const [likeError, setLikeError] = useState<string | null>(null);

	const canModify = useMemo(() => currentUserId === comment.author.id, [comment.author.id, currentUserId]);
	const canLike = Boolean(currentUserId);

	const handleReplySubmit = async (content: string) => {
		try {
			setReplyError(null);
			await onReply(content, comment.id);
			setIsReplying(false);
		} catch (error) {
			setReplyError("Failed to post reply. Please try again.");
			throw error;
		}
	};

	const handleEditSubmit = async (content: string) => {
		try {
			setEditError(null);
			await onEdit(comment.id, content);
			setIsEditing(false);
		} catch (error) {
			setEditError("Failed to update comment. Please try again.");
			throw error;
		}
	};

	const handleToggleLike = async () => {
		if (!canLike) {
			setLikeError("Sign in to like comments.");
			return;
		}

		if (isLiking) {
			return;
		}

		try {
			setLikeError(null);
			await onToggleLike(comment.id);
		} catch {
			setLikeError("Failed to update like. Please try again.");
		}
	};

	const handleDelete = async () => {
		setDeleteError(null);
		try {
			await onDelete(comment.id);
		} catch {
			setDeleteError("Failed to delete comment. Please try again.");
		}
	};

	return (
		<div className="space-y-3">
			<div className="flex gap-3">
				<Avatar className="h-10 w-10">
					<AvatarImage src={comment.author.avatarUrl ?? undefined} alt={comment.author.displayName} />
					<AvatarFallback>
						{comment.author.displayName.charAt(0).toUpperCase()}
					</AvatarFallback>
				</Avatar>
				<div className="flex-1 space-y-2">
					<div className="flex flex-wrap items-center gap-2">
						<p className="font-medium text-sm text-foreground">{comment.author.displayName}</p>
						<p className="text-muted-foreground text-xs">
							@{comment.author.username} • {formatRelativeDate(comment.createdAt)}
						</p>
					</div>
					{isEditing ? (
						<div className="space-y-2">
							<CommentActions
								mode="edit"
								onSubmit={handleEditSubmit}
								onCancel={() => setIsEditing(false)}
								submitting={isSubmitting}
								initialValue={comment.content}
							/>
							{editError ? <p className="text-xs text-destructive">{editError}</p> : null}
						</div>
					) : (
						<p className="text-sm leading-relaxed text-foreground whitespace-pre-line">{comment.content}</p>
					)}
					<div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
						<div className="flex items-center gap-2">
							<Button
								variant={comment.likedByCurrentUser ? "secondary" : "ghost"}
								size="sm"
								onClick={handleToggleLike}
								disabled={!canLike || isLiking}
								aria-pressed={comment.likedByCurrentUser}
								type="button"
							>
								{comment.likedByCurrentUser ? "Liked" : "Like"}
							</Button>
							<span className="text-xs text-muted-foreground">{comment.likeCount}</span>
						</div>
						{canReply ? (
							<>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => {
										setReplyError(null);
										setIsReplying((value) => !value);
									}}
									disabled={isSubmitting}
								>
									{isReplying ? "Cancel" : "Reply"}
								</Button>
								{canModify ? (
									<>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => {
												setEditError(null);
												setIsEditing(true);
											}}
											disabled={isSubmitting || isEditing}
										>
											Edit
										</Button>
										<Button
											variant="ghost"
											size="sm"
											onClick={handleDelete}
											disabled={isSubmitting}
										>
											Delete
										</Button>
									</>
								) : null}
							</>
						) : null}
					</div>
					{deleteError ? <p className="text-xs text-destructive">{deleteError}</p> : null}
					{likeError ? <p className="text-xs text-destructive">{likeError}</p> : null}
					{isReplying ? (
						<div className="rounded-lg border bg-muted/40 p-3">
							<CommentActions
								mode="reply"
								onSubmit={handleReplySubmit}
								onCancel={() => setIsReplying(false)}
								submitting={isSubmitting}
							/>
							{replyError ? <p className="mt-2 text-xs text-destructive">{replyError}</p> : null}
						</div>
					) : null}
				</div>
			</div>
			{comment.replies.length > 0 ? (
				<div className="space-y-4 border-l border-border/60 pl-6">
					{comment.replies.map((reply) => (
						<CommentItem
							key={reply.id}
							comment={reply}
							depth={depth + 1}
							canReply={canReply}
							onReply={onReply}
							onEdit={onEdit}
							onDelete={onDelete}
							onToggleLike={onToggleLike}
							isSubmitting={isSubmitting}
							isLiking={isLiking}
							currentUserId={currentUserId}
						/>
					))}
				</div>
			) : null}
		</div>
	);
}
