import { useCallback } from "react";

import { trpc } from "@/lib/trpc/client";

export function useCommentMutations(reviewId: number) {
	const utils = trpc.useUtils();

	const createMutation = trpc.social.comments.create.useMutation({
		onSuccess: async () => {
			await utils.social.comments.listByReview.invalidate({ reviewId });
		},
	});

	const updateMutation = trpc.social.comments.update.useMutation({
		onSuccess: async () => {
			await utils.social.comments.listByReview.invalidate({ reviewId });
		},
	});

	const deleteMutation = trpc.social.comments.delete.useMutation({
		onSuccess: async () => {
			await utils.social.comments.listByReview.invalidate({ reviewId });
		},
	});

	const toggleLikeMutation = trpc.social.comments.toggleLike.useMutation({
		onSuccess: async () => {
			await utils.social.comments.listByReview.invalidate({ reviewId });
		},
	});

	const createComment = useCallback(
		async (content: string, parentId?: number | null) => {
			await createMutation.mutateAsync({
				reviewId,
				content,
				parentId: parentId ?? undefined,
			});
		},
		[createMutation, reviewId],
	);

	const updateComment = useCallback(
		async (commentId: number, content: string) => {
			await updateMutation.mutateAsync({
				commentId,
				reviewId,
				content,
			});
		},
		[reviewId, updateMutation],
	);

	const deleteCommentById = useCallback(
		async (commentId: number) => {
			await deleteMutation.mutateAsync({
				commentId,
				reviewId,
			});
		},
		[deleteMutation, reviewId],
	);

	const toggleCommentLike = useCallback(
		async (commentId: number) => {
			await toggleLikeMutation.mutateAsync({
				commentId,
				reviewId,
			});
		},
		[reviewId, toggleLikeMutation],
	);

	return {
		createComment,
		updateComment,
		deleteComment: deleteCommentById,
		createMutation,
		updateMutation,
		deleteMutation,
		toggleLike: toggleCommentLike,
		toggleLikeMutation,
	};
}
