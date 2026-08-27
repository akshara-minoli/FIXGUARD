import { z } from "zod";

const emailSchema = z
  .string({ error: "Email is required" })
  .trim()
  .email("Email must be valid")
  .max(255, "Email must not exceed 255 characters")
  .transform((email) => email.toLowerCase());

export const registerSchema = z
  .object({
    name: z
      .string({ error: "Name is required" })
      .trim()
      .min(2, "Name must contain at least 2 characters")
      .max(120, "Name must not exceed 120 characters"),
    email: emailSchema,
    password: z
      .string({ error: "Password is required" })
      .min(8, "Password must contain at least 8 characters")
      .max(72, "Password must not exceed 72 characters")
      .regex(/[a-z]/, "Password must contain a lowercase letter")
      .regex(/[A-Z]/, "Password must contain an uppercase letter")
      .regex(/[0-9]/, "Password must contain a number"),
  })
  .strict();

export const loginSchema = z
  .object({
    email: emailSchema.optional(),
    identifier: z
      .string()
      .trim()
      .min(1, "Identifier is required")
      .max(255, "Identifier must not exceed 255 characters")
      .transform((identifier) => identifier.toLowerCase())
      .optional(),
    password: z.string({ error: "Password is required" }).min(1, "Password is required"),
  })
  .refine((data) => Boolean(data.email || data.identifier), {
    message: "Email or identifier is required",
    path: ["identifier"],
  })
  .refine((data) => !(data.email && data.identifier), {
    message: "Provide either email or identifier, not both",
    path: ["identifier"],
  })
  .strict();

export const updateProfileSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must contain at least 2 characters")
      .max(120, "Name must not exceed 120 characters")
      .optional(),
    phoneNumber: z
      .string()
      .trim()
      .min(7, "Phone number must contain at least 7 characters")
      .max(25, "Phone number must not exceed 25 characters")
      .regex(/^[+0-9() .-]+$/, "Phone number contains invalid characters")
      .nullable()
      .optional(),
    profileImageUrl: z
      .string()
      .trim()
      .url("Profile image URL must be valid")
      .max(2048, "Profile image URL must not exceed 2048 characters")
      .nullable()
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one profile field to update",
  })
  .strict();
