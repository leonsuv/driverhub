import { z } from "zod";

export const listCarsInputSchema = z
  .object({
    limit: z.number().int().min(1).max(50).optional(),
    cursor: z.number().int().positive().optional(),
    query: z.string().trim().max(100, "Search query is too long").optional(),
  })
  .refine(
    (value) => {
      if (!value.query) {
        return true;
      }

      return value.query.trim().length > 0;
    },
    {
      path: ["query"],
      message: "Enter a search term or leave it blank",
    },
  );

export type ListCarsInputSchema = z.infer<typeof listCarsInputSchema>;

export const carDetailInputSchema = z.object({
	make: z.string().trim().min(1, "Make is required").max(100),
	model: z.string().trim().min(1, "Model is required").max(120),
	reviewLimit: z.number().int().min(1).max(12).optional(),
});

export type CarDetailInputSchema = z.infer<typeof carDetailInputSchema>;
