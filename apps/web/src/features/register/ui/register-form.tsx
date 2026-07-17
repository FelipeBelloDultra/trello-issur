import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { ApiError } from "@/shared/api";
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

import { useRegister } from "../model/use-register";

// Mirrors apps/api's AccountName value object
// (src/modules/account/domain/value-objects/account-name.ts) — that's the
// single source of truth, kept in sync by hand since there's no shared
// codegen between the two apps.
const ACCOUNT_NAME_MAX = 100;
const ACCOUNT_NAME_WORDS_PATTERN = /^\S{2,}(\s+\S{2,})+$/;

const registerSchema = z.object({
  name: z
    .string()
    .max(ACCOUNT_NAME_MAX)
    .regex(
      ACCOUNT_NAME_WORDS_PATTERN,
      "must contain at least two words with at least 2 characters each",
    ),
  email: z.email(),
  password: z.string().min(8, "password must be at least 8 characters"),
  create_workspace: z.boolean(),
});

type RegisterSchema = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSuccess?: (input: RegisterSchema) => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const register = useRegister();
  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", create_workspace: true },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await register.mutateAsync(values);
      onSuccess?.(values);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Could not create your account";
      form.setError("root", { message });
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
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
                <Input type="password" autoComplete="new-password" {...field} />
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
