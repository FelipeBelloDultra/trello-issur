import { zodResolver } from "@hookform/resolvers/zod";
import { Check, X } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { ApiError } from "@/shared/api";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { PasswordInput } from "@/shared/ui/password-input";

import { useRegister } from "../model/use-register";

// Mirrors apps/api's AccountName value object
// (src/modules/account/domain/value-objects/account-name.ts) — that's the
// single source of truth, kept in sync by hand since there's no shared
// codegen between the two apps.
const ACCOUNT_NAME_MAX = 100;
const ACCOUNT_NAME_WORDS_PATTERN = /^\S{2,}(\s+\S{2,})+$/;

// Stricter than the backend (which only requires min 8 chars) — a frontend
// requiring more than the API does is always safe, never rejected server-side.
const PASSWORD_STRENGTH_RULES = [
  { label: "8+ characters", test: (v: string) => v.length >= 8 },
  { label: "One uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { label: "One number", test: (v: string) => /[0-9]/.test(v) },
  { label: "One special character", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

const registerSchema = z
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
    create_workspace: z.boolean(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "passwords don't match",
    path: ["confirm_password"],
  });

type RegisterSchema = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSuccess?: (input: RegisterSchema) => void;
}

interface PasswordStrengthHintsProps {
  password: string;
  confirmPassword: string;
}

function PasswordStrengthHints({ password, confirmPassword }: PasswordStrengthHintsProps) {
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
      {PASSWORD_STRENGTH_RULES.map((rule) => {
        const passed = rule.test(password);
        return (
          <li
            key={rule.label}
            className={cn(
              "flex items-center gap-1 text-xs",
              passed ? "text-emerald-500" : "text-muted-foreground",
            )}
          >
            {passed ? <Check className="size-3" /> : <X className="size-3" />}
            {rule.label}
          </li>
        );
      })}
      <li
        className={cn(
          "flex items-center gap-1 text-xs",
          passwordsMatch ? "text-emerald-500" : "text-muted-foreground",
        )}
      >
        {passwordsMatch ? <Check className="size-3" /> : <X className="size-3" />}
        Passwords match
      </li>
    </ul>
  );
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const register = useRegister();
  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirm_password: "",
      create_workspace: true,
    },
  });
  const password = useWatch({ control: form.control, name: "password" });
  const confirmPassword = useWatch({ control: form.control, name: "confirm_password" });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      // confirm_password only exists to validate a match client-side — the
      // API doesn't accept it.
      await register.mutateAsync({
        name: values.name,
        email: values.email,
        password: values.password,
        create_workspace: values.create_workspace,
      });
      onSuccess?.(values);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Could not create your account";
      form.setError("root", { message });
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={(e) => void onSubmit(e)} className="w-full space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input type="text" autoComplete="name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput autoComplete="new-password" {...field} />
              </FormControl>
              <PasswordStrengthHints password={password} confirmPassword={confirmPassword} />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirm_password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm password</FormLabel>
              <FormControl>
                <PasswordInput autoComplete="new-password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="create_workspace"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start gap-2 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="mt-0.5"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="font-normal">Create a workspace for me</FormLabel>
                <FormDescription>
                  Otherwise you&apos;ll name and create your own right after signing up.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        {form.formState.errors.root ? (
          <p className="text-destructive text-sm">{form.formState.errors.root.message}</p>
        ) : null}
        <Button type="submit" className="w-full" disabled={register.isPending}>
          {register.isPending ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </Form>
  );
}
