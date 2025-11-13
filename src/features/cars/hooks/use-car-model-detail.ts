import { trpc } from "@/lib/trpc/client";

interface UseCarModelDetailOptions {
	reviewLimit?: number;
	enabled?: boolean;
}

export function useCarModelDetail(make: string, model: string, options: UseCarModelDetailOptions = {}) {
	return trpc.cars.detail.useQuery(
		{ make, model, reviewLimit: options.reviewLimit },
		{ enabled: options.enabled ?? Boolean(make && model) },
	);
}
