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
	author: ReviewAuthorSummary;
	car: ReviewCarSummary;
	stats: ReviewStats;
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

export interface ListReviewsParams {
	limit: number;
	cursor?: number;
}

export interface ListReviewsResult {
	items: ReviewSummary[];
	nextCursor: number | null;
}
