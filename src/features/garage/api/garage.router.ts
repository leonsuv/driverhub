import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/server";
import {
  addGarageCarInputSchema,
  removeGarageCarInputSchema,
  setActiveGarageCarInputSchema,
  moveGarageCarInputSchema,
  updateGarageCarInputSchema,
  listGarageModsInputSchema,
  addGarageModInputSchema,
  updateGarageModInputSchema,
  removeGarageModInputSchema,
  transferGarageCarInputSchema,
  listGarageMediaInputSchema,
  addGarageMediaInputSchema,
  removeGarageMediaInputSchema,
  reorderGarageMediaInputSchema,
} from "@/features/garage/schemas/garage-schemas";
import {
  GarageItemNotFoundError,
  GaragePermissionError,
  addGarageCar,
  listUserGarage,
  moveGarageCar,
  removeGarageCar,
  setActiveGarageCar,
  updateGarageCar,
  listGarageMods,
  addGarageMod,
  updateGarageMod,
  removeGarageMod,
  transferGarageCar,
  listGarageMedia,
  addGarageMedia,
  removeGarageMedia,
  reorderGarageMedia,
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
  move: protectedProcedure.input(moveGarageCarInputSchema).mutation(async ({ input, ctx }) => {
    try {
      return await moveGarageCar({ id: input.id, direction: input.direction, userId: ctx.user.id });
    } catch (error) {
      if (error instanceof GarageItemNotFoundError) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Garage item not found" });
      }
      if (error instanceof GaragePermissionError) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You cannot reorder this garage item" });
      }
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  // Mods
  listMods: protectedProcedure.input(listGarageModsInputSchema).query(async ({ input, ctx }) => {
    return listGarageMods({ userCarId: input.userCarId, userId: ctx.user.id });
  }),
  addMod: protectedProcedure.input(addGarageModInputSchema).mutation(async ({ input, ctx }) => {
    return addGarageMod({ userId: ctx.user.id, ...input });
  }),
  updateMod: protectedProcedure.input(updateGarageModInputSchema).mutation(async ({ input, ctx }) => {
    try {
      return await updateGarageMod({ userId: ctx.user.id, ...input });
    } catch (error) {
      if (error instanceof GarageItemNotFoundError) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Modification not found" });
      }
      if (error instanceof GaragePermissionError) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You cannot edit this modification" });
      }
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  removeMod: protectedProcedure.input(removeGarageModInputSchema).mutation(async ({ input, ctx }) => {
    try {
      return await removeGarageMod({ id: input.id, userId: ctx.user.id });
    } catch (error) {
      if (error instanceof GarageItemNotFoundError) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Modification not found" });
      }
      if (error instanceof GaragePermissionError) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You cannot delete this modification" });
      }
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  transfer: protectedProcedure.input(transferGarageCarInputSchema).mutation(async ({ input, ctx }) => {
    try {
      return await transferGarageCar({ id: input.id, targetUsername: input.targetUsername, userId: ctx.user.id });
    } catch (error) {
      if (error instanceof GarageItemNotFoundError) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Target user or garage item not found" });
      }
      if (error instanceof GaragePermissionError) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You cannot transfer this garage item" });
      }
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),
  // Gallery media
  listMedia: protectedProcedure.input(listGarageMediaInputSchema).query(async ({ input, ctx }) => {
    return listGarageMedia({ userCarId: input.userCarId, userId: ctx.user.id });
  }),
  addMedia: protectedProcedure.input(addGarageMediaInputSchema).mutation(async ({ input, ctx }) => {
    return addGarageMedia({ userId: ctx.user.id, ...input });
  }),
  removeMedia: protectedProcedure.input(removeGarageMediaInputSchema).mutation(async ({ input, ctx }) => {
    return removeGarageMedia({ id: input.id, userId: ctx.user.id });
  }),
  reorderMedia: protectedProcedure.input(reorderGarageMediaInputSchema).mutation(async ({ input, ctx }) => {
    return reorderGarageMedia({ userId: ctx.user.id, userCarId: input.userCarId, orderedIds: input.orderedIds });
  }),
});
