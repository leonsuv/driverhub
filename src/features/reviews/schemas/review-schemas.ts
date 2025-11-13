import { z } from "zod";

const optionalTextField = z
  .string()
  .trim()
  .max(2000, "Keep this under 2000 characters")
  .optional();

const mediaTypeSchema = z.enum(["image", "video"]);

const createReviewMediaInputSchema = z.object({
  url: z.string().url("Invalid media URL"),
  type: mediaTypeSchema,
  altText: z
    .string()
    .trim()
    .max(200, "Keep alt text under 200 characters")
    .nullable()
    .optional(),
  order: z.number().int().min(0),
});

const createReviewFormMediaSchema = z.object({
  url: z.string().url("Invalid media URL"),
  type: mediaTypeSchema,
  altText: z.string().trim().max(200, "Keep alt text under 200 characters").optional(),
});

const baseReviewSchema = {
  title: z.string().trim().min(5, "Title is too short").max(200, "Title is too long"),
  content: z
    .string()
    .trim()
    .min(200, "Write at least 200 characters")
    .max(20000, "Content is too long"),
  rating: z.number().int().min(1, "Minimum rating is 1").max(10, "Maximum rating is 10"),
  pros: optionalTextField,
  cons: optionalTextField,
};

export const createReviewSchema = z.object({
  ...baseReviewSchema,
  carId: z.number().int().positive("Select a car"),
  media: z.array(createReviewMediaInputSchema).max(10, "Up to 10 media items supported").optional(),
});

export const createReviewFormSchema = z.object({
  title: baseReviewSchema.title,
  content: baseReviewSchema.content,
  rating: z
    .string()
    .trim()
    .refine((value) => {
      const parsed = Number(value);
      return Number.isInteger(parsed) && parsed >= 1 && parsed <= 10;
    }, "Enter a rating between 1 and 10"),
  carId: z.string().trim().min(1, "Select a car"),
  pros: optionalTextField,
  cons: optionalTextField,
  media: z
    .array(createReviewFormMediaSchema)
    .max(10, "You can upload up to 10 media items")
    .optional(),
});

export const listReviewsInputSchema = z.object({
  limit: z.number().int().min(1).max(50).optional(),
  cursor: z.number().int().positive().optional(),
});

export const getReviewByIdSchema = z.object({
  id: z.number().int().positive(),
});

export type CreateReviewSchema = z.infer<typeof createReviewSchema>;
export type CreateReviewFormSchema = z.input<typeof createReviewFormSchema>;
export type ListReviewsInputSchema = z.infer<typeof listReviewsInputSchema>;
export type GetReviewByIdSchema = z.infer<typeof getReviewByIdSchema>;
export type CreateReviewMediaInputSchema = z.infer<typeof createReviewMediaInputSchema>;
