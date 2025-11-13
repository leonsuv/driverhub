export type ReviewStatus = "draft" | "published" | "archived";

export interface ReviewAuthorSummary {
	id: string;
	username: string;
	displayName: string;
	avatarUrl: string | null;
}

export interface ReviewCarSummary {
	id: number;
	make: string;
	model: string;
	year: number;
	generation: string | null;
}

export interface ReviewStats {
	viewCount: number;
	likeCount: number;
	commentCount: number;
}

export interface ReviewSummary {
	id: number;
	title: string;
	excerpt: string;
	rating: number;
	publishedAt: string;
	status: ReviewStatus;
	author: ReviewAuthorSummary;
	car: ReviewCarSummary;
	stats: ReviewStats;
	likedByCurrentUser: boolean;
	bookmarkedByCurrentUser?: boolean;
}

export interface ReviewMediaItem {
	id: number;
	url: string;
	type: "image" | "video";
	altText: string | null;
	order: number;
}

export interface CreateReviewMediaInput {
	url: string;
	type: "image" | "video";
	altText?: string | null;
	order: number;
}

export interface ReviewDetail extends ReviewSummary {
	content: string;
	pros: string | null;
	cons: string | null;
	media: ReviewMediaItem[];
}

export interface CreateReviewInput {
	carId: number;
	title: string;
	content: string;
	rating: number;
	pros?: string | null;
	cons?: string | null;
	media?: CreateReviewMediaInput[];
}

export interface UpdateReviewInput extends CreateReviewInput {
	reviewId: number;
	status?: ReviewStatus;
}

export interface ReviewListFilters {
	authorId?: string;
	carId?: number;
	status?: ReviewStatus | ReviewStatus[];
	query?: string;
}

export interface ReviewUpdateResult {
	id: number;
	status: ReviewStatus;
	publishedAt: string | null;
	updatedAt: string;
}

export interface ReviewDeletionResult {
	id: number;
}

export interface IncrementReviewViewResult {
	reviewId: number;
	viewCount: number;
}

export interface ListReviewsParams {
	limit: number;
	cursor?: number;
	currentUserId?: string | null;
	filters?: ReviewListFilters;
}

export interface ListReviewsResult {
	items: ReviewSummary[];
	nextCursor: number | null;
}
