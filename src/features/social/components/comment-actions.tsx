"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { CommentForm } from "@/features/social/components/comment-form";

interface CommentActionsProps {
	mode: "reply" | "edit";
	onSubmit: (content: string) => Promise<void>;
	onCancel?: () => void;
	submitting?: boolean;
	initialValue?: string;
}

export function CommentActions({
	mode,
	onSubmit,
	onCancel,
	submitting = false,
	initialValue,
}: CommentActionsProps) {
	const [error, setError] = useState<string | null>(null);

	return (
		<div className="space-y-2">
			<CommentForm
				onSubmit={async ({ content }) => {
					try {
						setError(null);
						await onSubmit(content);
					} catch (reason) {
						setError("Something went wrong. Please try again.");
						throw reason;
					}
				}}
				submitLabel={mode === "reply" ? "Post reply" : "Save changes"}
				submitting={submitting}
				placeholder={mode === "reply" ? "Reply to this comment" : "Update your comment"}
				autoFocus
				showCancel={Boolean(onCancel)}
				onCancel={onCancel}
				initialContent={initialValue}
			/>
			{error ? <p className="text-xs text-destructive">{error}</p> : null}
		</div>
	);
}
