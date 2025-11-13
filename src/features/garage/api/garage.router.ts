import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/server";
import {
  addGarageCarInputSchema,
  removeGarageCarInputSchema,
  setActiveGarageCarInputSchema,
  updateGarageCarInputSchema,
} from "@/features/garage/schemas/garage-schemas";
import {
  GarageItemNotFoundError,
  GaragePermissionError,
  addGarageCar,
  listUserGarage,
  removeGarageCar,
  setActiveGarageCar,
  updateGarageCar,
} from "@/features/garage/infrastructure/garage.repository";

export const garageRouter = createTRPCRouter({
  listMine: protectedProcedure.query(async ({ ctx }) => {
    return listUserGarage(ctx.user.id);
  }),
  add: protectedProcedure.input(addGarageCarInputSchema).mutation(async ({ input, ctx }) => {
    return addGarageCar({ ...input, userId: ctx.user.id });
  }),
  update: protectedProcedure.input(updateGarageCarInputSchema).mutation(async ({ input, ctx }) => {
    try {
      return await updateGarageCar({ ...input, userId: ctx.user.id });
    } catch (error) {
      if (error instanceof GarageItemNotFoundError) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Garage item not found" });
      }
      if (error instanceof GaragePermissionError) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You cannot edit this garage item" });
      }
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  remove: protectedProcedure.input(removeGarageCarInputSchema).mutation(async ({ input, ctx }) => {
    try {
      return await removeGarageCar({ id: input.id, userId: ctx.user.id });
    } catch (error) {
      if (error instanceof GarageItemNotFoundError) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Garage item not found" });
      }
      if (error instanceof GaragePermissionError) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You cannot delete this garage item" });
      }
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  setActive: protectedProcedure.input(setActiveGarageCarInputSchema).mutation(async ({ input, ctx }) => {
    try {
      return await setActiveGarageCar({ id: input.id, userId: ctx.user.id });
    } catch (error) {
      if (error instanceof GarageItemNotFoundError) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Garage item not found" });
      }
      if (error instanceof GaragePermissionError) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You cannot update this garage item" });
      }
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
});
