import { getCarModelDetail } from "@/features/cars/infrastructure/car.repository";
import { listPublishedReviewsByCar } from "@/features/reviews/infrastructure/review.repository";
import type { CarDetailWithReviews } from "@/features/cars/types";

interface GetCarDetailWithReviewsOptions {
	reviewLimit?: number;
}

export async function getCarDetailWithReviews(
	make: string,
	model: string,
	options: GetCarDetailWithReviewsOptions = {},
): Promise<CarDetailWithReviews | null> {
	const detail = await getCarModelDetail(make, model);

	if (!detail) {
		return null;
	}

	const reviewLimit = options.reviewLimit ?? 3;
	const reviews = await listPublishedReviewsByCar({ carId: detail.latest.id, limit: reviewLimit });

	return {
		detail,
		reviews,
	};
}
