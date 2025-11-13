import type { ReviewSummary } from "@/features/reviews/types";

export interface CarSummary {
	id: number;
	make: string;
	model: string;
	year: number;
	generation: string | null;
}

export interface CarSpecs {
	body?: string;
	drivetrain?: string;
	powertrain?: string;
}

export interface CarListItem extends CarSummary {
	imageUrl: string | null;
	specs: CarSpecs | null;
}

export interface CarModelDetail {
	make: string;
	model: string;
	latest: CarListItem;
	variants: CarListItem[];
}

export interface CarDetailWithReviews {
	detail: CarModelDetail;
	reviews: ReviewSummary[];
}

export interface ListCarsParams {
	limit: number;
	cursor?: number;
	query?: string;
}

export interface ListCarsResult {
	items: CarListItem[];
	nextCursor: number | null;
}

export type CarOption = CarSummary;
