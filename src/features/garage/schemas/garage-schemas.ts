import { z } from "zod";

const safeUrl = z
  .string()
  .trim()
  .refine((v) => v === "" || v.startsWith("/") || /^https?:\/\//i.test(v), {
    message: "Invalid URL",
  });

export const addGarageCarInputSchema = z.object({
  carId: z.number().int().positive(),
  nickname: z.string().trim().max(100).optional(),
  purchaseDate: z.string().optional(),
  mileage: z.number().int().min(0).optional(),
  modifications: z.string().trim().optional(),
  imageUrl: safeUrl.optional(),
  vin: z.string().trim().max(32).optional(),
  engineCode: z.string().trim().max(64).optional(),
  colorCode: z.string().trim().max(64).optional(),
  trim: z.string().trim().max(100).optional(),
  status: z.enum(["daily", "project", "sold", "wrecked", "hidden"]).optional(),
});

export const updateGarageCarInputSchema = z.object({
  id: z.number().int().positive(),
  nickname: z.string().trim().max(100).optional(),
  purchaseDate: z.string().optional(),
  mileage: z.number().int().min(0).optional(),
  modifications: z.string().trim().optional(),
  imageUrl: safeUrl.optional(),
  isActive: z.boolean().optional(),
  vin: z.string().trim().max(32).optional(),
  engineCode: z.string().trim().max(64).optional(),
  colorCode: z.string().trim().max(64).optional(),
  trim: z.string().trim().max(100).optional(),
  status: z.enum(["daily", "project", "sold", "wrecked", "hidden"]).optional(),
});

export const removeGarageCarInputSchema = z.object({
  id: z.number().int().positive(),
});

export const setActiveGarageCarInputSchema = z.object({
  id: z.number().int().positive(),
});

export const moveGarageCarInputSchema = z.object({
  id: z.number().int().positive(),
  direction: z.enum(["up", "down"]),
});

export type AddGarageCarInputSchema = z.infer<typeof addGarageCarInputSchema>;
export type UpdateGarageCarInputSchema = z.infer<typeof updateGarageCarInputSchema>;
export type RemoveGarageCarInputSchema = z.infer<typeof removeGarageCarInputSchema>;
export type SetActiveGarageCarInputSchema = z.infer<typeof setActiveGarageCarInputSchema>;

// Mods
export const listGarageModsInputSchema = z.object({
  userCarId: z.number().int().positive(),
});

export const addGarageModInputSchema = z.object({
  userCarId: z.number().int().positive(),
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).optional(),
  installedAt: z.string().optional(),
  costCents: z.number().int().min(0).optional(),
  partUrl: z.string().url().optional(),
});

export const updateGarageModInputSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(2000).optional(),
  installedAt: z.string().optional(),
  costCents: z.number().int().min(0).optional(),
  partUrl: z.string().url().optional(),
});

export const removeGarageModInputSchema = z.object({
  id: z.number().int().positive(),
});

export type ListGarageModsInputSchema = z.infer<typeof listGarageModsInputSchema>;
export type AddGarageModInputSchema = z.infer<typeof addGarageModInputSchema>;
export type UpdateGarageModInputSchema = z.infer<typeof updateGarageModInputSchema>;
export type RemoveGarageModInputSchema = z.infer<typeof removeGarageModInputSchema>;

// Transfer ownership
export const transferGarageCarInputSchema = z.object({
  id: z.number().int().positive(),
  targetUsername: z.string().trim().min(1).max(50),
});

export type TransferGarageCarInputSchema = z.infer<typeof transferGarageCarInputSchema>;

// Gallery media
export const listGarageMediaInputSchema = z.object({
  userCarId: z.number().int().positive(),
});

export const addGarageMediaInputSchema = z.object({
  userCarId: z.number().int().positive(),
  url: safeUrl.refine((v) => v.length > 0, { message: "Invalid URL" }),
});

export const removeGarageMediaInputSchema = z.object({
  id: z.number().int().positive(),
});

export const reorderGarageMediaInputSchema = z.object({
  userCarId: z.number().int().positive(),
  orderedIds: z.array(z.number().int().positive()).min(1),
});

export type ListGarageMediaInputSchema = z.infer<typeof listGarageMediaInputSchema>;
export type AddGarageMediaInputSchema = z.infer<typeof addGarageMediaInputSchema>;
export type RemoveGarageMediaInputSchema = z.infer<typeof removeGarageMediaInputSchema>;
export type ReorderGarageMediaInputSchema = z.infer<typeof reorderGarageMediaInputSchema>;
