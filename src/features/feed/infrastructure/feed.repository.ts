import {
  listLatestPublishedReviews,
} from "@/features/reviews/infrastructure/review.repository";
import { ListReviewsParams, ListReviewsResult } from "@/features/reviews/types";

export async function getLatestFeed(params: ListReviewsParams): Promise<ListReviewsResult> {
  return listLatestPublishedReviews(params);
}
