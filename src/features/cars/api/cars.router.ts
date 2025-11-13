import { TRPCError } from "@trpc/server";

import { getCarDetailWithReviews } from "@/features/cars/domain/car-detail.service";
import { listCars } from "@/features/cars/infrastructure/car.repository";
import { carDetailInputSchema, listCarsInputSchema } from "@/features/cars/schemas/car-schemas";
import { createTRPCRouter, publicProcedure } from "@/lib/trpc/server";

export const carsRouter = createTRPCRouter({
  list: publicProcedure
    .input(listCarsInputSchema.optional())
    .query(async ({ input }) => {
      const limit = Math.min(Math.max(input?.limit ?? 12, 1), 50);
      const cursor = input?.cursor;
      const query = input?.query?.trim();

      return listCars({
        limit,
        cursor,
        query: query && query.length > 0 ? query : undefined,
      });
    }),
  detail: publicProcedure.input(carDetailInputSchema).query(async ({ input }) => {
    const result = await getCarDetailWithReviews(input.make, input.model, {
      reviewLimit: input.reviewLimit ?? 5,
    });

    if (!result) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    return result;
  }),
});
