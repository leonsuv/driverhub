import { z } from "zod";

export const addGarageCarInputSchema = z.object({
  carId: z.number().int().positive(),
  nickname: z.string().trim().max(100).optional(),
  purchaseDate: z.string().optional(),
  mileage: z.number().int().min(0).optional(),
  modifications: z.string().trim().optional(),
  imageUrl: z.string().url().optional(),
});

export const updateGarageCarInputSchema = z.object({
  id: z.number().int().positive(),
  nickname: z.string().trim().max(100).optional(),
  purchaseDate: z.string().optional(),
  mileage: z.number().int().min(0).optional(),
  modifications: z.string().trim().optional(),
  imageUrl: z.string().url().optional(),
  isActive: z.boolean().optional(),
});

export const removeGarageCarInputSchema = z.object({
  id: z.number().int().positive(),
});

export const setActiveGarageCarInputSchema = z.object({
  id: z.number().int().positive(),
});

export type AddGarageCarInputSchema = z.infer<typeof addGarageCarInputSchema>;
export type UpdateGarageCarInputSchema = z.infer<typeof updateGarageCarInputSchema>;
export type RemoveGarageCarInputSchema = z.infer<typeof removeGarageCarInputSchema>;
export type SetActiveGarageCarInputSchema = z.infer<typeof setActiveGarageCarInputSchema>;
