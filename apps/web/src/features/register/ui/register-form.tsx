import { zodResolver } from "@hookform/resolvers/zod";
import { Check, X } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";

import { useFormErrors } from "@/shared/lib/hooks";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { PasswordInput } from "@/shared/ui/password-input";

import {
  PASSWORD_STRENGTH_RULES,
  registerSchema,
  type RegisterSchema,
} from "../model/register-schema";
import { useRegister } from "../model/use-register";

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
    },
  });
  const password = useWatch({ control: form.control, name: "password" });
  const confirmPassword = useWatch({ control: form.control, name: "confirm_password" });
  const { handleApiError } = useFormErrors(form);

  const onSubmit = form.handleSubmit(async (values) => {
    // Field-scoped errors (422) land on the matching input via
    // useFormErrors; anything else (e.g. "email already taken") surfaces
    // via the global mutation-error toast (see app/query-client.ts).
    try {
      // confirm_password only exists to validate a match client-side — the
      // API doesn't accept it.
      await register.mutateAsync({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      onSuccess?.(values);
    } catch (err) {
      handleApiError(err);
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
        <Button type="submit" className="w-full" disabled={register.isPending}>
          {register.isPending ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </Form>
  );
}
