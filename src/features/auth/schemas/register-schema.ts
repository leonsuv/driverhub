import { z } from "zod";

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]{8,}$/;

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address")
    .transform((value) => value.toLowerCase()),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(32, "Username must be at most 32 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores are allowed"),
  displayName: z
    .string()
    .trim()
    .min(1, "Display name is required")
    .max(100, "Display name must be at most 100 characters"),
  password: z
    .string()
    .regex(
      PASSWORD_REGEX,
      "Password must be at least 8 characters and include letters and numbers",
    ),
});

export const registerFormSchema = registerSchema
  .extend({
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        path: ["confirmPassword"],
        code: "custom",
        message: "Passwords do not match",
      });
    }
  });

export type RegisterSchema = z.infer<typeof registerSchema>;
export type RegisterFormSchema = z.infer<typeof registerFormSchema>;
