"use client";

import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
	commentContentSchema,
	type CommentContentInput,
} from "@/features/social/schemas/comment-schemas";

interface CommentFormProps {
	onSubmit: (values: CommentContentInput) => Promise<void> | void;
	submitting?: boolean;
	submitLabel?: string;
	placeholder?: string;
	autoFocus?: boolean;
	onCancel?: () => void;
	showCancel?: boolean;
	initialContent?: string;
}

export function CommentForm({
	onSubmit,
	submitting = false,
	submitLabel = "Post comment",
	placeholder = "Share your thoughts...",
	autoFocus = false,
	onCancel,
	showCancel = false,
 	initialContent = "",
}: CommentFormProps) {
	const form = useForm<CommentContentInput>({
		resolver: zodResolver(commentContentSchema),
		defaultValues: {
			content: initialContent,
		},
	});

	useEffect(() => {
		form.reset({ content: initialContent });
	}, [form, initialContent]);

	const handleSubmit = form.handleSubmit(async (values) => {
		try {
			await onSubmit(values);
			form.reset({ content: "" });
		} catch (error) {
			// Preserve form values on error so the user can retry without retyping
			void error;
		}
	});

	return (
		<Form {...form}>
			<form onSubmit={handleSubmit} className="space-y-3">
				<FormField
					control={form.control}
					name="content"
					render={({ field }) => (
						<FormItem>
							<FormControl>
								<Textarea
									{...field}
									placeholder={placeholder}
									rows={showCancel ? 4 : 3}
									autoFocus={autoFocus}
									disabled={submitting}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className="flex items-center gap-2">
					<Button type="submit" size="sm" disabled={submitting}>
						{submitting ? "Posting..." : submitLabel}
					</Button>
					{showCancel && onCancel ? (
						<Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={submitting}>
							Cancel
						</Button>
					) : null}
				</div>
			</form>
		</Form>
	);
}
