import { z } from "zod";

// Mirrors apps/api's AccountName value object
// (src/modules/account/domain/value-objects/account-name.ts) — that's the
// single source of truth, kept in sync by hand since there's no shared
// codegen between the two apps.
const ACCOUNT_NAME_MAX = 100;
const ACCOUNT_NAME_WORDS_PATTERN = /^\S{2,}(\s+\S{2,})+$/;

// Stricter than the backend (which only requires min 8 chars) — a frontend
// requiring more than the API does is always safe, never rejected server-side.
export const PASSWORD_STRENGTH_RULES = [
  { label: "8+ characters", test: (v: string) => v.length >= 8 },
  { label: "One uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { label: "One number", test: (v: string) => /[0-9]/.test(v) },
  { label: "One special character", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

export const registerSchema = z
  .object({
    name: z
      .string()
      .max(ACCOUNT_NAME_MAX)
      .regex(
        ACCOUNT_NAME_WORDS_PATTERN,
        "must contain at least two words with at least 2 characters each",
      ),
    email: z.email(),
    password: z
      .string()
      .refine((v) => PASSWORD_STRENGTH_RULES.every((rule) => rule.test(v)), "password is too weak"),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "passwords don't match",
    path: ["confirm_password"],
  });

export type RegisterSchema = z.infer<typeof registerSchema>;
