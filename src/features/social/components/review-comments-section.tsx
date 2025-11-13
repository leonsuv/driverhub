"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CommentForm } from "@/features/social/components/comment-form";
import { CommentItem } from "@/features/social/components/comment-item";
import { useCommentMutations } from "@/features/social/hooks/use-comment-mutations";
import { useReviewComments } from "@/features/social/hooks/use-review-comments";

interface CurrentUserSummary {
	id: string;
	displayName: string;
	username?: string | null;
}

interface ReviewCommentsSectionProps {
	reviewId: number;
	currentUser: CurrentUserSummary | null;
}

export function ReviewCommentsSection({ reviewId, currentUser }: ReviewCommentsSectionProps) {
	const { data, isLoading } = useReviewComments(reviewId, Boolean(reviewId));
	const {
		createComment,
		updateComment,
		deleteComment,
		createMutation,
		updateMutation,
		deleteMutation,
		toggleLike,
		toggleLikeMutation,
	} = useCommentMutations(reviewId);
	const [formError, setFormError] = useState<string | null>(null);
	const isMutating =
		createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

	const handleCreateComment = async (content: string, parentId?: number | null) => {
		if (!parentId) {
			setFormError(null);
		}
		try {
			await createComment(content, parentId);
		} catch (error) {
			if (!parentId) {
				setFormError("We couldn't post your comment. Please try again.");
			}
			throw error;
		}
	};

	return (
		<section className="space-y-6">
			<div className="space-y-1">
				<h2 className="text-xl font-semibold">Discussion</h2>
				<p className="text-muted-foreground text-sm">
					Share your ownership tips, highlight strengths, or ask questions about this review.
				</p>
			</div>
			<Separator />
			{currentUser ? (
				<div className="space-y-3">
					<p className="text-sm text-muted-foreground">
						Commenting as <span className="font-medium text-foreground">{currentUser.displayName}</span>
					</p>
					<CommentForm
						onSubmit={async ({ content }) => handleCreateComment(content)}
						submitting={createMutation.isPending}
						submitLabel="Post comment"
						placeholder="Add your comment"
					/>
					{formError ? <p className="text-xs text-destructive">{formError}</p> : null}
				</div>
			) : (
				<div className="rounded-lg border border-dashed bg-muted/40 p-6 text-center">
					<p className="text-sm text-muted-foreground">
						Sign in to join the conversation and share your experience.
					</p>
					<Button asChild className="mt-3" size="sm">
						<Link href="/login">Sign in</Link>
					</Button>
				</div>
			)}
			<Separator />
			{isLoading ? (
				<div className="space-y-3">
					{Array.from({ length: 3 }).map((_, index) => (
						<div key={index} className="space-y-2">
							<div className="flex items-center gap-3">
								<div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
								<div className="space-y-2">
									<div className="h-3 w-32 rounded bg-muted animate-pulse" />
									<div className="h-3 w-64 rounded bg-muted animate-pulse" />
								</div>
							</div>
							<div className="h-12 rounded bg-muted animate-pulse" />
						</div>
					))}
				</div>
			) : null}
			{!isLoading && data && data.length === 0 ? (
				<div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
					No comments yet. Start the conversation!
				</div>
			) : null}
			{!isLoading && data && data.length > 0 ? (
				<div className="space-y-6">
					{data.map((comment) => (
						<CommentItem
							key={comment.id}
							comment={comment}
							canReply={Boolean(currentUser)}
							onReply={(content, parentId) => handleCreateComment(content, parentId)}
							onEdit={(commentId, content) => updateComment(commentId, content)}
							onDelete={(commentId) => deleteComment(commentId)}
							onToggleLike={(commentId) => toggleLike(commentId)}
							isSubmitting={isMutating}
							isLiking={toggleLikeMutation.isPending}
							currentUserId={currentUser?.id ?? null}
						/>
					))}
				</div>
			) : null}
		</section>
	);
}
