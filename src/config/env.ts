import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  UPLOAD_DIR: z.string().min(1),
  MAX_FILE_SIZE: z.coerce.number().positive(),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  UPLOAD_DIR: process.env.UPLOAD_DIR,
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE,
});
